import { Module } from '@nestjs/common';
import { PregnancyService } from './pregnancy.service';
import { PregnancyController } from './pregnancy.controller';

@Module({
  controllers: [PregnancyController],
  providers: [PregnancyService],
})
export class PregnancyModule {}
