import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { PaymentProvider } from './payment.provider';

const REJECTED_MESSAGE = 'تم رفض الدفع';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isExpiryInPast(month: string, year: string): boolean {
  const expiryMonth = Number(month);
  const expiryYear = Number(year);
  if (!Number.isInteger(expiryMonth) || !Number.isInteger(expiryYear)) {
    return true;
  }
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const normalizedYear = expiryYear < 100 ? 2000 + expiryYear : expiryYear;
  if (normalizedYear < currentYear) return true;
  if (normalizedYear === currentYear && expiryMonth < currentMonth) return true;
  return false;
}

/**
 * محاكاة واقعية لبوابة دفع جزائرية (Visa/BaridiMob) — لا اتصال فعلي بأي بنك.
 * تطبّق نفس الـinterface الذي سيطبّقه ChargilyPaymentProvider لاحقًا عند التكامل الحقيقي،
 * فاستبدالها يتم عبر تغيير provider واحد في payments.module.ts دون لمس أي كود آخر.
 */
@Injectable()
export class SimulatedPaymentProvider implements PaymentProvider {
  async createPaymentIntent(): Promise<{ id: string; status: 'pending' }> {
    return { id: `sim_${randomUUID()}`, status: 'pending' };
  }

  async processPayment(params: {
    intentId: string;
    method: 'visa' | 'baridimob';
    paymentData: Record<string, string>;
  }): Promise<{ status: 'succeeded' | 'failed'; message?: string }> {
    if (params.method === 'visa') {
      return this.processVisa(params.paymentData);
    }
    return this.processBaridimob(params.paymentData);
  }

  private async processVisa(
    paymentData: Record<string, string>,
  ): Promise<{ status: 'succeeded' | 'failed'; message?: string }> {
    const cardNumber = (paymentData.cardNumber ?? '').replace(/\s+/g, '');
    const { expiryMonth, expiryYear, cvv } = paymentData;

    if (!/^\d{16}$/.test(cardNumber)) {
      return { status: 'failed', message: 'رقم البطاقة غير صالح، يجب أن يتكون من 16 رقمًا' };
    }
    if (isExpiryInPast(expiryMonth, expiryYear)) {
      return { status: 'failed', message: 'تاريخ انتهاء صلاحية البطاقة غير صالح' };
    }
    if (!/^\d{3,4}$/.test(cvv ?? '')) {
      return { status: 'failed', message: 'رمز CVV غير صالح' };
    }

    await delay(2000);

    if (cardNumber.startsWith('0000')) {
      return { status: 'failed', message: REJECTED_MESSAGE };
    }
    return { status: 'succeeded' };
  }

  private async processBaridimob(
    paymentData: Record<string, string>,
  ): Promise<{ status: 'succeeded' | 'failed'; message?: string }> {
    const phoneNumber = paymentData.phoneNumber ?? '';
    const verificationCode = paymentData.verificationCode ?? '';

    if (!/^0\d{9}$/.test(phoneNumber)) {
      return { status: 'failed', message: 'رقم هاتف BaridiMob غير صالح' };
    }
    if (!/^\d{6}$/.test(verificationCode)) {
      return { status: 'failed', message: 'رمز التحقق غير صالح' };
    }

    await delay(1500);

    if (phoneNumber.endsWith('0000')) {
      return { status: 'failed', message: REJECTED_MESSAGE };
    }
    return { status: 'succeeded' };
  }
}
