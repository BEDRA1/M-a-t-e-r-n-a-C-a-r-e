import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReminderType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReminderDto {
  @ApiProperty({ enum: ReminderType })
  @IsEnum(ReminderType, { message: 'نوع التذكير غير صالح' })
  type: ReminderType;

  @ApiProperty({ example: 'حبوب الحديد' })
  @IsString()
  @MaxLength(120, { message: 'العنوان طويل جدًا' })
  title: string;

  @ApiProperty({ example: '2026-08-10T08:00:00.000Z' })
  @IsDateString({}, { message: 'موعد التذكير غير صالح' })
  scheduledTime: string;

  @ApiPropertyOptional({ example: 'daily', description: 'قاعدة التكرار (نصية بسيطة في هذه المرحلة)' })
  @IsOptional()
  @IsString()
  recurrence?: string;
}
