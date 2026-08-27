import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class QueryClinicalNotesDto {
  @ApiProperty()
  @IsUUID()
  patientUserId: string;
}
