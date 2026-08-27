import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ConsultationType, UserRole } from '@prisma/client';
import { SpecialistAvailabilityService } from './specialist-availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('specialist-availability')
@Controller('api/v1/specialist-availability')
export class SpecialistAvailabilityController {
  constructor(private readonly availabilityService: SpecialistAvailabilityService) {}

  @Post()
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'إضافة فترة توفر جديدة (للأخصائي على ملفه الخاص)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAvailabilityDto) {
    return this.availabilityService.create(user.userId, dto);
  }

  @Get('mine')
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'كل فترات التوفر الخاصة بي (محجوزة وغير محجوزة)' })
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.availabilityService.listMine(user.userId);
  }

  @Get('available')
  @ApiQuery({ name: 'specialistId', required: false })
  @ApiQuery({ name: 'consultationType', required: false, enum: ConsultationType })
  @ApiOperation({ summary: 'الفترات المتاحة للحجز (عامة، غير محجوزة، لأخصائيين معتمدين)' })
  listAvailable(
    @Query('specialistId') specialistId?: string,
    @Query('consultationType') consultationType?: ConsultationType,
  ) {
    return this.availabilityService.listAvailable({ specialistId, consultationType });
  }

  @Delete(':id')
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'حذف فترة توفر (لن تنجح إن كانت محجوزة)' })
  deleteMine(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.availabilityService.deleteMine(user.userId, id);
  }
}
