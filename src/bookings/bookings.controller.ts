import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { SetVideoLinkDto } from './dto/set-video-link.dto';
import { SetPaymentStatusDto } from './dto/set-payment-status.dto';
import { QuerySpecialistBookingsDto } from './dto/query-specialist-bookings.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('bookings')
@Controller('api/v1/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'حجز استشارة (للأم أو الزوج)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.userId, dto);
  }

  @Get('mine')
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'حجوزاتي' })
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.listMine(user.userId);
  }

  @Get('for-specialist')
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'الحجوزات الموجّهة إليّ (للأخصائي)، بفلتر status اختياري' })
  listForSpecialist(@CurrentUser() user: AuthenticatedUser, @Query() query: QuerySpecialistBookingsDto) {
    return this.bookingsService.listForSpecialist(user.userId, query.status);
  }

  @Get('for-specialist/upcoming')
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'أقرب 10 حجوزات مؤكدة (للوحة الأخصائي)' })
  listUpcomingForSpecialist(@CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.listUpcomingForSpecialist(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل حجز (لصاحبه أو الأخصائي المعني أو الإدارة فقط)' })
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.getById(id, user);
  }

  @Patch(':id/status')
  @AuditLog('update_booking_status', 'booking')
  @ApiOperation({ summary: 'تحديث حالة الحجز (تأكيد/اكتمال) — للأخصائي أو الإدارة' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, user, dto.status);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'إلغاء الحجز (لصاحبه أو الأخصائي أو الإدارة) — يحرّر الفترة تلقائيًا' })
  cancel(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.cancel(id, user);
  }

  @Patch(':id/video-link')
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'إضافة رابط الفيديو (للاستشارات عن بعد، بعد التأكيد)' })
  setVideoLink(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SetVideoLinkDto,
  ) {
    return this.bookingsService.setVideoLink(id, user.userId, dto.videoLink);
  }

  @Patch(':id/payment-status')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('update_booking_payment_status', 'booking')
  @ApiOperation({ summary: 'تحديث حالة الدفع يدويًا (الإدارة فقط — لا بوابة دفع فعلية بعد)' })
  setPaymentStatus(@Param('id') id: string, @Body() dto: SetPaymentStatusDto) {
    return this.bookingsService.setPaymentStatus(id, dto.paymentStatus);
  }
}
