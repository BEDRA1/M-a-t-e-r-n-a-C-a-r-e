import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsultationType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateAvailabilityDto {
  @ApiProperty({ example: '2026-08-20T09:00:00.000Z' })
  @IsDateString({}, { message: 'وقت البداية غير صالح' })
  startTime: string;

  @ApiProperty({ example: '2026-08-20T10:00:00.000Z' })
  @IsDateString({}, { message: 'وقت النهاية غير صالح' })
  endTime: string;

  @ApiProperty({ enum: ConsultationType })
  @IsEnum(ConsultationType, { message: 'نوع الاستشارة غير صالح' })
  consultationType: ConsultationType;

  @ApiPropertyOptional({ description: 'مطلوبة فقط عند consultationType = in_person' })
  @ValidateIf((o: CreateAvailabilityDto) => o.consultationType === ConsultationType.in_person)
  @IsString()
  wilaya?: string;
}
