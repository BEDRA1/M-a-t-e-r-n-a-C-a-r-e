import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DailyTipsService } from './daily-tips.service';

@ApiBearerAuth()
@ApiTags('daily-tips')
@Controller('api/v1/daily-tips')
export class DailyTipsController {
  constructor(private readonly dailyTipsService: DailyTipsService) {}

  @Get('today')
  @ApiOperation({ summary: 'نصيحة اليوم (ثابتة طوال اليوم)' })
  getToday() {
    return this.dailyTipsService.getToday();
  }
}
