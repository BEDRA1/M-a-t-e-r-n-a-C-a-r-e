import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PregnancyService } from './pregnancy.service';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';
import { UpdatePregnancyDto } from './dto/update-pregnancy.dto';
import { CreateWeeklyLogDto } from './dto/create-weekly-log.dto';
import { UpdateWeeklyLogDto } from './dto/update-weekly-log.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('pregnancy')
@Controller('api/v1/pregnancy')
export class PregnancyController {
  constructor(private readonly pregnancyService: PregnancyService) {}

  @Post()
  @Roles(UserRole.mother)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'إنشاء حمل جديد وحساب تاريخ الولادة المتوقع' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePregnancyDto) {
    return this.pregnancyService.create(user.userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'بيانات الحمل النشط الحالي (للأم أو الزوج المرتبط)' })
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.pregnancyService.findMine(user);
  }

  @Patch()
  @Roles(UserRole.mother)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'تحديث بيانات الحمل النشط' })
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePregnancyDto) {
    return this.pregnancyService.update(user.userId, dto);
  }

  @Post('weekly-logs')
  @Roles(UserRole.mother)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'إضافة سجل أسبوعي جديد (وزن، أعراض، ملاحظات)' })
  addWeeklyLog(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateWeeklyLogDto) {
    return this.pregnancyService.addWeeklyLog(user, dto);
  }

  @Get('weekly-logs')
  @ApiOperation({ summary: 'قائمة السجلات الأسبوعية للحمل النشط' })
  listWeeklyLogs(@CurrentUser() user: AuthenticatedUser) {
    return this.pregnancyService.listWeeklyLogs(user);
  }

  @Patch('weekly-logs/:id')
  @Roles(UserRole.mother)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'تعديل سجل أسبوعي' })
  updateWeeklyLog(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateWeeklyLogDto,
  ) {
    return this.pregnancyService.updateWeeklyLog(user.userId, id, dto);
  }

  @Delete('weekly-logs/:id')
  @Roles(UserRole.mother)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'حذف سجل أسبوعي' })
  deleteWeeklyLog(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.pregnancyService.deleteWeeklyLog(user.userId, id);
  }

  @Get('week-content/:weekNumber')
  @ApiOperation({ summary: 'محتوى تطور الجنين لأسبوع معيّن (1-40)' })
  getWeekContent(@Param('weekNumber', ParseIntPipe) weekNumber: number) {
    return this.pregnancyService.getWeekContent(weekNumber);
  }
}
