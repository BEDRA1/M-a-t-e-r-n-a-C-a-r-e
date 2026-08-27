import { HttpStatus, Injectable } from '@nestjs/common';
import { ServiceBookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateServiceBookingDto } from './dto/create-service-booking.dto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

const ALLOWED_BOOKING_TRANSITIONS: Record<ServiceBookingStatus, ServiceBookingStatus[]> = {
  pending: [ServiceBookingStatus.confirmed, ServiceBookingStatus.cancelled],
  confirmed: [ServiceBookingStatus.completed, ServiceBookingStatus.cancelled],
  completed: [],
  cancelled: [],
};

@Injectable()
export class HomeServicesService {
  constructor(private readonly prisma: PrismaService) {}

  listCatalog(category?: string) {
    return this.prisma.homeService.findMany({
      where: category ? { category } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async createBooking(userId: string, dto: CreateServiceBookingDto) {
    const service = await this.prisma.homeService.findUnique({ where: { id: dto.serviceId } });
    if (!service) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الخدمة غير موجودة',
        en: 'Service not found',
      });
    }

    return this.prisma.serviceBooking.create({
      data: {
        userId,
        serviceId: dto.serviceId,
        scheduledTime: new Date(dto.scheduledTime),
        address: dto.address,
        notes: dto.notes,
      },
      include: { service: true },
    });
  }

  listMine(userId: string) {
    return this.prisma.serviceBooking.findMany({
      where: { userId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: AuthenticatedUser, bookingId: string) {
    const booking = await this.getBookingOrThrow(bookingId);
    if (booking.userId !== user.userId && user.role !== 'admin') {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'ليس لديك صلاحية الوصول إلى هذا الحجز',
        en: 'You do not have permission to access this booking',
      });
    }
    return booking;
  }

  async updateStatus(bookingId: string, status: ServiceBookingStatus) {
    const booking = await this.getBookingOrThrow(bookingId);
    if (!ALLOWED_BOOKING_TRANSITIONS[booking.status].includes(status)) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: `لا يمكن الانتقال من حالة "${booking.status}" إلى "${status}"`,
        en: `Cannot transition from "${booking.status}" to "${status}"`,
      });
    }
    return this.prisma.serviceBooking.update({ where: { id: booking.id }, data: { status } });
  }

  async cancel(userId: string, bookingId: string) {
    const booking = await this.getBookingOrThrow(bookingId);
    if (booking.userId !== userId) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'ليس لديك صلاحية إلغاء هذا الحجز',
        en: 'You do not have permission to cancel this booking',
      });
    }
    if (booking.status !== ServiceBookingStatus.pending && booking.status !== ServiceBookingStatus.confirmed) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'لا يمكن إلغاء حجز في هذه الحالة',
        en: 'Cannot cancel a booking in its current status',
      });
    }
    return this.prisma.serviceBooking.update({
      where: { id: booking.id },
      data: { status: ServiceBookingStatus.cancelled },
    });
  }

  private async getBookingOrThrow(bookingId: string) {
    const booking = await this.prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });
    if (!booking) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الحجز غير موجود',
        en: 'Booking not found',
      });
    }
    return booking;
  }
}
