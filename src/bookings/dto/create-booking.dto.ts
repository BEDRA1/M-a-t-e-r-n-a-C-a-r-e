import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: 'معرّف فترة التوفر المراد حجزها' })
  @IsUUID()
  availabilitySlotId: string;

  @ApiProperty({ description: 'معرّف سبب الحجز' })
  @IsUUID()
  reasonId: string;

  @ApiPropertyOptional({
    description: 'إجابات استبيان سريع اختياري قبل الحجز، بصيغة مرنة',
    example: { hasSupportSystem: true, previouslySoughtHelp: false },
  })
  @IsOptional()
  @IsObject()
  questionnaireAnswers?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'طريقة الدفع غير صالحة' })
  paymentMethod?: PaymentMethod;
}
