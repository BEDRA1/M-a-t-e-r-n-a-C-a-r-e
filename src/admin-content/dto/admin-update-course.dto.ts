import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

/** حقول المحتوى والموعد فقط — النوع والسعر والأخصائية المالكة لا تتغيّر من الإدارة */
export class AdminUpdateCourseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @SanitizeText()
  @IsString()
  @MinLength(3, { message: 'عنوان الدورة قصير جدًا' })
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @SanitizeText()
  @IsString()
  @MinLength(10, { message: 'وصف الدورة قصير جدًا' })
  @MaxLength(3000)
  description?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'رابط الصورة غير صالح' })
  imageUrl?: string | null;

  @ApiPropertyOptional({ description: 'للدورات الحضورية فقط' })
  @IsOptional()
  @IsInt({ message: 'السعة يجب أن تكون رقمًا صحيحًا' })
  @Min(1)
  @Max(1000)
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'تاريخ بدء الدورة غير صالح' })
  startDate?: string;
}
