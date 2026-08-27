import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { SanitizeText } from '../../common/lib/sanitize';

export class CreateServiceBookingDto {
  @ApiProperty()
  @IsUUID('4', { message: 'معرّف الخدمة غير صالح' })
  serviceId: string;

  @ApiProperty({ example: '2026-08-20T10:00:00.000Z' })
  @IsDateString({}, { message: 'موعد الخدمة غير صالح' })
  scheduledTime: string;

  @ApiProperty({ example: 'حي بن عكنون، الجزائر العاصمة' })
  @SanitizeText()
  @IsString()
  @MinLength(5, { message: 'العنوان قصير جدًا' })
  @MaxLength(300)
  address: string;

  @ApiPropertyOptional({ example: 'الرجاء الطرق على الباب برفق، الطفل نائم' })
  @SanitizeText()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
