import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { HomeServicesService } from './home-services.service';
import { CreateServiceBookingDto } from './dto/create-service-booking.dto';
import { UpdateServiceBookingStatusDto } from './dto/update-service-booking-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('service-bookings')
@Controller('api/v1/service-bookings')
export class ServiceBookingsController {
  constructor(private readonly homeServicesService: HomeServicesService) {}

  @Post()
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'حجز خدمة منزلية' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateServiceBookingDto) {
    return this.homeServicesService.createBooking(user.userId, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'حجوزاتي للخدمات المنزلية' })
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.homeServicesService.listMine(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل حجز (المالك أو admin فقط)' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.homeServicesService.findOne(user, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('update_service_booking_status', 'service_booking')
  @ApiOperation({ summary: 'تحديث حالة الحجز (admin فقط)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateServiceBookingStatusDto) {
    return this.homeServicesService.updateStatus(id, dto.status);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'إلغاء حجز (المالك فقط، إن كان pending أو confirmed)' })
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.homeServicesService.cancel(user.userId, id);
  }
}
