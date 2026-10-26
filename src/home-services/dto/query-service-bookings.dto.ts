import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceBookingStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryServiceBookingsDto {
  @ApiPropertyOptional({ enum: ServiceBookingStatus })
  @IsOptional()
  @IsEnum(ServiceBookingStatus, { message: 'حالة الحجز غير صالحة' })
  status?: ServiceBookingStatus;
}
