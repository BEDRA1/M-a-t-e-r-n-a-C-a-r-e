import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { BookingReviewsService } from './booking-reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('booking-reviews')
@Controller('api/v1/booking-reviews')
export class BookingReviewsController {
  constructor(private readonly reviewsService: BookingReviewsService) {}

  @Post()
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'تقييم استشارة مكتملة (مرة واحدة لكل حجز)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.userId, dto);
  }

  @Get('by-booking/:bookingId')
  @ApiOperation({ summary: 'تقييم حجز معيّن' })
  getByBooking(@Param('bookingId') bookingId: string) {
    return this.reviewsService.getByBooking(bookingId);
  }
}
