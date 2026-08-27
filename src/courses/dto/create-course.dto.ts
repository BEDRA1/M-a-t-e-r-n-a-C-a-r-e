import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsultationType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'دورة التحضير للولادة' })
  @IsString()
  @MinLength(3, { message: 'عنوان الدورة قصير جدًا' })
  @MaxLength(150)
  title: string;

  @ApiProperty({ example: 'دورة تحضيرية شاملة تغطي مراحل المخاض والولادة وأساسيات رعاية المولود' })
  @IsString()
  @MinLength(10, { message: 'وصف الدورة قصير جدًا' })
  @MaxLength(3000)
  description: string;

  @ApiProperty({ enum: ConsultationType })
  @IsEnum(ConsultationType, { message: 'نوع الدورة غير صالح' })
  type: ConsultationType;

  @ApiPropertyOptional({ description: 'الحد الأقصى للمقاعد — مطلوب للدورات الحضورية فقط', example: 20 })
  @ValidateIf((o: CreateCourseDto) => o.type === ConsultationType.in_person)
  @IsInt({ message: 'السعة يجب أن تكون رقمًا صحيحًا' })
  @Min(1, { message: 'السعة يجب أن تكون على الأقل مقعدًا واحدًا' })
  @Max(1000, { message: 'السعة غير منطقية' })
  capacity?: number;

  @ApiProperty({ example: '2026-09-15T09:00:00.000Z' })
  @IsDateString({}, { message: 'تاريخ بدء الدورة غير صالح' })
  startDate: string;

  @ApiProperty({ example: '3 أسابيع', description: 'مدة نصية حرة للعرض' })
  @IsString()
  @MinLength(1, { message: 'مدة الدورة مطلوبة' })
  @MaxLength(100)
  durationText: string;

  @ApiProperty({ example: 21, description: 'المدة بالأيام لاحتساب موعد اكتمال الدورة فعليًا' })
  @IsInt({ message: 'مدة الدورة بالأيام يجب أن تكون رقمًا صحيحًا' })
  @Min(1, { message: 'مدة الدورة غير منطقية' })
  @Max(3650, { message: 'مدة الدورة غير منطقية' })
  durationDays: number;

  @ApiPropertyOptional({
    description: 'رابط خارجي للمحتوى — مطلوب للدورات عن بُعد فقط',
    example: 'https://example.com/course-content',
  })
  @ValidateIf((o: CreateCourseDto) => o.type === ConsultationType.remote)
  @IsUrl({}, { message: 'رابط المحتوى غير صالح' })
  contentUrl?: string;

  @ApiPropertyOptional({ description: 'الولاية — مطلوبة للدورات الحضورية فقط', example: 'الجزائر العاصمة' })
  @ValidateIf((o: CreateCourseDto) => o.type === ConsultationType.in_person)
  @IsString()
  @MinLength(1, { message: 'الولاية مطلوبة للدورات الحضورية' })
  wilaya?: string;
}
