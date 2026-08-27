import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PostpartumService } from './postpartum.service';
import { CreateMoodLogDto } from './dto/create-mood-log.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('postpartum')
@Controller('api/v1/postpartum')
export class PostpartumController {
  constructor(private readonly postpartumService: PostpartumService) {}

  @Get('current')
  @ApiOperation({ summary: 'فترة النفاس الحالية مع عدّاد الأيام (حد أقصى 40)' })
  getCurrent(@CurrentUser() user: AuthenticatedUser) {
    return this.postpartumService.getCurrent(user);
  }

  @Post('mood-logs')
  @Roles(UserRole.mother)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'تسجيل الحالة المزاجية اليومية' })
  addMoodLog(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMoodLogDto) {
    return this.postpartumService.addMoodLog(user, dto);
  }

  @Get('mood-logs')
  @ApiQuery({ name: 'days', required: false, enum: [7, 14, 30] })
  @ApiOperation({ summary: 'سجل الحالة المزاجية لعرضه في رسم بياني' })
  listMoodLogs(@CurrentUser() user: AuthenticatedUser, @Query('days') days?: string) {
    return this.postpartumService.listMoodLogs(user, days);
  }
}
