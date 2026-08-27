import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateMoodLogDto } from './dto/create-mood-log.dto';
import { MoodService } from '../mood/mood.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

const MAX_DAY_COUNT = 40;
const ALLOWED_DAYS_WINDOWS = [7, 14, 30];
const DEFAULT_DAYS_WINDOW = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class PostpartumService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moodService: MoodService,
  ) {}

  async getCurrent(user: AuthenticatedUser) {
    const motherId = await this.resolveMotherId(user);
    const period = await this.getCurrentPeriodOrThrow(motherId);
    return { ...period, dayCount: this.computeDayCount(period.birthDate) };
  }

  // يكتب الآن في جدول MoodLog العام (مرتبط مباشرة بـuserId) بدل PostpartumMoodLog القديم،
  // مع إبقاء شرط وجود فترة نفاس حالية كبوابة دخول لهذا المسار تحديدًا.
  async addMoodLog(user: AuthenticatedUser, dto: CreateMoodLogDto) {
    const motherId = await this.resolveMotherId(user);
    await this.getCurrentPeriodOrThrow(motherId);
    return this.moodService.upsertForUser(motherId, dto);
  }

  async listMoodLogs(user: AuthenticatedUser, daysParam?: string) {
    const motherId = await this.resolveMotherId(user);
    const period = await this.getCurrentPeriodOrThrow(motherId);
    const days = this.parseDaysWindow(daysParam);

    const rollingWindowStart = new Date(Date.now() - days * MS_PER_DAY);
    const since = rollingWindowStart > period.birthDate ? rollingWindowStart : period.birthDate;
    return this.moodService.listForUser(motherId, { since });
  }

  private parseDaysWindow(daysParam?: string): number {
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

  private computeDayCount(birthDate: Date): number {
    const diffDays = Math.floor((Date.now() - birthDate.getTime()) / MS_PER_DAY) + 1;
    return Math.min(Math.max(diffDays, 1), MAX_DAY_COUNT);
  }

  private async getCurrentPeriodOrThrow(motherId: string) {
    const period = await this.prisma.postpartumPeriod.findFirst({
      where: { motherId },
      orderBy: { createdAt: 'desc' },
    });
    if (!period) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لا توجد فترة نفاس حالية — تُنشأ تلقائيًا عند إنهاء الحمل',
        en: 'No current postpartum period — created automatically when a pregnancy is completed',
      });
    }
    return period;
  }

  private async resolveMotherId(user: AuthenticatedUser): Promise<string> {
    if (user.role === 'mother') {
      return user.userId;
    }
    // الزوج يصل إلى بيانات نفاس زوجته عبر ارتباط العائلة، نفس نمط PregnancyService
    const family = await this.prisma.family.findUnique({ where: { spouseUserId: user.userId } });
    if (!family) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'أنت غير مرتبط بأي عائلة',
        en: 'You are not linked to any family',
      });
    }
    return family.motherUserId;
  }
}
