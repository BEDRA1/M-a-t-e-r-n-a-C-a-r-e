"use client";

import { useCallback, useState } from "react";

export interface CardPaymentData {
  holderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface BaridimobPaymentData {
  phoneNumber: string;
  verificationCode: string;
}

export type PaymentMethodKind = "card" | "baridimob";

/**
 * محاكاة دفع من طرف العميل فقط (بلا أي استدعاء خلفي) — تُستخدم في الأسطح التي لا يملك
 * الـBackend فيها حقل دفع أصلاً (الخدمات المنزلية، الوجبات، المتجر، تسجيل الدورات).
 * نفس قاعدة الرفض (رقم بطاقة يبدأ بـ0000 / هاتف BaridiMob ينتهي بـ0000) مطابقة لما تحقّقتُ
 * من أن الـBackend الحقيقي يطبّقه فعليًا في مسار الاشتراكات (subscriptions/subscribe) —
 * توحيدًا للسلوك عبر التطبيق كله رغم اختلاف آلية التنفيذ.
 */
export function useSimulatedPayment() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (method: PaymentMethodKind, data: CardPaymentData | BaridimobPaymentData): Promise<boolean> => {
      setError(null);
      setIsPending(true);
      await new Promise((resolve) => setTimeout(resolve, method === "card" ? 2000 : 1500));

      const isRejected =
        method === "card"
          ? (data as CardPaymentData).cardNumber.replace(/\s+/g, "").startsWith("0000")
          : (data as BaridimobPaymentData).phoneNumber.replace(/\D/g, "").endsWith("0000");

      setIsPending(false);
      if (isRejected) {
        setError("تم رفض الدفع");
        return false;
      }
      return true;
    },
    [],
  );

  const resetError = useCallback(() => setError(null), []);

  return { submit, isPending, error, resetError };
}
