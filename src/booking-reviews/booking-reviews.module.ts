import { Module } from '@nestjs/common';
import { BookingReviewsService } from './booking-reviews.service';
import { BookingReviewsController } from './booking-reviews.controller';

@Module({
  controllers: [BookingReviewsController],
  providers: [BookingReviewsService],
})
export class BookingReviewsModule {}
