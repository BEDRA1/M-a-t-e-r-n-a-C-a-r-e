import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPaymentMethod } from '@prisma/client';
import { IsIn, IsObject, IsString, MinLength } from 'class-validator';

export class SubscribeDto {
  @ApiProperty({ example: 'premium', description: 'كود الباقة (basic/premium/royal/postpartum/couples)' })
  @IsString()
  @MinLength(1)
  planCode: string;

  // قائمة صريحة لا IsEnum: SubscriptionPaymentMethod يضم manual (منح الإدارة) الذي لا يجوز
  // أن تختاره المستخدمة بنفسها — وإلا لتجاوزت الدفع كليًا
  @ApiProperty({ enum: [SubscriptionPaymentMethod.visa, SubscriptionPaymentMethod.baridimob] })
  @IsIn([SubscriptionPaymentMethod.visa, SubscriptionPaymentMethod.baridimob], { message: 'طريقة الدفع غير صالحة' })
  paymentMethod: 'visa' | 'baridimob';

  @ApiProperty({
    description:
      'بيانات الدفع: Visa (cardNumber, expiryMonth, expiryYear, cvv, holderName) أو BaridiMob (phoneNumber, verificationCode)',
    example: { cardNumber: '4111111111111111', expiryMonth: '12', expiryYear: '2030', cvv: '123', holderName: 'Amina B.' },
  })
  @IsObject()
  paymentData: Record<string, string>;
}
