import { ApiProperty } from '@nestjs/swagger';
import { ServiceBookingStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateServiceBookingStatusDto {
  @ApiProperty({ enum: ServiceBookingStatus })
  @IsEnum(ServiceBookingStatus, { message: 'حالة الحجز غير صالحة' })
  status: ServiceBookingStatus;
}
