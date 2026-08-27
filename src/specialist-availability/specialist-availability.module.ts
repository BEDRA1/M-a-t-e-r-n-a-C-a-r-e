import { Module } from '@nestjs/common';
import { SpecialistAvailabilityService } from './specialist-availability.service';
import { SpecialistAvailabilityController } from './specialist-availability.controller';

@Module({
  controllers: [SpecialistAvailabilityController],
  providers: [SpecialistAvailabilityService],
})
export class SpecialistAvailabilityModule {}
