"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDzd } from "@/lib/format";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import type { BaridimobPaymentData, CardPaymentData, PaymentMethodKind } from "@/lib/hooks/useSimulatedPayment";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { GoldCardLogo } from "./payment-logos/GoldCardLogo";
import { BaridiMobLogo } from "./payment-logos/BaridiMobLogo";
import {
  baridimobPhoneSchema,
  cardPaymentSchema,
  otpSchema,
  type BaridimobPhoneFormValues,
  type CardPaymentFormValues,
} from "@/lib/validation/payment";

interface PaymentMethodSelectorProps {
  amount: number;
  submitting: boolean;
  errorMessage?: string | null;
  onSubmit: (method: PaymentMethodKind, data: CardPaymentData | BaridimobPaymentData) => void;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** ستة خانات OTP منفصلة، التركيز ينتقل تلقائيًا للخانة التالية عند الإدخال وللسابقة عند
 * Backspace على خانة فارغة — dir="ltr" مقصود هنا فقط (استثناء ضيّق مثل اتجاه سهمَي الأشهر في
 * DateTimePicker): تسلسل أرقام يُدخَل ويُقرأ من اليسار لليمين حتى داخل واجهة RTL */
function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  function setDigitAt(i: number, d: string) {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join(""));
  }

  function handleChange(i: number, raw: string) {
    const d = raw.replace(/\D/g, "");
    if (!d) {
      setDigitAt(i, "");
      return;
    }
    setDigitAt(i, d.slice(-1));
    if (i < 5) inputsRef.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  return (
    <div className="flex justify-center gap-2" dir="ltr">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          autoFocus={i === 0}
          className="size-11 rounded-xl border border-black/10 bg-surface text-center text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      ))}
    </div>
  );
}

function CardForm({
  amount,
  submitting,
  onSubmit,
}: {
  amount: number;
  submitting: boolean;
  onSubmit: (data: CardPaymentData) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CardPaymentFormValues>({ resolver: zodResolver(cardPaymentSchema) });

  const cardNumberField = register("cardNumber");
  const expiryField = register("expiry");

  const submit = handleSubmit((values) => {
    const [expiryMonth, expiryYear] = values.expiry.split("/");
    onSubmit({ holderName: values.holderName, cardNumber: values.cardNumber, expiryMonth, expiryYear, cvv: values.cvv });
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <Input
        label="اسم صاحب البطاقة"
        placeholder="مثال: أمينة بن عودة"
        error={errors.holderName?.message}
        {...register("holderName")}
      />
      <Input
        label="رقم البطاقة"
        placeholder="XXXX XXXX XXXX XXXX"
        inputMode="numeric"
        dir="ltr"
        error={errors.cardNumber?.message}
        {...cardNumberField}
        onChange={(e) => {
          e.target.value = formatCardNumber(e.target.value);
          cardNumberField.onChange(e);
          setValue("cardNumber", e.target.value);
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="تاريخ الانتهاء"
          placeholder="MM/YY"
          inputMode="numeric"
          dir="ltr"
          error={errors.expiry?.message}
          {...expiryField}
          onChange={(e) => {
            e.target.value = formatExpiry(e.target.value);
            expiryField.onChange(e);
            setValue("expiry", e.target.value);
          }}
        />
        <Input
          label="CVV"
          placeholder="123"
          type="password"
          inputMode="numeric"
          maxLength={3}
          dir="ltr"
          error={errors.cvv?.message}
          {...register("cvv")}
        />
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <Lock className="size-3.5" strokeWidth={2} />
        دفع آمن ومشفر
      </p>
      <Button type="submit" loading={submitting} className="w-full justify-center">
        دفع {formatDzd(amount)}
      </Button>
    </form>
  );
}

function BaridimobForm({
  amount,
  submitting,
  onSubmit,
}: {
  amount: number;
  submitting: boolean;
  onSubmit: (data: BaridimobPaymentData) => void;
}) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const phoneForm = useForm<BaridimobPhoneFormValues>({ resolver: zodResolver(baridimobPhoneSchema) });
  const otpValid = otpSchema.safeParse({ code: otp }).success;

  const submitPhone = phoneForm.handleSubmit((values) => setPhoneNumber(values.phoneNumber));

  function submitOtp() {
    if (!otpValid || !phoneNumber) return;
    onSubmit({ phoneNumber, verificationCode: otp });
  }

  if (!phoneNumber) {
    return (
      <form onSubmit={submitPhone} className="flex flex-col gap-3" noValidate>
        <Input
          label="رقم الهاتف"
          placeholder="0555XXXXXX"
          inputMode="numeric"
          dir="ltr"
          error={phoneForm.formState.errors.phoneNumber?.message}
          {...phoneForm.register("phoneNumber")}
        />
        <Button type="submit" className="w-full justify-center">
          إرسال رمز التحقق
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        أُرسل رمز تحقق مكوّن من 6 أرقام إلى{" "}
        <span className="font-semibold text-foreground" dir="ltr">
          {phoneNumber}
        </span>
      </p>
      <OtpBoxes value={otp} onChange={setOtp} />
      <button
        type="button"
        onClick={() => {
          setPhoneNumber(null);
          setOtp("");
        }}
        className="self-start text-xs font-medium text-primary-600 hover:underline"
      >
        تغيير رقم الهاتف
      </button>
      <Button type="button" onClick={submitOtp} disabled={!otpValid} loading={submitting} className="w-full justify-center">
        تأكيد الدفع {formatDzd(amount)}
      </Button>
    </div>
  );
}

export function PaymentMethodSelector({ amount, submitting, errorMessage, onSubmit }: PaymentMethodSelectorProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethodKind | null>(null);

  const body = (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-bold text-foreground">
        المبلغ المطلوب: <span className="text-primary-700">{formatDzd(amount)}</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMethod("card")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-colors",
            method === "card" ? "border-yellow-500 bg-yellow-50" : "border-black/10 bg-surface hover:border-yellow-300",
          )}
        >
          <GoldCardLogo className="h-8 w-12" />
          <span className="text-sm font-bold text-foreground">البطاقة الذهبية</span>
          <span className="text-xs text-muted">CIB / EDAHABIA</span>
        </button>
        <button
          type="button"
          onClick={() => setMethod("baridimob")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-colors",
            method === "baridimob"
              ? "border-orange-500 bg-orange-50"
              : "border-black/10 bg-surface hover:border-orange-300",
          )}
        >
          <BaridiMobLogo className="size-8" />
          <span className="text-sm font-bold text-foreground">بريدي موب</span>
          <span className="text-xs text-muted">الدفع عبر تطبيق بريدي موب</span>
        </button>
      </div>

      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

      {method === "card" && (
        <CardForm amount={amount} submitting={submitting} onSubmit={(data) => onSubmit("card", data)} />
      )}
      {method === "baridimob" && (
        <BaridimobForm amount={amount} submitting={submitting} onSubmit={(data) => onSubmit("baridimob", data)} />
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">طريقة الدفع</span>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-black/10 bg-surface px-4 py-3 text-start text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300"
      >
        <CreditCard className="size-4 shrink-0 text-primary-500" />
        <span className="text-muted">اختيار طريقة الدفع — {formatDzd(amount)}</span>
      </button>

      {isDesktop ? (
        isOpen && <div className="mt-1 rounded-2xl border border-black/10 bg-surface p-4 shadow-lg">{body}</div>
      ) : (
        <BottomSheet open={isOpen} onClose={() => setIsOpen(false)} title="الدفع">
          {body}
        </BottomSheet>
      )}
    </div>
  );
}
