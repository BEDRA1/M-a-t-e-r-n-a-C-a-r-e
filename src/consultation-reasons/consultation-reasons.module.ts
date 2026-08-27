import { Module } from '@nestjs/common';
import { ConsultationReasonsService } from './consultation-reasons.service';
import { ConsultationReasonsController } from './consultation-reasons.controller';

@Module({
  controllers: [ConsultationReasonsController],
  providers: [ConsultationReasonsService],
})
export class ConsultationReasonsModule {}
