import { ApiProperty } from '@nestjs/swagger';
import { ProductOrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateProductOrderStatusDto {
  @ApiProperty({ enum: ProductOrderStatus })
  @IsEnum(ProductOrderStatus, { message: 'حالة الطلب غير صالحة' })
  status: ProductOrderStatus;
}
