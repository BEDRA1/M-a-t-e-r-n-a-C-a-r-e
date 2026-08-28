import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const REMINDER_TITLE = 'تذكير بتلقيحات طفلك';
const REMINDER_BODY =
  'لا تنسي متابعة جدول تلقيحات طفلك ومواعيد التطعيمات المقررة مع الطبيب أو القابلة، حتى لا يفوتك موعد مهم.';
const REPEAT_WINDOW_DAYS = 7;

/**
 * لا يوجد حاليًا جدول تلقيحات رسمي بمواعيد فردية لكل لقاح (يتطلب نموذج بيانات كامل بمواعيد
 * دقيقة لكل جرعة) — بديل أبسط بطلب صريح من العميل: تذكير عام أسبوعي لكل أم سجّلت طفلاً واحدًا
 * على الأقل. idempotent عبر فحص عدم وجود إشعار من نفس النوع لنفس المستخدمة خلال آخر 7 أيام،
 * بدل الاعتماد على مصدر مرجعي محدد (لا يوجد Reminder فردي لكل تلقيح هنا كما في AppointmentReminderScheduler).
 */
@Injectable()
export class VaccinationReminderScheduler {
  private readonly logger = new Logger(VaccinationReminderScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyVaccinationReminder(): Promise<void> {
    const mothersWithBabies = await this.prisma.user.findMany({
      where: {
        role: UserRole.mother,
        motherOfFamily: { babies: { some: {} } },
      },
      select: { id: true },
    });

    if (mothersWithBabies.length === 0) {
      return;
    }

    const windowStart = new Date(Date.now() - REPEAT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const recentlyNotified = await this.prisma.notification.findMany({
      where: {
        type: NotificationType.vaccination_reminder,
        userId: { in: mothersWithBabies.map((u) => u.id) },
        createdAt: { gte: windowStart },
      },
      select: { userId: true },
    });
    const alreadyNotifiedIds = new Set(recentlyNotified.map((n) => n.userId));

    const toNotify = mothersWithBabies.filter((u) => !alreadyNotifiedIds.has(u.id));
    if (toNotify.length === 0) {
      return;
    }

    await this.prisma.notification.createMany({
      data: toNotify.map((u) => ({
        userId: u.id,
        type: NotificationType.vaccination_reminder,
        title: REMINDER_TITLE,
        body: REMINDER_BODY,
      })),
    });

    this.logger.log(`تم إرسال ${toNotify.length} تذكير تلقيحات أسبوعي`);
  }
}
