import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType, ReminderType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const REMINDER_WINDOW_HOURS = 24;

/**
 * يفحص دوريًا تذكيرات المواعيد (Reminder من نوع appointment) التي تقع خلال
 * الـ24 ساعة القادمة، وينشئ إشعارًا داخل التطبيق لكل تذكير لم يُنشأ له إشعار
 * من قبل (idempotent عبر sourceReminderId) — مرة واحدة فقط لكل تذكير.
 *
 * ملاحظة: لا يوجد حاليًا نظام حجوزات (bookings) منفصل في المشروع، لذا يُستخدم
 * Reminder من نوع appointment كمصدر بيانات "الموعد القادم".
 */
@Injectable()
export class AppointmentReminderScheduler {
  private readonly logger = new Logger(AppointmentReminderScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleUpcomingAppointments(): Promise<void> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

    const upcomingAppointments = await this.prisma.reminder.findMany({
      where: {
        type: ReminderType.appointment,
        isDone: false,
        scheduledTime: { gte: now, lte: windowEnd },
      },
    });

    for (const appointment of upcomingAppointments) {
      const alreadyNotified = await this.prisma.notification.findFirst({
        where: { sourceReminderId: appointment.id },
      });
      if (alreadyNotified) {
        continue;
      }

      await this.prisma.notification.create({
        data: {
          userId: appointment.userId,
          type: NotificationType.appointment_reminder,
          title: 'تذكير بموعد قريب',
          body: `لديك موعد "${appointment.title}" خلال أقل من 24 ساعة.`,
          sourceReminderId: appointment.id,
        },
      });

      this.logger.log(`تم إنشاء إشعار تذكير للموعد ${appointment.id}`);
    }
  }
}
