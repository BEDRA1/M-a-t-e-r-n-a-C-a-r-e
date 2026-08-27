import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPaymentMethod } from '@prisma/client';
import { IsEnum, IsObject, IsString, MinLength } from 'class-validator';

export class SubscribeDto {
  @ApiProperty({ example: 'premium', description: 'كود الباقة (basic/premium/royal/postpartum/couples)' })
  @IsString()
  @MinLength(1)
  planCode: string;

  @ApiProperty({ enum: SubscriptionPaymentMethod })
  @IsEnum(SubscriptionPaymentMethod, { message: 'طريقة الدفع غير صالحة' })
  paymentMethod: SubscriptionPaymentMethod;

  @ApiProperty({
    description:
      'بيانات الدفع: Visa (cardNumber, expiryMonth, expiryYear, cvv, holderName) أو BaridiMob (phoneNumber, verificationCode)',
    example: { cardNumber: '4111111111111111', expiryMonth: '12', expiryYear: '2030', cvv: '123', holderName: 'Amina B.' },
  })
  @IsObject()
  paymentData: Record<string, string>;
}
