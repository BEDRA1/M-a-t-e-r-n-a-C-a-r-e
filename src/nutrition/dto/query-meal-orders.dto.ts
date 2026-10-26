import { ApiPropertyOptional } from '@nestjs/swagger';
import { MealOrderStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryMealOrdersDto {
  @ApiPropertyOptional({ enum: MealOrderStatus })
  @IsOptional()
  @IsEnum(MealOrderStatus, { message: 'حالة الطلب غير صالحة' })
  status?: MealOrderStatus;
}
