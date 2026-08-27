import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController, AdminFaqController } from './faq.controller';

@Module({
  controllers: [FaqController, AdminFaqController],
  providers: [FaqService],
})
export class FaqModule {}
