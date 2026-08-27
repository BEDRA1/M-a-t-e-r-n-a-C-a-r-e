import { Module } from '@nestjs/common';
import { PAYMENT_PROVIDER } from './payment.provider';
import { SimulatedPaymentProvider } from './simulated-payment.provider';

// عند التكامل الحقيقي: أنشئي ChargilyPaymentProvider يطبّق نفس PaymentProvider،
// واستبدلي useClass هنا فقط — لا حاجة لأي تغيير في subscriptions module.
@Module({
  providers: [{ provide: PAYMENT_PROVIDER, useClass: SimulatedPaymentProvider }],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentsModule {}
