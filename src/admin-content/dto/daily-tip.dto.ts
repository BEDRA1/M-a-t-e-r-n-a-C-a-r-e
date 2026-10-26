import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateDailyTipDto {
  @ApiProperty()
  @SanitizeText()
  @IsString()
  @MinLength(5, { message: 'النصيحة قصيرة جدًا' })
  @MaxLength(500)
  tipTextAr: string;
}

export class UpdateDailyTipDto {
  @ApiPropertyOptional()
  @IsOptional()
  @SanitizeText()
  @IsString()
  @MinLength(5, { message: 'النصيحة قصيرة جدًا' })
  @MaxLength(500)
  tipTextAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
