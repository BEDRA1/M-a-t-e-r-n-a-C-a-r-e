import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QuerySubscriptionsDto {
  @ApiPropertyOptional({ enum: SubscriptionStatus })
  @IsOptional()
  @IsEnum(SubscriptionStatus, { message: 'حالة الاشتراك غير صالحة' })
  status?: SubscriptionStatus;
}
