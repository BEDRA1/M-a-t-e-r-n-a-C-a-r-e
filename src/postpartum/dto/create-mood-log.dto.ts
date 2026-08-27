import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateMoodLogDto {
  @ApiProperty({ minimum: 1, maximum: 5, example: 4, description: 'مستوى المزاج من 1 (سيئ جدًا) إلى 5 (ممتاز)' })
  @IsInt({ message: 'مستوى المزاج يجب أن يكون رقمًا صحيحًا' })
  @Min(1, { message: 'مستوى المزاج يجب أن يكون بين 1 و5' })
  @Max(5, { message: 'مستوى المزاج يجب أن يكون بين 1 و5' })
  moodLevel: number;

  @ApiPropertyOptional({ example: 'شعرت بتحسن اليوم مقارنة بالأمس' })
  @SanitizeText()
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'الملاحظات طويلة جدًا' })
  notes?: string;
}
