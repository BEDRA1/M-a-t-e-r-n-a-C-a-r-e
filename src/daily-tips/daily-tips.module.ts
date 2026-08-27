import { Module } from '@nestjs/common';
import { DailyTipsService } from './daily-tips.service';
import { DailyTipsController } from './daily-tips.controller';

@Module({
  controllers: [DailyTipsController],
  providers: [DailyTipsService],
})
export class DailyTipsModule {}
