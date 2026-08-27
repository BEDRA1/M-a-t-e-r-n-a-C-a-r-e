import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { BabiesService } from './babies.service';
import { CreateBabyDto } from './dto/create-baby.dto';
import { UpdateBabyDto } from './dto/update-baby.dto';
import { CreateCheckupDto } from './dto/create-checkup.dto';
import { UpdateCheckupDto } from './dto/update-checkup.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('babies')
@Controller('api/v1/babies')
export class BabiesController {
  constructor(private readonly babiesService: BabiesService) {}

  @Post()
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'إضافة طفل جديد لملف العائلة' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBabyDto) {
    return this.babiesService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة أطفال العائلة' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.babiesService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل طفل مع فحوصاته' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.babiesService.findOne(user.userId, id);
  }

  @Patch(':id')
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'تعديل بيانات طفل' })
  update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateBabyDto) {
    return this.babiesService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'حذف طفل من ملف العائلة' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.babiesService.remove(user.userId, id);
  }

  @Post(':babyId/checkups')
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'إضافة فحص للطفل — ينشئ تذكيرًا تلقائيًا إن كان الموعد مستقبليًا' })
  createCheckup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('babyId') babyId: string,
    @Body() dto: CreateCheckupDto,
  ) {
    return this.babiesService.createCheckup(user.userId, babyId, dto);
  }

  @Get(':babyId/checkups')
  @ApiOperation({ summary: 'قائمة فحوصات الطفل' })
  listCheckups(@CurrentUser() user: AuthenticatedUser, @Param('babyId') babyId: string) {
    return this.babiesService.listCheckups(user.userId, babyId);
  }

  @Patch(':babyId/checkups/:checkupId')
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'تعديل فحص — يحدّث أو ينشئ أو يحذف التذكير المرتبط تلقائيًا حسب الموعد الجديد' })
  updateCheckup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('babyId') babyId: string,
    @Param('checkupId') checkupId: string,
    @Body() dto: UpdateCheckupDto,
  ) {
    return this.babiesService.updateCheckup(user.userId, babyId, checkupId, dto);
  }

  @Delete(':babyId/checkups/:checkupId')
  @Roles(UserRole.mother, UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'حذف فحص — يحذف التذكير المرتبط تلقائيًا إن وُجد' })
  removeCheckup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('babyId') babyId: string,
    @Param('checkupId') checkupId: string,
  ) {
    return this.babiesService.removeCheckup(user.userId, babyId, checkupId);
  }
}
