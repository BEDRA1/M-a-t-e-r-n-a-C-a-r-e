import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { FamiliesService } from './families.service';
import { JoinFamilyDto } from './dto/join-family.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('families')
@Controller('api/v1/families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post('invite')
  @Roles(UserRole.mother)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'إنشاء أو جلب كود دعوة الزوج (للأم فقط)' })
  createInvite(@CurrentUser() user: AuthenticatedUser) {
    return this.familiesService.createOrGetInvite(user.userId);
  }

  @Post('join')
  @Roles(UserRole.spouse)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'الانضمام إلى عائلة عبر كود الدعوة (للزوج فقط)' })
  join(@CurrentUser() user: AuthenticatedUser, @Body() dto: JoinFamilyDto) {
    return this.familiesService.join(user.userId, dto.inviteCode);
  }

  @Get('me')
  @ApiOperation({ summary: 'بيانات العائلة المرتبطة بالمستخدم الحالي' })
  getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.familiesService.getMine(user.userId);
  }

  @Delete('link')
  @Roles(UserRole.mother)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'فك ربط الزوج عن العائلة (للأم فقط)' })
  unlink(@CurrentUser() user: AuthenticatedUser) {
    return this.familiesService.unlinkSpouse(user.userId);
  }
}
