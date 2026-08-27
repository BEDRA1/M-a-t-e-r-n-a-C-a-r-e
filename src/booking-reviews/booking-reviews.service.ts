import { HttpStatus, Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class BookingReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
    if (!booking || booking.userId !== userId) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الحجز غير موجود',
        en: 'Booking not found',
      });
    }
    if (booking.status !== BookingStatus.completed) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'يمكن التقييم فقط بعد اكتمال الاستشارة',
        en: 'You can only review a booking after the consultation is completed',
      });
    }

    const existing = await this.prisma.bookingReview.findUnique({
      where: { bookingId: dto.bookingId },
    });
    if (existing) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'قيّمتِ هذا الحجز بالفعل',
        en: 'You have already reviewed this booking',
      });
    }

    return this.prisma.bookingReview.create({
      data: { bookingId: dto.bookingId, rating: dto.rating, comment: dto.comment },
    });
  }

  async getByBooking(bookingId: string) {
    const review = await this.prisma.bookingReview.findUnique({ where: { bookingId } });
    if (!review) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'لا يوجد تقييم لهذا الحجز',
        en: 'No review found for this booking',
      });
    }
    return review;
  }
}
