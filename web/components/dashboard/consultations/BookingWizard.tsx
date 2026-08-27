"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { Check, Info, MapPin, Users as UsersIcon, UserRound, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { DateTimePicker, type DateTimePickerValue } from "@/components/shared/DateTimePicker";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";
import { cn } from "@/lib/cn";
import { ApiError } from "@/lib/api-client";
import { formatArabicDateTime, consultationTypeLabel, paymentMethodLabel } from "@/lib/format";
import { useSpecialists, useSpecialist } from "@/lib/hooks/useSpecialists";
import { useAvailableSlots } from "@/lib/hooks/useSpecialistAvailability";
import { useConsultationReasons } from "@/lib/hooks/useConsultationReasons";
import { useCreateBooking } from "@/lib/hooks/useBookings";
import { useServicePricing } from "@/lib/hooks/useServicePricing";
import { useSimulatedPayment, type BaridimobPaymentData, type CardPaymentData, type PaymentMethodKind } from "@/lib/hooks/useSimulatedPayment";
import { formatDzd } from "@/lib/format";
import { filterVisibleSpecialists, isTrackCode, specialistPhotoSrc, TRACKS } from "@/lib/tracks";
import type { ConsultationType, PaymentMethod, Specialist, SpecialistAvailabilitySlot } from "@/lib/types";

/** يحوّل تاريخ ISO لموعد فتحة إلى {date, time} محليَّين — مفتاح البحث في خريطة الفتحات الحقيقية */
function slotDateTimeParts(dateString: string): { date: string; time: string } {
  const d = new Date(dateString);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

const QUESTIONNAIRE_QUESTIONS: { key: string; text: string }[] = [
  { key: "isFirstConsultation", text: "هل هذه استشارتك الأولى معنا؟" },
  { key: "hasAnxietySymptoms", text: "هل تعانين من أعراض قلق أو توتر حاليًا؟" },
  { key: "withSpouse", text: "هل تودين حضور الاستشارة برفقة زوجك؟" },
];

/** انتقال أفقي بين خطوات المعالج — RTL: التقدّم للأمام (التالي) يجعل الخطوة الجديدة تدخل من اليسار،
 * والرجوع (السابق) يعكس الاتجاه فتدخل الخطوة السابقة من اليمين */
const stepSlideVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? -24 : 24 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 24 : -24,
    transition: { duration: 0.2, ease: "easeIn" },
  }),
};

interface StepDef {
  key: "specialist" | "type" | "slot" | "reason" | "questionnaire" | "payment" | "confirm";
  label: string;
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
              i < current
                ? "bg-primary-500 text-white"
                : i === current
                  ? "bg-primary-500 text-white ring-2 ring-primary-200"
                  : "border border-black/10 text-muted",
            )}
          >
            {i < current ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
          </span>
          {i < total - 1 && (
            <span className={cn("h-px w-4 sm:w-6", i < current ? "bg-primary-300" : "bg-black/10")} />
          )}
        </div>
      ))}
    </div>
  );
}

function SelectableCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-4 text-start transition-[border-color,background-color,transform] active:scale-[0.99]",
        selected
          ? "border-primary-400 bg-primary-50"
          : "border-black/10 bg-surface hover:border-primary-200",
      )}
    >
      <span className="text-sm">{children}</span>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-primary-500 bg-primary-500 text-white" : "border-black/20 bg-transparent",
        )}
        aria-hidden="true"
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}

/** صف اختيار أخصائي مع زر "نبذة" منفصل (لا يمكن تعشيش زر داخل زر، لذا مركّب من صفّين تفاعليين) */
function SpecialistOption({
  specialist,
  selected,
  onSelect,
  onViewBio,
}: {
  specialist: Specialist;
  selected: boolean;
  onSelect: () => void;
  onViewBio: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-2xl border-2 px-2 py-2 transition-colors",
        selected ? "border-primary-400 bg-primary-50" : "border-black/10 bg-surface",
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className="flex flex-1 items-center justify-between gap-3 rounded-xl px-2 py-2 text-start"
      >
        <span className="text-sm">
          <span className="block font-semibold text-foreground">{specialist.fullName}</span>
          <span className="block text-xs text-muted">{specialist.specialty}</span>
          <span className="block text-xs text-muted">
            {specialist.yearsExperience} سنوات خبرة{specialist.user?.wilaya ? ` · ${specialist.user.wilaya}` : ""}
          </span>
        </span>
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            selected ? "border-primary-500 bg-primary-500 text-white" : "border-black/20 bg-transparent",
          )}
          aria-hidden="true"
        >
          {selected && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      </button>
      <button
        type="button"
        onClick={onViewBio}
        aria-label={`نبذة عن ${specialist.fullName}`}
        className="flex size-11 shrink-0 items-center justify-center rounded-full text-primary-600 transition-colors hover:bg-primary-100"
      >
        <Info className="size-5" strokeWidth={2} />
      </button>
    </div>
  );
}

export function BookingWizard() {
  const searchParams = useSearchParams();
  const preselectedSpecialistId = searchParams.get("specialistId");
  const hasPreselectedSpecialist = Boolean(preselectedSpecialistId);
  const trackParam = searchParams.get("track");
  const track = trackParam && isTrackCode(trackParam) ? trackParam : undefined;

  const steps: StepDef[] = useMemo(
    () => [
      ...(hasPreselectedSpecialist ? [] : [{ key: "specialist" as const, label: "الأخصائي" }]),
      { key: "type", label: "نوع الاستشارة" },
      { key: "slot", label: "الفترة الزمنية" },
      { key: "reason", label: "سبب الحجز" },
      { key: "questionnaire", label: "استبيان سريع" },
      { key: "payment", label: "طريقة الدفع" },
      { key: "confirm", label: "التأكيد" },
    ],
    [hasPreselectedSpecialist],
  );

  const shouldReduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [stepDirection, setStepDirection] = useState(1);
  const [specialistId, setSpecialistId] = useState<string | null>(preselectedSpecialistId);
  const [consultationType, setConsultationType] = useState<ConsultationType | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [dateTimeValue, setDateTimeValue] = useState<DateTimePickerValue | null>(null);
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bioSheetSpecialistId, setBioSheetSpecialistId] = useState<string | null>(null);

  const specialist = useSpecialist(specialistId ?? undefined);
  const specialists = useSpecialists({ track });
  const visibleSpecialists = filterVisibleSpecialists(track, specialists.data ?? []);
  const availableSlots = useAvailableSlots({
    specialistId: specialistId ?? undefined,
    consultationType: consultationType ?? undefined,
  });
  const reasons = useConsultationReasons();
  const createBooking = useCreateBooking();
  const pricing = useServicePricing();
  const simulatedPayment = useSimulatedPayment();

  const inPersonPrice = pricing.data?.find(
    (p) => p.serviceKind === "consultation" && p.consultationType === "in_person",
  )?.price;
  const remotePrice = pricing.data?.find(
    (p) => p.serviceKind === "consultation" && p.consultationType === "remote",
  )?.price;

  // خريطة الفتحات الحقيقية المتاحة فعليًا من الأخصائية {تاريخ → {وقت → الفتحة}} — تُستخدم
  // لتقييد التقويم الحر بالأيام/الأوقات التي تملك فيها فتحة حقيقية فقط، دون كسر عقد الـBackend
  // الذي لا يقبل إلا availabilitySlotId (لا حقل تاريخ/وقت حر متاح من جهته)
  const slotsByDateTime = useMemo(() => {
    const map = new Map<string, Map<string, SpecialistAvailabilitySlot>>();
    for (const slot of availableSlots.data ?? []) {
      const { date, time } = slotDateTimeParts(slot.startTime);
      if (!map.has(date)) map.set(date, new Map());
      map.get(date)!.set(time, slot);
    }
    return map;
  }, [availableSlots.data]);

  const isDateAvailable = useCallback(
    (dateStr: string) => slotsByDateTime.has(dateStr),
    [slotsByDateTime],
  );
  const timeOptionsForDate = useCallback(
    (dateStr: string) => Array.from(slotsByDateTime.get(dateStr)?.keys() ?? []).sort(),
    [slotsByDateTime],
  );

  const currentStep = steps[stepIndex];
  const selectedSlot = availableSlots.data?.find((slot) => slot.id === slotId);
  const selectedReason = reasons.data?.find((reason) => reason.id === reasonId);
  const bioSpecialist = specialists.data?.find((s) => s.id === bioSheetSpecialistId);

  const canGoNext = (() => {
    switch (currentStep.key) {
      case "specialist":
        return Boolean(specialistId);
      case "type":
        return Boolean(consultationType);
      case "slot":
        return Boolean(slotId);
      case "reason":
        return Boolean(reasonId);
      case "questionnaire":
        return true;
      case "payment":
        return Boolean(paymentMethod);
      default:
        return false;
    }
  })();

  const goNext = () => {
    setStepDirection(1);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };
  const goBack = () => {
    setStepDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const handlePaymentSubmit = async (kind: PaymentMethodKind, data: CardPaymentData | BaridimobPaymentData) => {
    const approved = await simulatedPayment.submit(kind, data);
    if (approved) {
      setPaymentMethod(kind);
      goNext();
    }
  };

  const handleConfirm = async () => {
    if (!slotId || !reasonId) return;
    setSubmitError(null);
    try {
      await createBooking.mutateAsync({
        availabilitySlotId: slotId,
        reasonId,
        questionnaireAnswers,
        paymentMethod: paymentMethod ?? undefined,
      });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "تعذّر إتمام الحجز، حاولي مرة أخرى");
    }
  };

  if (createBooking.isSuccess) {
    return (
      <Card className="mx-auto flex max-w-lg flex-col items-center gap-4 py-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="size-7" strokeWidth={2.5} />
        </span>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">تم إرسال طلب حجزك</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            حجزك الآن بانتظار تأكيد الأخصائي. ستصلك حالة الحجز في صفحة &quot;حجوزاتي&quot;
            بمجرد تحديثها.
          </p>
        </div>
        <Link href="/dashboard/consultations/my-bookings" className="w-full">
          <Button className="w-full">الذهاب إلى حجوزاتي</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">
          {track ? `حجز استشارة — ${TRACKS[track].name}` : "حجز استشارة جديدة"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          الخطوة {stepIndex + 1} من {steps.length}: {currentStep.label}
        </p>
        <div className="mt-3 overflow-x-auto pb-1">
          <StepDots total={steps.length} current={stepIndex} />
        </div>
        <div className="mt-2">
          <ProgressBar percent={((stepIndex + 1) / steps.length) * 100} />
        </div>
      </div>

      <Card className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={stepDirection}>
          <motion.div
            key={currentStep.key}
            custom={stepDirection}
            variants={shouldReduceMotion ? undefined : stepSlideVariants}
            initial={shouldReduceMotion ? false : "enter"}
            animate="center"
            exit={shouldReduceMotion ? undefined : "exit"}
          >
        {currentStep.key === "specialist" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground">اختاري الأخصائي</h2>
            {specialists.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : visibleSpecialists.length === 0 ? (
              <Alert tone="info">لا يوجد أخصائيون معتمدون متاحون حاليًا.</Alert>
            ) : (
              <div className="flex flex-col gap-2">
                {visibleSpecialists.map((s) => (
                  <SpecialistOption
                    key={s.id}
                    specialist={s}
                    selected={specialistId === s.id}
                    onSelect={() => setSpecialistId(s.id)}
                    onViewBio={() => setBioSheetSpecialistId(s.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep.key === "type" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground">نوع الاستشارة</h2>
            <SelectableCard
              selected={consultationType === "remote"}
              onClick={() => {
                setConsultationType("remote");
                setSlotId(null);
                setDateTimeValue(null);
              }}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Video className="size-4 text-primary-600" strokeWidth={2} />
                  عن بعد
                </span>
                {remotePrice !== undefined && (
                  <span className="text-xs font-bold text-primary-700">{formatDzd(remotePrice)}</span>
                )}
              </span>
              <span className="block text-xs text-muted">مكالمة فيديو من أي مكان</span>
            </SelectableCard>
            <SelectableCard
              selected={consultationType === "in_person"}
              onClick={() => {
                setConsultationType("in_person");
                setSlotId(null);
                setDateTimeValue(null);
              }}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <MapPin className="size-4 text-primary-600" strokeWidth={2} />
                  حضوري
                </span>
                {inPersonPrice !== undefined && (
                  <span className="text-xs font-bold text-primary-700">{formatDzd(inPersonPrice)}</span>
                )}
              </span>
              <span className="block text-xs text-muted">لقاء مباشر في عيادة الأخصائي</span>
            </SelectableCard>
          </div>
        )}

        {currentStep.key === "slot" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground">اختاري التاريخ والوقت</h2>
            {availableSlots.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : !availableSlots.data || availableSlots.data.length === 0 ? (
              <Alert tone="info">لا توجد فترات متاحة لهذا النوع من الاستشارة حاليًا.</Alert>
            ) : (
              <>
                <DateTimePicker
                  value={dateTimeValue}
                  isDateAvailable={isDateAvailable}
                  timeOptionsForDate={timeOptionsForDate}
                  onChange={(next) => {
                    setDateTimeValue(next);
                    setSlotId(slotsByDateTime.get(next.date)?.get(next.time)?.id ?? null);
                  }}
                />
                <p className="text-xs text-muted">ستتلقين تأكيداً من الأخصائية خلال 24 ساعة.</p>
              </>
            )}
          </div>
        )}

        {currentStep.key === "reason" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground">سبب الحجز</h2>
            {reasons.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              reasons.data?.map((reason) => (
                <SelectableCard
                  key={reason.id}
                  selected={reasonId === reason.id}
                  onClick={() => setReasonId(reason.id)}
                >
                  {reason.reasonText}
                </SelectableCard>
              ))
            )}
          </div>
        )}

        {currentStep.key === "questionnaire" && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">استبيان سريع (اختياري)</h2>
              <p className="mt-1 text-xs text-muted">
                يساعد هذا الاستبيان الأخصائي على التحضير لاستشارتك بشكل أفضل. يمكنك تخطيه.
              </p>
            </div>
            {QUESTIONNAIRE_QUESTIONS.map((q) => (
              <div key={q.key} className="flex items-center justify-between gap-3">
                <span className="text-sm text-foreground">{q.text}</span>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={questionnaireAnswers[q.key] === true ? "primary" : "outline"}
                    onClick={() =>
                      setQuestionnaireAnswers((prev) => ({ ...prev, [q.key]: true }))
                    }
                  >
                    نعم
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={questionnaireAnswers[q.key] === false ? "primary" : "outline"}
                    onClick={() =>
                      setQuestionnaireAnswers((prev) => ({ ...prev, [q.key]: false }))
                    }
                  >
                    لا
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep.key === "payment" && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground">طريقة الدفع</h2>
            <p className="text-xs text-muted">ستتلقين تأكيداً من الأخصائية خلال 24 ساعة.</p>
            <PaymentMethodSelector
              amount={(consultationType === "remote" ? remotePrice : inPersonPrice) ?? 0}
              submitting={simulatedPayment.isPending}
              errorMessage={simulatedPayment.error}
              onSubmit={handlePaymentSubmit}
            />
          </div>
        )}

        {currentStep.key === "confirm" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-foreground">راجعي تفاصيل الحجز</h2>
            {submitError && <Alert tone="error">{submitError}</Alert>}
            <dl className="flex flex-col divide-y divide-black/5 rounded-xl border border-black/5">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="flex items-center gap-1.5 text-muted">
                  <UsersIcon className="size-4" strokeWidth={2} />
                  الأخصائي
                </dt>
                <dd className="font-semibold text-foreground">
                  {specialist.data?.fullName ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-muted">نوع الاستشارة</dt>
                <dd className="font-semibold text-foreground">
                  {consultationType ? consultationTypeLabel(consultationType) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-muted">السعر</dt>
                <dd className="font-semibold text-foreground">
                  {consultationType
                    ? formatDzd((consultationType === "remote" ? remotePrice : inPersonPrice) ?? 0)
                    : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-muted">الموعد</dt>
                <dd className="font-semibold text-foreground">
                  {selectedSlot ? formatArabicDateTime(selectedSlot.startTime) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-muted">سبب الحجز</dt>
                <dd className="font-semibold text-foreground">
                  {selectedReason?.reasonText ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-muted">طريقة الدفع</dt>
                <dd className="font-semibold text-foreground">
                  {paymentMethod ? paymentMethodLabel(paymentMethod) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-muted">حالة الحجز</dt>
                <dd>
                  <Badge tone="warning">بانتظار التأكيد</Badge>
                </dd>
              </div>
            </dl>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={goBack} disabled={stepIndex === 0} className="flex-1 sm:flex-none">
          السابق
        </Button>
        {currentStep.key === "confirm" ? (
          <Button onClick={handleConfirm} loading={createBooking.isPending} className="flex-1 sm:flex-none">
            تأكيد الحجز
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!canGoNext} className="flex-1 sm:flex-none">
            التالي
          </Button>
        )}
      </div>

      <BottomSheet
        open={Boolean(bioSheetSpecialistId)}
        onClose={() => setBioSheetSpecialistId(null)}
        title="نبذة عن الأخصائي/ة"
      >
        {bioSpecialist && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="size-14 shrink-0 overflow-hidden rounded-full">
                <ImageWithFallback
                  src={specialistPhotoSrc(bioSpecialist)}
                  alt={bioSpecialist.fullName}
                  icon={UserRound}
                  className="size-full"
                />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-foreground">{bioSpecialist.fullName}</p>
                <p className="text-sm text-muted">{bioSpecialist.specialty}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted">{bioSpecialist.bio}</p>
            <Button
              onClick={() => {
                setSpecialistId(bioSpecialist.id);
                setBioSheetSpecialistId(null);
              }}
              className="w-full"
            >
              اختيار {bioSpecialist.fullName}
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
