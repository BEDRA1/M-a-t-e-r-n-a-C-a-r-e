"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingBasket, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DateTimePicker, dateTimeValueToIso, type DateTimePickerValue } from "@/components/shared/DateTimePicker";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";
import { cn } from "@/lib/cn";
import { formatDzd, mealTypeLabel } from "@/lib/format";
import { ApiError } from "@/lib/api-client";
import { useCreateMealOrder } from "@/lib/hooks/useNutrition";
import { useSimulatedPayment, type BaridimobPaymentData, type CardPaymentData, type PaymentMethodKind } from "@/lib/hooks/useSimulatedPayment";
import {
  mealOrderCheckoutSchema,
  type MealOrderCheckoutFormValues,
} from "@/lib/validation/meal-order";
import type { WeeklyMeal } from "@/lib/types";

type Stage = "details" | "payment";

export function MealCartPanel({
  meals,
  cart,
  onDecrement,
  onClear,
  variant = "card",
}: {
  meals: WeeklyMeal[];
  cart: Record<string, number>;
  onDecrement: (mealId: string) => void;
  onClear: () => void;
  /** "sheet": بلا غلاف Card خاص بها (تُستخدم داخل BottomSheet الذي يوفر السطح والحواف بنفسه) */
  variant?: "card" | "sheet";
}) {
  const createOrder = useCreateMealOrder();
  const simulatedPayment = useSimulatedPayment();
  const [stage, setStage] = useState<Stage>("details");
  const [pendingValues, setPendingValues] = useState<MealOrderCheckoutFormValues | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dateTimeValue, setDateTimeValue] = useState<DateTimePickerValue | null>(null);
  // لا توصيل في نفس اليوم — الحد الأدنى غدًا
  const minDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MealOrderCheckoutFormValues>({
    resolver: zodResolver(mealOrderCheckoutSchema),
  });

  const mealsById = new Map(meals.map((meal) => [meal.id, meal]));
  const cartEntries = Object.entries(cart)
    .filter(([, quantity]) => quantity > 0)
    .map(([mealId, quantity]) => ({ meal: mealsById.get(mealId), quantity }))
    .filter((entry): entry is { meal: WeeklyMeal; quantity: number } => Boolean(entry.meal));

  const estimatedTotal = cartEntries.reduce((sum, entry) => sum + entry.meal.price * entry.quantity, 0);
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
      await createOrder.mutateAsync({
        items: cartEntries.map((entry) => ({ mealId: entry.meal.id, quantity: entry.quantity })),
        deliveryAddress: pendingValues.deliveryAddress,
        preferredTime: pendingValues.preferredTime,
      });
      onClear();
      reset({ deliveryAddress: "", preferredTime: "" });
      setDateTimeValue(null);
      setPendingValues(null);
      setStage("details");
      setSuccessMessage("تم إرسال طلبك بنجاح");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر إرسال الطلب");
    }
  };

  const Wrapper = variant === "sheet" ? "div" : Card;

  return (
    <Wrapper className={cn("flex flex-col gap-4", variant === "card" && "lg:sticky lg:top-24")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBasket className="size-5 text-primary-500" strokeWidth={2} />
          <p className="font-bold text-foreground">سلة الطلب</p>
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
        <p className="text-sm text-muted">أضيفي وجبات من قائمة الأسبوع لبدء طلبك.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {cartEntries.map((entry) => (
            <div key={entry.meal.id} className="flex items-start justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {entry.meal.name}
                  <span className="text-muted"> × {entry.quantity}</span>
                </p>
                <p className="text-xs text-muted">{mealTypeLabel(entry.meal.mealType)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-semibold text-foreground">
                  {formatDzd(entry.meal.price * entry.quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => onDecrement(entry.meal.id)}
                  className="text-muted hover:text-red-600"
                  aria-label={`إزالة ${entry.meal.name}`}
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

      {successMessage && <Alert tone="success">{successMessage}</Alert>}

      {!isEmpty &&
        (stage === "details" ? (
          <form onSubmit={goToPayment} className="flex flex-col gap-3 border-t border-black/5 pt-4" noValidate>
            <Input
              label="عنوان التوصيل"
              placeholder="مثال: حي السلام، الجزائر العاصمة"
              error={errors.deliveryAddress?.message}
              {...register("deliveryAddress")}
            />

            <DateTimePicker
              label="الوقت المفضل للتوصيل"
              value={dateTimeValue}
              minDate={minDeliveryDate}
              onChange={(next) => {
                setDateTimeValue(next);
                setValue("preferredTime", dateTimeValueToIso(next), { shouldValidate: true });
              }}
            />
            {errors.preferredTime && <p className="text-xs text-red-600">{errors.preferredTime.message}</p>}

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
              رجوع لتعديل الطلب
            </Button>
          </div>
        ))}
    </Wrapper>
  );
}
