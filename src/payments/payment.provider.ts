export interface PaymentProvider {
  createPaymentIntent(params: {
    amount: number;
    currency: string;
    method: 'visa' | 'baridimob';
    metadata: Record<string, string>;
  }): Promise<{ id: string; status: 'pending' }>;

  processPayment(params: {
    intentId: string;
    method: 'visa' | 'baridimob';
    // Visa: cardNumber, expiryMonth, expiryYear, cvv, holderName
    // BaridiMob: phoneNumber, verificationCode
    paymentData: Record<string, string>;
  }): Promise<{ status: 'succeeded' | 'failed'; message?: string }>;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';
