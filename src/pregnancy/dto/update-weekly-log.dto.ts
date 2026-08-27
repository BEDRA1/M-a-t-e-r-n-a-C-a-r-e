import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateWeeklyLogDto } from './create-weekly-log.dto';

export class UpdateWeeklyLogDto extends PartialType(
  OmitType(CreateWeeklyLogDto, ['weekNumber'] as const),
) {}
