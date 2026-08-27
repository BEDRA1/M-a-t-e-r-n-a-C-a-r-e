import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateMoodLogDto } from './dto/create-mood-log.dto';

const ALLOWED_DAYS_WINDOWS = [7, 14, 30];
const DEFAULT_DAYS_WINDOW = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class MoodService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * تسجيل واحد لكل يوم تقويمي (UTC) لكل مستخدمة — استدعاء ثانٍ في نفس اليوم يُحدِّث
   * التسجيل الموجود بدل إنشاء صف مكرر، عبر upsert على القيد الفريد (userId, logDate).
   * مُستخدَمة من مسارين: /mood-logs العام، وPostpartumService (للأم عبر الزوج أيضًا).
   */
  async upsertForUser(userId: string, dto: CreateMoodLogDto) {
    const logDate = this.getTodayUtcDate();
    return this.prisma.moodLog.upsert({
      where: { userId_logDate: { userId, logDate } },
      update: { moodLevel: dto.moodLevel, notes: dto.notes },
      create: { userId, logDate, moodLevel: dto.moodLevel, notes: dto.notes },
    });
  }

  listForUser(userId: string, options: { since?: Date } = {}) {
    return this.prisma.moodLog.findMany({
      where: {
        userId,
        ...(options.since ? { loggedAt: { gte: options.since } } : {}),
      },
      orderBy: { loggedAt: 'asc' },
    });
  }

  async listForCurrentUser(userId: string, daysParam?: string) {
    const days = this.parseDaysWindow(daysParam);
    const since = new Date(Date.now() - days * MS_PER_DAY);
    return this.listForUser(userId, { since });
  }

  create(userId: string, dto: CreateMoodLogDto) {
    return this.upsertForUser(userId, dto);
  }

  parseDaysWindow(daysParam?: string): number {
    if (!daysParam) return DEFAULT_DAYS_WINDOW;
    const parsed = Number(daysParam);
    if (!ALLOWED_DAYS_WINDOWS.includes(parsed)) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'قيمة days يجب أن تكون 7 أو 14 أو 30',
        en: 'days must be one of 7, 14, or 30',
      });
    }
    return parsed;
  }

  /** بداية اليوم الحالي بتوقيت UTC — نفس منطق حدود اليوم المستخدم في NutritionService */
  getTodayUtcDate(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }
}
