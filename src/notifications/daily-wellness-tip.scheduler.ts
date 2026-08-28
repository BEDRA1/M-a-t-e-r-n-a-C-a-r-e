import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function getDayOfYear(date: Date): number {
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diffMs = date.getTime() - startOfYear.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * نصيحة يومية واحدة (تتناوب بين الجوانب النفسي/الصحي/الغذائي عبر جدول WellnessTip، بنفس منطق
 * التناوب حسب رقم اليوم في السنة المستخدَم في DailyTipsService) تُرسَل كإشعار حقيقي لكل
 * المستخدمات (كل حسابات role=mother، بلا تمييز بين مرحلة الحمل أو النفاس أو ما بعدها — بطلب
 * صريح من العميل)، وليس فقط الحوامل. idempotent عبر فحص عدم وجود إشعار daily_tip لنفس
 * المستخدمة اليوم (تكفي هذه المطابقة لأن النصيحة محدَّدة حتمًا بتاريخ اليوم).
 */
@Injectable()
export class DailyWellnessTipScheduler {
  private readonly logger = new Logger(DailyWellnessTipScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyWellnessTip(): Promise<void> {
    const tips = await this.prisma.wellnessTip.findMany({ orderBy: { tipNumber: 'asc' } });
    if (tips.length === 0) {
      return;
    }

    const todayTip = tips[getDayOfYear(new Date()) % tips.length];

    const mothers = await this.prisma.user.findMany({
      where: { role: UserRole.mother },
      select: { id: true },
    });
    if (mothers.length === 0) {
      return;
    }

    const todayStart = startOfTodayUtc();
    const alreadySentToday = await this.prisma.notification.findMany({
      where: {
        type: NotificationType.daily_tip,
        userId: { in: mothers.map((u) => u.id) },
        createdAt: { gte: todayStart },
      },
      select: { userId: true },
    });
    const alreadySentIds = new Set(alreadySentToday.map((n) => n.userId));

    const toNotify = mothers.filter((u) => !alreadySentIds.has(u.id));
    if (toNotify.length === 0) {
      return;
    }

    await this.prisma.notification.createMany({
      data: toNotify.map((u) => ({
        userId: u.id,
        type: NotificationType.daily_tip,
        title: `نصيحة اليوم — ${todayTip.category}`,
        body: todayTip.tipTextAr,
      })),
    });

    this.logger.log(`تم إرسال نصيحة اليوم (${todayTip.category}) إلى ${toNotify.length} مستخدمة`);
  }
}
