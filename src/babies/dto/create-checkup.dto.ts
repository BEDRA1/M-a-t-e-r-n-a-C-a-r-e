import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateCheckupDto {
  @ApiProperty({ example: 'فحص الشهر الأول' })
  @SanitizeText()
  @IsString()
  @MinLength(1, { message: 'عنوان الفحص مطلوب' })
  @MaxLength(150)
  title: string;

  @ApiProperty({ example: '2026-09-01T09:00:00.000Z' })
  @IsDateString({}, { message: 'موعد الفحص غير صالح' })
  scheduledDate: string;

  @ApiPropertyOptional({ example: 'فحص دوري شامل مع الطبيب' })
  @SanitizeText()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
