import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SpecialistTrack, UserRole } from '@prisma/client';
import { SpecialistsService } from './specialists.service';
import { RegisterSpecialistProfileDto } from './dto/register-specialist-profile.dto';
import { UpdateSpecialistProfileDto } from './dto/update-specialist-profile.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('specialists')
@Controller('api/v1/specialists')
export class SpecialistsController {
  constructor(private readonly specialistsService: SpecialistsService) {}

  // مسارات "me" الحرفية يجب تسجيلها قبل ":id" الديناميكي، وإلا سيطابقها Express كقيمة id="me"
  @Post('me')
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'إنشاء الملف المهني للأخصائي (مرة واحدة، بانتظار موافقة الإدارة)' })
  registerProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: RegisterSpecialistProfileDto) {
    return this.specialistsService.registerProfile(user.userId, dto);
  }

  @Get('me')
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'ملفي المهني الحالي' })
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.specialistsService.getMyProfile(user.userId);
  }

  @Patch('me')
  @Roles(UserRole.specialist)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'تعديل الملف المهني' })
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSpecialistProfileDto,
  ) {
    return this.specialistsService.updateMyProfile(user.userId, dto);
  }

  @Get()
  @ApiQuery({ name: 'specialty', required: false })
  @ApiQuery({ name: 'track', required: false, enum: SpecialistTrack })
  @ApiOperation({ summary: 'قائمة الأخصائيين المعتمدين (approved فقط)، مع فلترة اختيارية بالتخصص أو مسار المرافقة' })
  listApproved(@Query('specialty') specialty?: string, @Query('track') track?: SpecialistTrack) {
    return this.specialistsService.listApproved(specialty, track);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل أخصائي (approved فقط، إلا لصاحب الملف أو الإدارة)' })
  getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.specialistsService.getById(id, user);
  }

  @Patch(':id/approve')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('approve_specialist', 'specialist')
  @ApiOperation({ summary: 'اعتماد أخصائي (إدارة فقط)' })
  approve(@Param('id') id: string) {
    return this.specialistsService.approve(id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('reject_specialist', 'specialist')
  @ApiOperation({ summary: 'رفض أخصائي (إدارة فقط)' })
  reject(@Param('id') id: string) {
    return this.specialistsService.reject(id);
  }
}
