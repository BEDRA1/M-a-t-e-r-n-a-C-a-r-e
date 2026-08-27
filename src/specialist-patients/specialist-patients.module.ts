import { Module } from '@nestjs/common';
import { SpecialistPatientsService } from './specialist-patients.service';
import { SpecialistPatientsController } from './specialist-patients.controller';
import { ClinicalNotesService } from './clinical-notes.service';
import { ClinicalNotesController } from './clinical-notes.controller';

@Module({
  controllers: [SpecialistPatientsController, ClinicalNotesController],
  providers: [SpecialistPatientsService, ClinicalNotesService],
})
export class SpecialistPatientsModule {}
