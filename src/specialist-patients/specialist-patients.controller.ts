import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SpecialistPatientsService } from './specialist-patients.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('specialist-patients')
@Controller('api/v1/specialist/patients')
@Roles(UserRole.specialist)
@UseGuards(RolesGuard)
export class SpecialistPatientsController {
  constructor(private readonly patientsService: SpecialistPatientsService) {}

  @Get()
  @AuditLog('view_patient_list', 'specialist_patient')
  @ApiOperation({ summary: 'مريضاتي (حجز مؤكد أو مكتمل على الأقل)' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.patientsService.listPatients(user.userId);
  }

  @Get(':userId')
  @AuditLog('view_patient_detail', 'specialist_patient')
  @ApiOperation({ summary: 'ملف مريضة — البيانات المأذون بمشاركتها فقط + استبيان الحجز دائمًا' })
  getDetail(@CurrentUser() user: AuthenticatedUser, @Param('userId') userId: string) {
    return this.patientsService.getPatientDetail(user.userId, userId);
  }
}
