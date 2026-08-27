"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DateTimePicker, dateTimeValueToIso, type DateTimePickerValue } from "@/components/shared/DateTimePicker";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";
import { ApiError } from "@/lib/api-client";
import { formatArabicDateTime } from "@/lib/format";
import { useCreateServiceBooking } from "@/lib/hooks/useHomeServices";
import { useSimulatedPayment, type BaridimobPaymentData, type CardPaymentData, type PaymentMethodKind } from "@/lib/hooks/useSimulatedPayment";
import {
  serviceBookingSchema,
  type ServiceBookingFormValues,
} from "@/lib/validation/service-booking";
import type { ServiceBooking } from "@/lib/types";

type Stage = "details" | "payment";

export function ServiceBookingForm({
  serviceId,
  price,
  onDone,
}: {
  serviceId: string;
  price: number;
  onDone: () => void;
}) {
  const createBooking = useCreateServiceBooking();
  const simulatedPayment = useSimulatedPayment();
  const [stage, setStage] = useState<Stage>("details");
  const [pendingValues, setPendingValues] = useState<ServiceBookingFormValues | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<ServiceBooking | null>(null);
  const [dateTimeValue, setDateTimeValue] = useState<DateTimePickerValue | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ServiceBookingFormValues>({
    resolver: zodResolver(serviceBookingSchema),
  });

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
      const booking = await createBooking.mutateAsync({
        serviceId,
        scheduledTime: pendingValues.scheduledTime,
        address: pendingValues.address,
        notes: pendingValues.notes || undefined,
      });
      setConfirmedBooking(booking);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "تعذّر إتمام الحجز");
    }
  };

  if (confirmedBooking) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border-t border-black/5 bg-emerald-50 p-4 pt-6 text-center">
        <CheckCircle2 className="size-8 text-emerald-600" strokeWidth={2} />
        <p className="text-sm font-bold text-emerald-700">تم تأكيد الحجز بنجاح</p>
        <p className="text-xs text-muted">
          رقم الحجز: <span dir="ltr">{confirmedBooking.id.slice(0, 8)}</span>
        </p>
        <p className="text-xs text-muted">{formatArabicDateTime(confirmedBooking.scheduledTime)}</p>
        <Button className="mt-2 w-full" onClick={onDone}>
          حسنًا
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-black/5 pt-4">
      {stage === "details" ? (
        <form onSubmit={goToPayment} className="flex flex-col gap-3" noValidate>
          <DateTimePicker
            label="موعد الخدمة"
            value={dateTimeValue}
            onChange={(next) => {
              setDateTimeValue(next);
              setValue("scheduledTime", dateTimeValueToIso(next), { shouldValidate: true });
            }}
          />
          {errors.scheduledTime && <p className="text-xs text-red-600">{errors.scheduledTime.message}</p>}

          <Input
            label="العنوان"
            placeholder="مثال: حي السلام، الجزائر العاصمة"
            error={errors.address?.message}
            {...register("address")}
          />

          <Input
            label="ملاحظات (اختياري)"
            placeholder="أي تفاصيل إضافية تساعد مقدّم الخدمة"
            error={errors.notes?.message}
            {...register("notes")}
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="w-full sm:w-auto">
              متابعة إلى الدفع
            </Button>
            <Button type="button" variant="ghost" onClick={onDone} className="w-full sm:w-auto">
              إلغاء
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          {serverError && <Alert tone="error">{serverError}</Alert>}
          <PaymentMethodSelector
            amount={price}
            submitting={simulatedPayment.isPending || createBooking.isPending}
            errorMessage={simulatedPayment.error}
            onSubmit={handlePaymentSubmit}
          />
          <Button type="button" variant="ghost" onClick={() => setStage("details")} className="self-start">
            رجوع لتعديل الموعد
          </Button>
        </div>
      )}
    </div>
  );
}
