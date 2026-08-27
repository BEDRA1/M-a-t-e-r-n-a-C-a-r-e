"use client";

import { CheckCircle, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";
import { ApiError } from "@/lib/api-client";
import { useSubscribe } from "@/lib/hooks/useSubscriptions";
import type { BaridimobPaymentData, CardPaymentData, PaymentMethodKind } from "@/lib/hooks/useSimulatedPayment";
import type { SubscriptionPlan } from "@/lib/types";

export function PaymentOverlay({ plan, onClose }: { plan: SubscriptionPlan; onClose: () => void }) {
  const subscribe = useSubscribe();

  // "visa" هو القيمة الوحيدة المتاحة في SubscriptionPaymentMethod للبطاقة البنكية على
  // الـBackend (لا "gold_card"/"cib" ضمن الـenum) — تُبقى القيمة المُرسَلة كما هي، فقط
  // العلامة/الشعار الظاهران للمستخدمة أصبحا "البطاقة الذهبية CIB/EDAHABIA"
  const handlePaymentSubmit = (kind: PaymentMethodKind, data: CardPaymentData | BaridimobPaymentData) => {
    subscribe.mutate({
      planCode: plan.code,
      paymentMethod: kind === "card" ? "visa" : "baridimob",
      paymentData: data as unknown as Record<string, string>,
    });
  };

  const errorMessage = subscribe.isError
    ? subscribe.error instanceof ApiError
      ? subscribe.error.message
      : "تعذّرت عملية الدفع"
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <Card className="relative w-full max-w-md">
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 text-muted hover:text-foreground"
          aria-label="إغلاق"
        >
          <X className="size-5" strokeWidth={2} />
        </button>

        {subscribe.isSuccess ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="size-8" strokeWidth={2} />
            </span>
            <p className="text-lg font-extrabold text-foreground">تم الاشتراك بنجاح</p>
            <p className="text-sm text-muted">أصبحت الآن مشتركة في باقة {plan.nameAr}</p>
            <Button className="mt-2 w-full justify-center" onClick={onClose}>
              حسنًا
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-lg font-extrabold text-foreground">الاشتراك في باقة {plan.nameAr}</p>
            <p className="mt-1 text-sm text-muted">اختاري طريقة الدفع المناسبة لإتمام اشتراكك.</p>

            <div className="mt-4">
              <PaymentMethodSelector
                amount={plan.price}
                submitting={subscribe.isPending}
                errorMessage={errorMessage}
                onSubmit={handlePaymentSubmit}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
