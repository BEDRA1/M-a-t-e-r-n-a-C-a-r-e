import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UrgentHelpService } from './urgent-help.service';
import { CreateManualUrgentHelpDto } from './dto/create-manual-urgent-help.dto';
import { UpdateUrgentHelpStatusDto } from './dto/update-urgent-help-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('urgent-help-requests')
@Controller('api/v1/urgent-help-requests')
export class UrgentHelpController {
  constructor(private readonly urgentHelpService: UrgentHelpService) {}

  @Post()
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'طلب مساعدة عاجلة يدوي — زر "أحتاج للتحدث مع أحد الآن"' })
  createManual(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateManualUrgentHelpDto) {
    return this.urgentHelpService.createManual(user.userId, dto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.specialist)
  @UseGuards(RolesGuard)
  @AuditLog('view_urgent_help_requests', 'urgent_help')
  @ApiOperation({ summary: 'قائمة طلبات المساعدة العاجلة (open أولاً، ثم الأحدث) — للأدمن والأخصائيين' })
  listAll() {
    return this.urgentHelpService.listAll();
  }

  @Patch(':id/status')
  @Roles(UserRole.admin, UserRole.specialist)
  @UseGuards(RolesGuard)
  @AuditLog('update_urgent_help_status', 'urgent_help')
  @ApiOperation({ summary: 'تحديث حالة طلب المساعدة العاجلة' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUrgentHelpStatusDto) {
    return this.urgentHelpService.updateStatus(id, dto);
  }
}
