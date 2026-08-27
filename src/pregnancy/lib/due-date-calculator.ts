import { PregnancyCalcMethod } from '@prisma/client';

const FULL_TERM_DAYS = 280; // 40 أسبوعًا من تاريخ آخر دورة شهرية (Naegele's rule)
const DAYS_PER_WEEK = 7;

export interface DueDateCalcInput {
  calcMethod: PregnancyCalcMethod;
  lmpDate?: Date | null;
  conceptionDate?: Date | null;
  ultrasoundDate?: Date | null;
  ultrasoundWeeks?: number | null;
}

export interface DueDateCalcResult {
  dueDate: Date;
  effectiveLmpDate: Date;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * يوحّد كل طرق الحساب الثلاث إلى "تاريخ دورة شهرية فعلي" واحد،
 * ثم يطبّق قاعدة Naegele (LMP + 280 يومًا) لحساب تاريخ الولادة المتوقع.
 */
export function calculateDueDate(input: DueDateCalcInput): DueDateCalcResult {
  let effectiveLmpDate: Date;

  switch (input.calcMethod) {
    case PregnancyCalcMethod.lmp: {
      if (!input.lmpDate) {
        throw new Error('lmpDate is required for lmp calc method');
      }
      effectiveLmpDate = input.lmpDate;
      break;
    }
    case PregnancyCalcMethod.ovulation: {
      if (!input.conceptionDate) {
        throw new Error('conceptionDate is required for ovulation calc method');
      }
      // الإباضة/الإخصاب تحدث عادة بعد 14 يومًا من بداية الدورة
      effectiveLmpDate = addDays(input.conceptionDate, -14);
      break;
    }
    case PregnancyCalcMethod.ultrasound: {
      if (!input.ultrasoundDate || input.ultrasoundWeeks == null) {
        throw new Error(
          'ultrasoundDate and ultrasoundWeeks are required for ultrasound calc method',
        );
      }
      effectiveLmpDate = addDays(input.ultrasoundDate, -input.ultrasoundWeeks * DAYS_PER_WEEK);
      break;
    }
    default:
      throw new Error(`Unsupported calc method: ${input.calcMethod as string}`);
  }

  return { dueDate: addDays(effectiveLmpDate, FULL_TERM_DAYS), effectiveLmpDate };
}

export interface GestationalAge {
  weeks: number;
  days: number;
  totalDays: number;
  progressPercent: number;
}

export function calculateGestationalAge(
  effectiveLmpDate: Date,
  referenceDate: Date = new Date(),
): GestationalAge {
  const totalDays = Math.max(
    0,
    Math.floor((referenceDate.getTime() - effectiveLmpDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const weeks = Math.floor(totalDays / DAYS_PER_WEEK);
  const days = totalDays % DAYS_PER_WEEK;
  const progressPercent = Math.min(100, Math.round((totalDays / FULL_TERM_DAYS) * 1000) / 10);

  return { weeks, days, totalDays, progressPercent };
}
