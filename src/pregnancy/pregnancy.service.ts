import { HttpStatus, Injectable } from '@nestjs/common';
import { PregnancyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';
import { UpdatePregnancyDto } from './dto/update-pregnancy.dto';
import { CreateWeeklyLogDto } from './dto/create-weekly-log.dto';
import { UpdateWeeklyLogDto } from './dto/update-weekly-log.dto';
import { calculateDueDate, calculateGestationalAge } from './lib/due-date-calculator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class PregnancyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(motherId: string, dto: CreatePregnancyDto) {
    const activeExisting = await this.prisma.pregnancy.findFirst({
      where: { motherId, status: PregnancyStatus.active },
    });
    if (activeExisting) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'يوجد حمل نشط بالفعل، أنهِه قبل إنشاء حمل جديد',
        en: 'An active pregnancy already exists, end it before creating a new one',
      });
    }

    const { dueDate } = this.computeDueDate(dto);

    const pregnancy = await this.prisma.pregnancy.create({
      data: {
        motherId,
        calcMethod: dto.calcMethod,
        lmpDate: dto.lmpDate ? new Date(dto.lmpDate) : null,
        conceptionDate: dto.conceptionDate ? new Date(dto.conceptionDate) : null,
        ultrasoundDate: dto.ultrasoundDate ? new Date(dto.ultrasoundDate) : null,
        ultrasoundWeeks: dto.ultrasoundWeeks ?? null,
        dueDate,
        isFirstPregnancy: dto.isFirstPregnancy ?? null,
        previousPregnanciesCount: dto.previousPregnanciesCount ?? null,
        hasHealthCondition: dto.hasHealthCondition ?? false,
        healthConditionNote: dto.hasHealthCondition ? (dto.healthConditionNote ?? null) : null,
      },
    });

    return this.withGestationalAge(pregnancy);
  }

  async findMine(user: AuthenticatedUser) {
    const motherId = await this.resolveMotherId(user);
    const pregnancy = await this.prisma.pregnancy.findFirst({
      where: { motherId, status: PregnancyStatus.active },
      orderBy: { createdAt: 'desc' },
    });
    if (!pregnancy) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لا يوجد حمل نشط',
        en: 'No active pregnancy found',
      });
    }
    return this.withGestationalAge(pregnancy);
  }

  async update(motherId: string, dto: UpdatePregnancyDto) {
    const pregnancy = await this.prisma.pregnancy.findFirst({
      where: { motherId, status: PregnancyStatus.active },
      orderBy: { createdAt: 'desc' },
    });
    if (!pregnancy) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لا يوجد حمل نشط',
        en: 'No active pregnancy found',
      });
    }

    const merged = {
      calcMethod: dto.calcMethod ?? pregnancy.calcMethod,
      lmpDate: dto.lmpDate ?? pregnancy.lmpDate?.toISOString(),
      conceptionDate: dto.conceptionDate ?? pregnancy.conceptionDate?.toISOString(),
      ultrasoundDate: dto.ultrasoundDate ?? pregnancy.ultrasoundDate?.toISOString(),
      ultrasoundWeeks: dto.ultrasoundWeeks ?? pregnancy.ultrasoundWeeks ?? undefined,
    };

    const recalcInputsProvided =
      dto.calcMethod || dto.lmpDate || dto.conceptionDate || dto.ultrasoundDate || dto.ultrasoundWeeks;
    const dueDate = recalcInputsProvided ? this.computeDueDate(merged).dueDate : pregnancy.dueDate;

    // انتقال الحالة إلى completed يعني الولادة فعليًا — birthDate إلزامي هنا فقط،
    // وننشئ postpartum_period في نفس الـtransaction حتى لا يكتمل الحمل دون فترة نفاس مرتبطة.
    const isCompletingNow = dto.status === PregnancyStatus.completed && pregnancy.status !== PregnancyStatus.completed;
    if (isCompletingNow && !dto.birthDate) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'تاريخ الولادة (birthDate) إلزامي عند إنهاء الحمل',
        en: 'birthDate is required when completing the pregnancy',
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const pregnancyUpdated = await tx.pregnancy.update({
        where: { id: pregnancy.id },
        data: {
          calcMethod: merged.calcMethod,
          lmpDate: merged.lmpDate ? new Date(merged.lmpDate) : null,
          conceptionDate: merged.conceptionDate ? new Date(merged.conceptionDate) : null,
          ultrasoundDate: merged.ultrasoundDate ? new Date(merged.ultrasoundDate) : null,
          ultrasoundWeeks: merged.ultrasoundWeeks ?? null,
          dueDate,
          status: dto.status ?? pregnancy.status,
        },
      });

      if (isCompletingNow) {
        await tx.postpartumPeriod.create({
          data: {
            motherId,
            pregnancyId: pregnancy.id,
            birthDate: new Date(dto.birthDate!),
            deliveryType: dto.deliveryType ?? null,
            hasComplications: dto.hasComplications ?? false,
            isBreastfeeding: dto.isBreastfeeding ?? false,
            hasHealthCondition: dto.hasHealthCondition ?? false,
            healthConditionNote: dto.hasHealthCondition ? (dto.healthConditionNote ?? null) : null,
          },
        });
      }

      return pregnancyUpdated;
    });

    return this.withGestationalAge(updated);
  }

  async addWeeklyLog(user: AuthenticatedUser, dto: CreateWeeklyLogDto) {
    const motherId = await this.resolveMotherId(user);
    const pregnancy = await this.getActivePregnancyOrThrow(motherId);

    return this.prisma.pregnancyWeeklyLog.create({
      data: {
        pregnancyId: pregnancy.id,
        weekNumber: dto.weekNumber,
        weightKg: dto.weightKg,
        symptoms: dto.symptoms ?? undefined,
        notes: dto.notes,
      },
    });
  }

  async listWeeklyLogs(user: AuthenticatedUser) {
    const motherId = await this.resolveMotherId(user);
    const pregnancy = await this.getActivePregnancyOrThrow(motherId);

    return this.prisma.pregnancyWeeklyLog.findMany({
      where: { pregnancyId: pregnancy.id },
      orderBy: { weekNumber: 'asc' },
    });
  }

  async updateWeeklyLog(motherId: string, logId: string, dto: UpdateWeeklyLogDto) {
    const log = await this.getOwnedWeeklyLogOrThrow(motherId, logId);
    return this.prisma.pregnancyWeeklyLog.update({
      where: { id: log.id },
      data: {
        weightKg: dto.weightKg ?? log.weightKg,
        symptoms: dto.symptoms ?? log.symptoms ?? undefined,
        notes: dto.notes ?? log.notes,
      },
    });
  }

  async deleteWeeklyLog(motherId: string, logId: string) {
    const log = await this.getOwnedWeeklyLogOrThrow(motherId, logId);
    await this.prisma.pregnancyWeeklyLog.delete({ where: { id: log.id } });
    return { deleted: true };
  }

  async getWeekContent(weekNumber: number) {
    const content = await this.prisma.pregnancyWeekContent.findUnique({ where: { weekNumber } });
    if (!content) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لا يتوفر محتوى لهذا الأسبوع بعد',
        en: 'No content available for this week yet',
      });
    }
    return content;
  }

  private async resolveMotherId(user: AuthenticatedUser): Promise<string> {
    if (user.role === 'mother') {
      return user.userId;
    }
    // الزوج يصل إلى بيانات حمل زوجته عبر ارتباط العائلة
    const family = await this.prisma.family.findUnique({ where: { spouseUserId: user.userId } });
    if (!family) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'أنت غير مرتبط بأي عائلة',
        en: 'You are not linked to any family',
      });
    }
    return family.motherUserId;
  }

  private async getActivePregnancyOrThrow(motherId: string) {
    const pregnancy = await this.prisma.pregnancy.findFirst({
      where: { motherId, status: PregnancyStatus.active },
      orderBy: { createdAt: 'desc' },
    });
    if (!pregnancy) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لا يوجد حمل نشط',
        en: 'No active pregnancy found',
      });
    }
    return pregnancy;
  }

  private async getOwnedWeeklyLogOrThrow(motherId: string, logId: string) {
    const log = await this.prisma.pregnancyWeeklyLog.findUnique({ where: { id: logId } });
    if (!log) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'السجل الأسبوعي غير موجود',
        en: 'Weekly log not found',
      });
    }
    const pregnancy = await this.prisma.pregnancy.findUnique({ where: { id: log.pregnancyId } });
    if (!pregnancy || pregnancy.motherId !== motherId) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'ليس لديك صلاحية الوصول إلى هذا السجل',
        en: 'You do not have permission to access this log',
      });
    }
    return log;
  }

  private computeDueDate(dto: {
    calcMethod: CreatePregnancyDto['calcMethod'];
    lmpDate?: string;
    conceptionDate?: string;
    ultrasoundDate?: string;
    ultrasoundWeeks?: number;
  }) {
    try {
      return calculateDueDate({
        calcMethod: dto.calcMethod,
        lmpDate: dto.lmpDate ? new Date(dto.lmpDate) : null,
        conceptionDate: dto.conceptionDate ? new Date(dto.conceptionDate) : null,
        ultrasoundDate: dto.ultrasoundDate ? new Date(dto.ultrasoundDate) : null,
        ultrasoundWeeks: dto.ultrasoundWeeks ?? null,
      });
    } catch {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'البيانات المُدخلة غير كافية لحساب تاريخ الولادة بالطريقة المختارة',
        en: 'The provided data is insufficient to calculate the due date with the selected method',
      });
    }
  }

  private withGestationalAge<T extends { lmpDate: Date | null; conceptionDate: Date | null; ultrasoundDate: Date | null; ultrasoundWeeks: number | null; calcMethod: CreatePregnancyDto['calcMethod'] }>(
    pregnancy: T,
  ) {
    const { effectiveLmpDate } = calculateDueDate({
      calcMethod: pregnancy.calcMethod,
      lmpDate: pregnancy.lmpDate,
      conceptionDate: pregnancy.conceptionDate,
      ultrasoundDate: pregnancy.ultrasoundDate,
      ultrasoundWeeks: pregnancy.ultrasoundWeeks,
    });
    const gestationalAge = calculateGestationalAge(effectiveLmpDate);
    return { ...pregnancy, gestationalAge };
  }
}
