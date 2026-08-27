import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateTestimonialDto {
  @ApiProperty({ example: 'تطبيق رائع رافقني طوال فترة الحمل والنفاس' })
  @SanitizeText()
  @IsString({ message: 'الرأي يجب أن يكون نصًا' })
  @MinLength(5, { message: 'الرأي قصير جدًا' })
  @MaxLength(1000, { message: 'الرأي طويل جدًا' })
  content: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5, description: 'التقييم من 1 إلى 5' })
  @IsInt({ message: 'التقييم يجب أن يكون رقمًا صحيحًا' })
  @Min(1, { message: 'التقييم يجب أن يكون بين 1 و5' })
  @Max(5, { message: 'التقييم يجب أن يكون بين 1 و5' })
  rating: number;

  @ApiPropertyOptional({ example: 'سلمى', description: 'الاسم الذي سيظهر مع الرأي (اختياري) — يُعرض "أم" إن تُرك فارغًا' })
  @SanitizeText()
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'الاسم طويل جدًا' })
  displayName?: string;
}
