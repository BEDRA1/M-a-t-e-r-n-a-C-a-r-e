import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { SanitizeText, SanitizeTextArray } from '../../common/lib/sanitize';

export class CreateWeeklyLogDto {
  @ApiProperty({ example: 12, minimum: 1, maximum: 42 })
  @IsInt({ message: 'رقم الأسبوع يجب أن يكون رقمًا صحيحًا' })
  @Min(1, { message: 'رقم الأسبوع غير منطقي' })
  @Max(42, { message: 'رقم الأسبوع غير منطقي' })
  weekNumber: number;

  @ApiPropertyOptional({ example: 65.5 })
  @IsOptional()
  @IsNumber({}, { message: 'الوزن يجب أن يكون رقمًا' })
  @Min(20, { message: 'الوزن غير منطقي' })
  @Max(300, { message: 'الوزن غير منطقي' })
  weightKg?: number;

  @ApiPropertyOptional({ example: ['غثيان', 'تعب'], type: [String] })
  @SanitizeTextArray()
  @IsOptional()
  @IsArray({ message: 'الأعراض يجب أن تكون قائمة' })
  @IsString({ each: true, message: 'كل عرض يجب أن يكون نصًا' })
  symptoms?: string[];

  @ApiPropertyOptional({ example: 'أشعر بتحسن هذا الأسبوع' })
  @SanitizeText()
  @IsOptional()
  @IsString()
  notes?: string;
}
