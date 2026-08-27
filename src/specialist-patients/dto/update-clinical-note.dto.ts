import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class UpdateClinicalNoteDto {
  @ApiPropertyOptional()
  @SanitizeText()
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'نص الملاحظة قصير جدًا' })
  noteText?: string;

  @ApiPropertyOptional({ description: 'تاريخ الجلسة (ISO)' })
  @IsOptional()
  @IsDateString({}, { message: 'تاريخ الجلسة غير صالح' })
  sessionDate?: string;
}
