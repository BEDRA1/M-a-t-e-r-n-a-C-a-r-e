import { HttpStatus, Injectable } from '@nestjs/common';
import {
  BookingStatus,
  ConsultationType,
  PaymentStatus,
  Prisma,
  SpecialistStatus,
  SubscriptionStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    const slot = await this.prisma.specialistAvailability.findUnique({
      where: { id: dto.availabilitySlotId },
      include: { specialist: true },
    });
    if (!slot) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'فترة التوفر غير موجودة',
        en: 'Availability slot not found',
      });
    }
    if (slot.specialist.status !== SpecialistStatus.approved) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'هذا الأخصائي غير متاح للحجز حاليًا',
        en: 'This specialist is not currently available for booking',
      });
    }
    if (slot.isBooked) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'هذه الفترة محجوزة بالفعل',
        en: 'This slot is already booked',
      });
    }

    const reason = await this.prisma.consultationReason.findUnique({
      where: { id: dto.reasonId },
    });
    if (!reason || !reason.isActive) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'سبب الحجز غير صالح',
        en: 'Invalid consultation reason',
      });
    }

    // مرشّح لاستهلاك الحجز مجانًا عبر اشتراك نشط — يُعاد التحقق الحقيقي من الرصيد
    // ذريًا داخل الـtransaction أدناه (updateMany بشرط > 0)، فقراءة هنا مجرد اختيار
    // أفضل اشتراك محتمل، لا قرار نهائي، ولا تتأثر صحة العملية بأي سباق محتمل.
    const now = new Date();
    const activeSubscriptions = await this.prisma.userSubscription.findMany({
      where: {
        userId,
        status: SubscriptionStatus.active,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
    const unlimitedSubscription = activeSubscriptions.find((s) => s.plan.unlimitedBookings);
    const creditSubscription = activeSubscriptions.find((s) => s.bookingCreditsRemaining > 0);
    const candidateSubscription = unlimitedSubscription ?? creditSubscription ?? null;

    try {
      return await this.prisma.$transaction(async (tx) => {
        let isFreeWithSubscription = false;

        if (candidateSubscription) {
          if (candidateSubscription.plan.unlimitedBookings) {
            isFreeWithSubscription = true;
          } else {
            const decremented = await tx.userSubscription.updateMany({
              where: { id: candidateSubscription.id, bookingCreditsRemaining: { gt: 0 } },
              data: { bookingCreditsRemaining: { decrement: 1 } },
            });
            isFreeWithSubscription = decremented.count > 0;
          }
        }

        const booking = await tx.booking.create({
          data: {
            userId,
            specialistId: slot.specialistId,
            availabilitySlotId: slot.id,
            consultationType: slot.consultationType,
            reasonId: dto.reasonId,
            questionnaireAnswers: dto.questionnaireAnswers
              ? (dto.questionnaireAnswers as Prisma.InputJsonObject)
              : undefined,
            paymentMethod: isFreeWithSubscription ? undefined : dto.paymentMethod,
            ...(isFreeWithSubscription
              ? { paymentStatus: PaymentStatus.free_with_subscription }
              : {}),
          },
        });

        await tx.specialistAvailability.update({
          where: { id: slot.id },
          data: { isBooked: true },
        });

        return booking;
      });
    } catch (error) {
      // شبكة الأمان الحقيقية: لو مرّ طلبان متزامنان الفحص أعلاه معًا، القيد الفريد
      // على bookings.availability_slot_id يرفض الثاني حتمًا هنا (P2002)
      if (this.isUniqueConstraintError(error)) {
        throw new AppException(HttpStatus.CONFLICT, {
          ar: 'تم حجز هذه الفترة للتو من طرف آخر، يرجى اختيار فترة أخرى',
          en: 'This slot was just booked by someone else, please choose another one',
        });
      }
      throw error;
    }
  }

  listMine(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { specialist: true, reason: true, availabilitySlot: true, review: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForSpecialist(specialistUserId: string, status?: BookingStatus) {
    const specialist = await this.getSpecialistOrThrow(specialistUserId);
    return this.prisma.booking.findMany({
      where: { specialistId: specialist.id, ...(status ? { status } : {}) },
      include: { reason: true, availabilitySlot: true, review: true, user: { select: { id: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** أقرب 10 حجوزات confirmed مرتبة بتاريخ الموعد — للوحة الأخصائي (حجوزات اليوم/القادمة) */
  async listUpcomingForSpecialist(specialistUserId: string) {
    const specialist = await this.getSpecialistOrThrow(specialistUserId);
    return this.prisma.booking.findMany({
      where: {
        specialistId: specialist.id,
        status: BookingStatus.confirmed,
        availabilitySlot: { startTime: { gte: new Date() } },
      },
      include: { reason: true, availabilitySlot: true, user: { select: { id: true, phone: true } } },
      orderBy: { availabilitySlot: { startTime: 'asc' } },
      take: 10,
    });
  }

  async getById(id: string, requester: AuthenticatedUser) {
    const booking = await this.getBookingOrThrow(id);
    await this.assertCanView(booking, requester);
    return booking;
  }

  async updateStatus(id: string, requester: AuthenticatedUser, status: BookingStatus) {
    const booking = await this.getBookingOrThrow(id);
    const isSpecialist = await this.isBookingSpecialist(booking.specialistId, requester);
    const isAdmin = requester.role === 'admin';

    if (!isSpecialist && !isAdmin) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'فقط الأخصائي أو الإدارة يمكنهما تحديث حالة الحجز',
        en: 'Only the specialist or an admin can update the booking status',
      });
    }

    const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
      pending: [BookingStatus.confirmed, BookingStatus.cancelled],
      confirmed: [BookingStatus.completed, BookingStatus.cancelled],
      completed: [],
      cancelled: [],
    };
    if (!allowedTransitions[booking.status].includes(status)) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: `لا يمكن الانتقال من حالة "${booking.status}" إلى "${status}"`,
        en: `Cannot transition from "${booking.status}" to "${status}"`,
      });
    }

    if (status === BookingStatus.cancelled) {
      return this.releaseSlotAndCancel(booking.id, booking.availabilitySlotId);
    }

    return this.prisma.booking.update({ where: { id: booking.id }, data: { status } });
  }

  async cancel(id: string, requester: AuthenticatedUser) {
    const booking = await this.getBookingOrThrow(id);
    const isOwner = booking.userId === requester.userId;
    const isSpecialist = await this.isBookingSpecialist(booking.specialistId, requester);
    const isAdmin = requester.role === 'admin';

    if (!isOwner && !isSpecialist && !isAdmin) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'ليس لديك صلاحية إلغاء هذا الحجز',
        en: 'You do not have permission to cancel this booking',
      });
    }
    if (booking.status !== BookingStatus.pending && booking.status !== BookingStatus.confirmed) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'لا يمكن إلغاء حجز مكتمل أو ملغى بالفعل',
        en: 'Cannot cancel a booking that is already completed or cancelled',
      });
    }

    return this.releaseSlotAndCancel(booking.id, booking.availabilitySlotId);
  }

  async setVideoLink(id: string, specialistUserId: string, videoLink: string) {
    const booking = await this.getBookingOrThrow(id);
    const isSpecialist = await this.isBookingSpecialist(booking.specialistId, {
      userId: specialistUserId,
    } as AuthenticatedUser);
    if (!isSpecialist) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'فقط الأخصائي صاحب الحجز يمكنه إضافة رابط الفيديو',
        en: 'Only the specialist for this booking can set the video link',
      });
    }
    if (booking.consultationType !== ConsultationType.remote) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'رابط الفيديو متاح فقط للاستشارات عن بعد',
        en: 'Video link is only applicable to remote consultations',
      });
    }
    if (booking.status !== BookingStatus.confirmed && booking.status !== BookingStatus.completed) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'يجب تأكيد الحجز أولًا قبل إضافة رابط الفيديو',
        en: 'The booking must be confirmed before setting a video link',
      });
    }

    return this.prisma.booking.update({ where: { id: booking.id }, data: { videoLink } });
  }

  async setPaymentStatus(id: string, paymentStatus: PaymentStatus) {
    await this.getBookingOrThrow(id);
    return this.prisma.booking.update({
      where: { id },
      data: { paymentStatus },
    });
  }

  private async releaseSlotAndCancel(bookingId: string, slotId: string) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.cancelled },
      });
      await tx.specialistAvailability.update({
        where: { id: slotId },
        data: { isBooked: false },
      });
      return updated;
    });
  }

  private async assertCanView(
    booking: { userId: string; specialistId: string },
    requester: AuthenticatedUser,
  ) {
    const isOwner = booking.userId === requester.userId;
    const isSpecialist = await this.isBookingSpecialist(booking.specialistId, requester);
    const isAdmin = requester.role === 'admin';
    if (!isOwner && !isSpecialist && !isAdmin) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'ليس لديك صلاحية الوصول إلى هذا الحجز',
        en: 'You do not have permission to access this booking',
      });
    }
  }

  private async isBookingSpecialist(
    bookingSpecialistId: string,
    requester: AuthenticatedUser,
  ): Promise<boolean> {
    const specialist = await this.prisma.specialist.findUnique({
      where: { userId: requester.userId },
    });
    return Boolean(specialist && specialist.id === bookingSpecialistId);
  }

  private async getSpecialistOrThrow(userId: string) {
    const specialist = await this.prisma.specialist.findUnique({ where: { userId } });
    if (!specialist) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لم تُنشئي ملفًا مهنيًا بعد',
        en: 'You have not created a professional profile yet',
      });
    }
    return specialist;
  }

  private async getBookingOrThrow(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { specialist: true, reason: true, availabilitySlot: true, review: true },
    });
    if (!booking) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الحجز غير موجود',
        en: 'Booking not found',
      });
    }
    return booking;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    );
  }
}
