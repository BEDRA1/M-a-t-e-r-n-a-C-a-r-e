import { Module } from '@nestjs/common';
import { SpecialistsService } from './specialists.service';
import { AdminSpecialistsController, SpecialistsController } from './specialists.controller';

@Module({
  controllers: [SpecialistsController, AdminSpecialistsController],
  providers: [SpecialistsService],
  exports: [SpecialistsService],
})
export class SpecialistsModule {}
