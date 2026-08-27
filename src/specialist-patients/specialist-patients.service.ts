import { HttpStatus, Injectable } from '@nestjs/common';
import { BookingStatus, PregnancyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { maskPhone } from '../common/lib/mask-phone';
import { calculateDueDate, calculateGestationalAge } from '../pregnancy/lib/due-date-calculator';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [BookingStatus.confirmed, BookingStatus.completed];

@Injectable()
export class SpecialistPatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSpecialistOrThrow(specialistUserId: string) {
    const specialist = await this.prisma.specialist.findUnique({ where: { userId: specialistUserId } });
    if (!specialist) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لم تُنشئي ملفًا مهنيًا بعد',
        en: 'You have not created a professional profile yet',
      });
    }
    return specialist;
  }

  /**
   * التحقق الأمني الجوهري لكل بيانات المريضة — لا يُعتمَد على أي specialistId قادم من
   * الـparams أو الـbody، بل يُشترط دومًا حجز مؤكد أو مكتمل فعلي بين specialistId (المُستخرَج
   * من JWT عبر getSpecialistOrThrow) وpatientUserId. غياب الحجز يعني 403 مباشرة.
   */
  async assertCanAccessPatient(specialistId: string, patientUserId: string): Promise<void> {
    const hasBooking = await this.prisma.booking.findFirst({
      where: { specialistId, userId: patientUserId, status: { in: ACTIVE_BOOKING_STATUSES } },
    });
    if (!hasBooking) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'ليس لديك صلاحية الوصول إلى بيانات هذه المريضة',
        en: "You do not have permission to access this patient's data",
      });
    }
  }

  async listPatients(specialistUserId: string) {
    const specialist = await this.getSpecialistOrThrow(specialistUserId);

    const bookings = await this.prisma.booking.findMany({
      where: { specialistId: specialist.id, status: { in: ACTIVE_BOOKING_STATUSES } },
      include: {
        user: { select: { id: true, phone: true } },
        availabilitySlot: { select: { startTime: true } },
      },
    });

    const byPatient = new Map<string, { phone: string; sessionCount: number; lastBookingAt: Date }>();
    for (const booking of bookings) {
      const slotTime = booking.availabilitySlot.startTime;
      const existing = byPatient.get(booking.userId);
      if (!existing) {
        byPatient.set(booking.userId, { phone: booking.user.phone, sessionCount: 1, lastBookingAt: slotTime });
      } else {
        existing.sessionCount += 1;
        if (slotTime > existing.lastBookingAt) existing.lastBookingAt = slotTime;
      }
    }

    const patientUserIds = [...byPatient.keys()];
    const sharingRows = await this.prisma.patientDataSharing.findMany({
      where: { specialistId: specialist.id, userId: { in: patientUserIds } },
    });
    const sharingByUser = new Map(sharingRows.map((row) => [row.userId, row]));

    return patientUserIds
      .map((userId) => {
        const info = byPatient.get(userId)!;
        const sharing = sharingByUser.get(userId);
        return {
          userId,
          maskedPhone: maskPhone(info.phone),
          sessionCount: info.sessionCount,
          lastBookingAt: info.lastBookingAt,
          sharing: {
            moodLogs: sharing?.shareMoodLogs ?? false,
            assessments: sharing?.shareAssessments ?? false,
            pregnancyData: sharing?.sharePregnancyData ?? false,
            postpartumData: sharing?.sharePostpartumData ?? false,
          },
        };
      })
      .sort((a, b) => b.lastBookingAt.getTime() - a.lastBookingAt.getTime());
  }

  async getPatientDetail(specialistUserId: string, patientUserId: string) {
    const specialist = await this.getSpecialistOrThrow(specialistUserId);
    await this.assertCanAccessPatient(specialist.id, patientUserId);

    const sharing = await this.prisma.patientDataSharing.findUnique({
      where: { userId_specialistId: { userId: patientUserId, specialistId: specialist.id } },
    });

    // استبيانات الحجز تظهر دائمًا (الاستثناء الوحيد من مبدأ "الإذن الصريح") لأن الأم
    // أرسلتها طوعًا عند الحجز مع هذه الأخصائية تحديدًا. الفلترة على questionnaireAnswers
    // != null تُنفَّذ في التطبيق لا في where (فلترة Json عبر Prisma لـ"ليس فارغًا" ملتبسة
    // بين JsonNull/DbNull)، وعدد حجوزات مريضة واحدة صغير أصلًا فلا كلفة حقيقية لذلك
    const allBookings = await this.prisma.booking.findMany({
      where: { specialistId: specialist.id, userId: patientUserId },
      include: { availabilitySlot: { select: { startTime: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const questionnaires = allBookings
      .filter((b) => b.questionnaireAnswers != null)
      .map((b) => ({
        bookingId: b.id,
        sessionDate: b.availabilitySlot.startTime,
        answers: b.questionnaireAnswers,
      }));

    const shared: {
      moodLogs?: { logDate: Date; moodLevel: number }[];
      assessments?: {
        id: string;
        totalScore: number;
        classification: string;
        takenAt: Date;
        domain: { name: string; nameAr: string };
      }[];
      pregnancy?: { weeks: number; days: number; progressPercent: number; dueDate: Date } | null;
      postpartum?: { dayCount: number; birthDate: Date } | null;
    } = {};

    if (sharing?.shareMoodLogs) {
      shared.moodLogs = await this.prisma.moodLog.findMany({
        where: { userId: patientUserId },
        orderBy: { logDate: 'desc' },
        take: 30,
        select: { logDate: true, moodLevel: true },
      });
    }

    if (sharing?.shareAssessments) {
      shared.assessments = await this.prisma.assessmentResult.findMany({
        where: { userId: patientUserId },
        orderBy: { takenAt: 'desc' },
        select: {
          id: true,
          totalScore: true,
          classification: true,
          takenAt: true,
          domain: { select: { name: true, nameAr: true } },
        },
      });
    }

    if (sharing?.sharePregnancyData) {
      const pregnancy = await this.prisma.pregnancy.findFirst({
        where: { motherId: patientUserId, status: PregnancyStatus.active },
        orderBy: { createdAt: 'desc' },
      });
      shared.pregnancy = pregnancy
        ? this.buildPregnancySummary(pregnancy)
        : null;
    }

    if (sharing?.sharePostpartumData) {
      const postpartum = await this.prisma.postpartumPeriod.findFirst({
        where: { motherId: patientUserId },
        orderBy: { createdAt: 'desc' },
      });
      shared.postpartum = postpartum
        ? { dayCount: this.computeDayCount(postpartum.birthDate), birthDate: postpartum.birthDate }
        : null;
    }

    return {
      sharingEnabled: {
        moodLogs: sharing?.shareMoodLogs ?? false,
        assessments: sharing?.shareAssessments ?? false,
        pregnancyData: sharing?.sharePregnancyData ?? false,
        postpartumData: sharing?.sharePostpartumData ?? false,
      },
      questionnaires,
      ...shared,
    };
  }

  private buildPregnancySummary(pregnancy: {
    calcMethod: import('@prisma/client').PregnancyCalcMethod;
    lmpDate: Date | null;
    conceptionDate: Date | null;
    ultrasoundDate: Date | null;
    ultrasoundWeeks: number | null;
    dueDate: Date;
  }) {
    const { effectiveLmpDate } = calculateDueDate({
      calcMethod: pregnancy.calcMethod,
      lmpDate: pregnancy.lmpDate,
      conceptionDate: pregnancy.conceptionDate,
      ultrasoundDate: pregnancy.ultrasoundDate,
      ultrasoundWeeks: pregnancy.ultrasoundWeeks,
    });
    const gestationalAge = calculateGestationalAge(effectiveLmpDate);
    return {
      weeks: gestationalAge.weeks,
      days: gestationalAge.days,
      progressPercent: gestationalAge.progressPercent,
      dueDate: pregnancy.dueDate,
    };
  }

  private computeDayCount(birthDate: Date): number {
    return Math.floor((Date.now() - birthDate.getTime()) / MS_PER_DAY) + 1;
  }
}
