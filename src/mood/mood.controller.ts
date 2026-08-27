import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MoodService } from './mood.service';
import { CreateMoodLogDto } from './dto/create-mood-log.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('mood')
@Controller('api/v1/mood-logs')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post()
  @ApiOperation({ summary: 'تسجيل الحالة المزاجية اليومية (تسجيل ثانٍ بنفس اليوم يُحدِّث الأول)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMoodLogDto) {
    return this.moodService.create(user.userId, dto);
  }

  @Get()
  @ApiQuery({ name: 'days', required: false, enum: [7, 14, 30] })
  @ApiOperation({ summary: 'سجل الحالة المزاجية لعرضه في رسم بياني' })
  list(@CurrentUser() user: AuthenticatedUser, @Query('days') days?: string) {
    return this.moodService.listForCurrentUser(user.userId, days);
  }
}
