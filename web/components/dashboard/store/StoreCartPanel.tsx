"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ShoppingBasket, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";
import { cn } from "@/lib/cn";
import { formatDzd } from "@/lib/format";
import { ApiError } from "@/lib/api-client";
import { useCreateProductOrder } from "@/lib/hooks/useStore";
import { useSimulatedPayment, type BaridimobPaymentData, type CardPaymentData, type PaymentMethodKind } from "@/lib/hooks/useSimulatedPayment";
import {
  productOrderCheckoutSchema,
  type ProductOrderCheckoutFormValues,
} from "@/lib/validation/product-order";
import type { Product, ProductOrder } from "@/lib/types";

type Stage = "details" | "payment";

export function StoreCartPanel({
  products,
  cart,
  onDecrement,
  onClear,
  variant = "card",
}: {
  products: Product[];
  cart: Record<string, number>;
  onDecrement: (productId: string) => void;
  onClear: () => void;
  /** "sheet": بلا غلاف Card خاص بها (تُستخدم داخل BottomSheet الذي يوفر السطح والحواف بنفسه) */
  variant?: "card" | "sheet";
}) {
  const createOrder = useCreateProductOrder();
  const simulatedPayment = useSimulatedPayment();
  const [stage, setStage] = useState<Stage>("details");
  const [pendingValues, setPendingValues] = useState<ProductOrderCheckoutFormValues | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ProductOrder | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductOrderCheckoutFormValues>({
    resolver: zodResolver(productOrderCheckoutSchema),
  });

  const productsById = new Map(products.map((product) => [product.id, product]));
  const cartEntries = Object.entries(cart)
    .filter(([, quantity]) => quantity > 0)
    .map(([productId, quantity]) => ({ product: productsById.get(productId), quantity }))
    .filter((entry): entry is { product: Product; quantity: number } => Boolean(entry.product));

  const estimatedTotal = cartEntries.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
  const isEmpty = cartEntries.length === 0;

  const goToPayment = handleSubmit((values) => {
    setPendingValues(values);
    setStage("payment");
  });

  const handlePaymentSubmit = async (kind: PaymentMethodKind, data: CardPaymentData | BaridimobPaymentData) => {
    if (!pendingValues) return;
    const approved = await simulatedPayment.submit(kind, data);
    if (!approved) return;
    setServerError(null);
    try {
      const order = await createOrder.mutateAsync({
        items: cartEntries.map((entry) => ({ productId: entry.product.id, quantity: entry.quantity })),
        deliveryAddress: pendingValues.deliveryAddress,
      });
      onClear();
      reset({ deliveryAddress: "" });
      setConfirmedOrder(order);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setServerError(`${err.message}. يرجى مراجعة السلة وتعديل الكميات ثم إعادة المحاولة.`);
      } else {
        setServerError(err instanceof ApiError ? err.message : "تعذّر إرسال الطلب");
      }
    }
  };

  const Wrapper = variant === "sheet" ? "div" : Card;

  if (confirmedOrder) {
    return (
      <Wrapper className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 py-6 text-center">
        <CheckCircle2 className="size-8 text-emerald-600" strokeWidth={2} />
        <p className="text-sm font-bold text-emerald-700">تم إرسال طلبك بنجاح</p>
        <p className="text-xs text-muted">
          رقم الطلب: <span dir="ltr">{confirmedOrder.id.slice(0, 8)}</span>
        </p>
        <p className="text-xs text-muted">{formatDzd(confirmedOrder.totalPrice)}</p>
        <Button
          className="mt-2 w-full max-w-xs"
          onClick={() => {
            setConfirmedOrder(null);
            setStage("details");
          }}
        >
          حسنًا
        </Button>
      </Wrapper>
    );
  }

  return (
    <Wrapper className={cn("flex flex-col gap-4", variant === "card" && "lg:sticky lg:top-24")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBasket className="size-5 text-primary-500" strokeWidth={2} />
          <p className="font-bold text-foreground">سلة المشتريات</p>
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-red-600"
          >
            <Trash2 className="size-3.5" strokeWidth={2} />
            إفراغ السلة
          </button>
        )}
      </div>

      {isEmpty ? (
        <p className="text-sm text-muted">أضيفي منتجات من الكتالوج لبدء طلبك.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {cartEntries.map((entry) => (
            <div key={entry.product.id} className="flex items-start justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {entry.product.name}
                  <span className="text-muted"> × {entry.quantity}</span>
                </p>
                <p className="text-xs text-muted">{entry.product.category}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="whitespace-nowrap font-semibold text-foreground">
                  {formatDzd(entry.product.price * entry.quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => onDecrement(entry.product.id)}
                  className="text-muted hover:text-red-600"
                  aria-label={`إزالة ${entry.product.name}`}
                >
                  <Trash2 className="size-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}

          <div className="mt-1 flex items-center justify-between border-t border-black/5 pt-3 text-sm font-bold text-foreground">
            <span>المجموع التقديري</span>
            <span>{formatDzd(estimatedTotal)}</span>
          </div>
          <p className="text-xs text-muted">
            هذا مجموع تقديري، والسعر النهائي يُحدَّد من طرف الخادم عند تأكيد الطلب.
          </p>
        </div>
      )}

      {!isEmpty &&
        (stage === "details" ? (
          <form onSubmit={goToPayment} className="flex flex-col gap-3 border-t border-black/5 pt-4" noValidate>
            <Input
              label="عنوان التوصيل"
              placeholder="مثال: حي بن عكنون، الجزائر العاصمة"
              error={errors.deliveryAddress?.message}
              {...register("deliveryAddress")}
            />

            <Button type="submit">متابعة إلى الدفع</Button>
          </form>
        ) : (
          <div className="flex flex-col gap-3 border-t border-black/5 pt-4">
            {serverError && <Alert tone="error">{serverError}</Alert>}
            <PaymentMethodSelector
              amount={estimatedTotal}
              submitting={simulatedPayment.isPending || createOrder.isPending}
              errorMessage={simulatedPayment.error}
              onSubmit={handlePaymentSubmit}
            />
            <Button type="button" variant="ghost" onClick={() => setStage("details")} className="self-start">
              رجوع لتعديل العنوان
            </Button>
          </div>
        ))}
    </Wrapper>
  );
}
