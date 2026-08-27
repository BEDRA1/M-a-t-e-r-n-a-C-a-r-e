import { ApiProperty } from '@nestjs/swagger';
import { MealOrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateMealOrderStatusDto {
  @ApiProperty({ enum: MealOrderStatus })
  @IsEnum(MealOrderStatus, { message: 'حالة الطلب غير صالحة' })
  status: MealOrderStatus;
}
