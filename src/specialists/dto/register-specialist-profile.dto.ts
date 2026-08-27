import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpecialistTrack } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class RegisterSpecialistProfileDto {
  @ApiProperty({ example: 'د. أحلام بن يوسف' })
  @SanitizeText()
  @IsString()
  @MinLength(3, { message: 'الاسم الكامل قصير جدًا' })
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ enum: SpecialistTrack, example: SpecialistTrack.psychological, description: 'مسار المرافقة' })
  @IsEnum(SpecialistTrack, { message: 'مسار المرافقة غير صالح' })
  track: SpecialistTrack;

  @ApiProperty({ example: 'القلق أثناء الحمل واكتئاب ما بعد الولادة' })
  @SanitizeText()
  @IsString()
  @MinLength(3, { message: 'التخصص قصير جدًا' })
  @MaxLength(150)
  specialty: string;

  @ApiProperty({ example: 'أخصائية نفسية بخبرة 8 سنوات في مرافقة الأمهات...' })
  @SanitizeText()
  @IsString()
  @MinLength(20, { message: 'النبذة التعريفية قصيرة جدًا (20 حرفًا على الأقل)' })
  @MaxLength(2000)
  bio: string;

  @ApiProperty({ example: 8 })
  @IsInt({ message: 'سنوات الخبرة يجب أن تكون رقمًا صحيحًا' })
  @Min(0, { message: 'سنوات الخبرة غير منطقية' })
  @Max(60, { message: 'سنوات الخبرة غير منطقية' })
  yearsExperience: number;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsUrl({}, { message: 'رابط الصورة غير صالح' })
  photoUrl?: string;
}
