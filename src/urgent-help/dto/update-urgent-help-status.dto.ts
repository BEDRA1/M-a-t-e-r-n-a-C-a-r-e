import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UrgentHelpStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class UpdateUrgentHelpStatusDto {
  @ApiProperty({ enum: UrgentHelpStatus })
  @IsEnum(UrgentHelpStatus, { message: 'الحالة غير صالحة' })
  status: UrgentHelpStatus;

  @ApiPropertyOptional({ description: 'ملاحظات المتابعة الداخلية' })
  @SanitizeText()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
