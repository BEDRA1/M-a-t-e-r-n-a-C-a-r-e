import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductOrderStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryProductOrdersDto {
  @ApiPropertyOptional({ enum: ProductOrderStatus })
  @IsOptional()
  @IsEnum(ProductOrderStatus, { message: 'حالة الطلب غير صالحة' })
  status?: ProductOrderStatus;
}
