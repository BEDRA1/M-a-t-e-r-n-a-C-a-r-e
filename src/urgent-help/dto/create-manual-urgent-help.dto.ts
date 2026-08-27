import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateManualUrgentHelpDto {
  @ApiPropertyOptional({ description: 'أي تفاصيل اختيارية تودّين إضافتها' })
  @SanitizeText()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
