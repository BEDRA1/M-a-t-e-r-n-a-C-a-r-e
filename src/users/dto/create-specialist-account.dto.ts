import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpecialistTrack } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateSpecialistAccountDto {
  @ApiProperty({ example: 'سارة بن علي' })
  @SanitizeText()
  @IsString()
  @MinLength(3, { message: 'الاسم قصير جدًا' })
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: '0555123456' })
  @Matches(/^0[5-7]\d{8}$/, { message: 'رقم الهاتف غير صالح (مثال: 0555123456)' })
  phone: string;

  @ApiProperty({ example: 'أخصائية نفسانية' })
  @SanitizeText()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  specialty: string;

  @ApiProperty({ enum: SpecialistTrack })
  @IsEnum(SpecialistTrack, { message: 'المسار غير صالح' })
  track: SpecialistTrack;

  @ApiPropertyOptional({ example: 'الجزائر العاصمة' })
  @SanitizeText()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  wilaya?: string;

  @ApiProperty({ description: 'كلمة مرور مؤقتة — تُحجب من سجل النشاط' })
  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional()
  @SanitizeText()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  yearsExperience?: number;
}
