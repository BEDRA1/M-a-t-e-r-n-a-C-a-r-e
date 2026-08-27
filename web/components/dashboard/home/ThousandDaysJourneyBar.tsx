"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Star, Flower2, Baby, PersonStanding, type LucideIcon } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { usePregnancy } from "@/lib/hooks/usePregnancy";
import { usePostpartumCurrent } from "@/lib/hooks/usePostpartum";
import { useBabies } from "@/lib/hooks/useBabies";
import { PregnantWomanIcon } from "./icons/PregnantWomanIcon";

const TOTAL_DAYS = 1000;
const PREGNANCY_END = 270;
const POSTPARTUM_END = 310;
const YEAR1_END = 365;

interface StageDef {
  key: "pregnancy" | "postpartum" | "year1" | "year2";
  label: string;
  endDay: number;
  icon: LucideIcon | typeof PregnantWomanIcon;
}

// أيقونات المراحل الأربع: "امرأة حامل" رسمة SVG حقيقية مستخدَمة أصلًا في WelcomeBanner أعلى
// هذه البطاقة مباشرة (اتساق بصري)، والثلاث الباقية أيقونات lucide نظيفة تُقرأ بوضوح في دائرة
// صغيرة (بدل الرسومات التوضيحية الأخرى بالمشروع المصمَّمة لحجم كبير مع تأثير blur يفقد
// وضوحه في دائرة ~32px) — Flower2/Baby مطابقان لنفس القاموس البصري المستخدَم أصلًا في خطوة
// اختيار مرحلة الأمومة عند التسجيل (RegisterForm.tsx)، وPersonStanding إضافة جديدة لمرحلة
// "السنة الثانية" (طفل بدأ يمشي، تمييزًا عن Baby الرضيع)
const STAGES: StageDef[] = [
  { key: "pregnancy", label: "الحمل", endDay: PREGNANCY_END, icon: PregnantWomanIcon },
  { key: "postpartum", label: "النفاس والولادة", endDay: POSTPARTUM_END, icon: Flower2 },
  { key: "year1", label: "السنة الأولى", endDay: YEAR1_END, icon: Baby },
  { key: "year2", label: "السنة الثانية", endDay: TOTAL_DAYS, icon: PersonStanding },
];

const STAGE_DESCRIPTIONS: Record<StageDef["key"], string> = {
  pregnancy: "جسدك يبني عالم طفلك الأول — كل يوم يُحدث فرقًا في نموه.",
  postpartum: "جسدك يتعافى وطفلك يتعرّف على العالم — امنحي نفسك الوقت والرعاية.",
  year1: "أهم عام لبناء الثقة والروابط والمهارات الأولى لدى طفلك.",
  year2: "اللغة والحركة والاستقلالية تتطور بسرعة — رافقيه خطوة بخطوة.",
};

const TICKS = [1, PREGNANCY_END, POSTPARTUM_END, YEAR1_END, 730, TOTAL_DAYS];

function daysSince(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

function stageForDay(day: number): StageDef {
  return STAGES.find((s) => day <= s.endDay) ?? STAGES[STAGES.length - 1];
}

/** دائرة نسبة مئوية بسيطة — لا مكتبة خارجية، دائرة SVG واحدة بمحيط معروف تُحرَّك عبر
 * stroke-dashoffset، تحترم تفضيل تقليل الحركة كباقي مكوّنات الأنيميشن في المشروع */
function PercentRing({ percent }: { percent: number }) {
  const shouldReduceMotion = useReducedMotion();
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="relative flex size-20 shrink-0 items-center justify-center">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--color-primary-100)" strokeWidth="8" />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="var(--color-primary-500)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: shouldReduceMotion ? circumference * (1 - clamped / 100) : circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped / 100) }}
          transition={{ duration: shouldReduceMotion ? 0 : 1, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-lg font-black text-primary-600">
        <CountUp value={Math.round(clamped)} duration={shouldReduceMotion ? 0 : 1} />٪
      </span>
    </div>
  );
}

export function ThousandDaysJourneyBar() {
  const pregnancy = usePregnancy();
  const postpartum = usePostpartumCurrent();
  const babies = useBabies();
  const shouldReduceMotion = useReducedMotion();

  if (pregnancy.isLoading || postpartum.isLoading || babies.isLoading) {
    return (
      <div className="mx-4 mt-4">
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  let currentDay: number | null = null;

  if (pregnancy.data?.status === "active") {
    currentDay = pregnancy.data.gestationalAge.totalDays;
  } else if (postpartum.data) {
    currentDay = PREGNANCY_END + postpartum.data.dayCount;
  } else if (babies.data && babies.data.length > 0) {
    const firstBaby = [...babies.data].sort(
      (a, b) => new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime(),
    )[0];
    currentDay = POSTPARTUM_END + daysSince(firstBaby.birthDate);
  }

  const hasJourney = currentDay !== null;
  const isComplete = hasJourney && currentDay! > TOTAL_DAYS;
  const displayDay = hasJourney ? Math.min(currentDay!, TOTAL_DAYS) : 0;
  const currentStage = hasJourney ? stageForDay(displayDay) : null;

  const pregnancyDonePercent = Math.min(displayDay, PREGNANCY_END) / TOTAL_DAYS;
  const elapsedPercent = displayDay / TOTAL_DAYS;

  return (
    <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <CalendarDays className="size-5 shrink-0 text-primary-500" strokeWidth={2} />
        <span className="text-sm font-bold text-foreground">شريط رحلة الـ 1000 يوم</span>
      </div>
      <p className="mb-4 text-end text-xs leading-relaxed text-gray-400">
        من اليوم 1 إلى اليوم 1000 ... كل خطوة نحو مستقبل أفضل لكِ ولطفلكِ
      </p>

      {!hasJourney ? (
        <>
          <div className="h-4 w-full rounded-full bg-gray-100" />
          <Link
            href="/dashboard/pregnancy-calculator"
            className="mt-3 block rounded-xl bg-primary-50 py-2.5 text-center text-xs font-bold text-primary-700"
          >
            سجّلي رحلتك
          </Link>
        </>
      ) : (
        <>
          {/* دوائر المراحل الأربع */}
          <div className="mb-4 grid grid-cols-4 gap-1">
            {STAGES.map((stage) => {
              const isPast = displayDay > stage.endDay;
              const isCurrent = currentStage?.key === stage.key;
              const StageIcon = stage.icon;
              return (
                <div key={stage.key} className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full",
                      isCurrent ? "bg-primary-500" : isPast ? "bg-primary-200" : "bg-gray-100",
                    )}
                  >
                    <StageIcon
                      className={cn("size-5", isCurrent ? "text-white" : isPast ? "text-primary-700" : "text-gray-400")}
                      strokeWidth={2}
                    />
                  </span>
                  <span className="text-center text-[10px] leading-tight text-gray-500">{stage.label}</span>
                  {stage.key === "pregnancy" && isPast && (
                    <span className="text-[9px] font-bold text-primary-600">({PREGNANCY_END} يوماً ✓)</span>
                  )}
                  {isCurrent && (
                    <span className="text-[9px] font-bold text-primary-600">(اليوم {displayDay})</span>
                  )}
                </div>
              );
            })}
          </div>

          {isComplete ? (
            <div className="mb-4 flex items-center justify-end gap-1.5 rounded-xl bg-primary-50 p-3 text-end">
              <span className="text-sm font-black text-primary-600">أكملتِ رحلة الألف يوم</span>
              <Star className="size-5 shrink-0 fill-primary-500 text-primary-500" strokeWidth={0} />
            </div>
          ) : (
            <>
              {/* الشريط المقسّم إلى مربعات — طبقة تعبئة ملوّنة عرضها يتحرّك (width transition
                  عادية، نفس أسلوب ProgressBar.tsx القائم في المشروع)، وفوقها طبقة "فجوات"
                  ثابتة العرض دائمًا (100%) تُنتج وهم المربعات الصغيرة على كامل الشريط دون أي
                  animation على background-size (يُصعّب حساب مواضع تدرّج الألوان أثناء الحركة).
                  انحدار اللون داخل طبقة التعبئة نسبي لعرضها هي (الأيام المنقضية) لا لعرض
                  الشريط الكلي، لذا يُحسب كنسبة "أيام الحمل المكتملة من إجمالي الأيام المنقضية" */}
              <div className="relative mb-2 h-4 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="absolute inset-y-0 right-0 rounded-full"
                  style={{
                    backgroundImage:
                      elapsedPercent > 0
                        ? `linear-gradient(to left, #4ade80 0%, #4ade80 ${((pregnancyDonePercent / elapsedPercent) * 100).toFixed(2)}%, #E91E8C ${((pregnancyDonePercent / elapsedPercent) * 100).toFixed(2)}%, #E91E8C 100%)`
                        : undefined,
                  }}
                  initial={{ width: shouldReduceMotion ? `${elapsedPercent * 100}%` : "0%" }}
                  animate={{ width: `${elapsedPercent * 100}%` }}
                  transition={{ duration: shouldReduceMotion ? 0 : 1, ease: "easeOut" }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundImage: "repeating-linear-gradient(to left, transparent 0 6px, white 6px 8px)" }}
                  aria-hidden="true"
                />
                <motion.span
                  className="absolute top-1/2 -translate-y-1/2"
                  initial={{ right: shouldReduceMotion ? `calc(${elapsedPercent * 100}% - 7px)` : "-7px" }}
                  animate={{ right: `calc(${elapsedPercent * 100}% - 7px)` }}
                  transition={{ duration: shouldReduceMotion ? 0 : 1, ease: "easeOut" }}
                  aria-hidden="true"
                >
                  <Star className="size-3.5 fill-primary-700 text-primary-700 drop-shadow" strokeWidth={0} />
                </motion.span>
              </div>

              {/* right الفعلي (لا left) لنفس سبب طبقة التعبئة أعلاه — اليوم 1 يمينًا، 1000 يسارًا.
                  270/310/365 قريبة جدًا من بعضها على مقياس 1000 يوم (تتزاحم نصوصها) — تُرفَع
                  الأرقام الفردية الترتيب سطرًا لتفادي التداخل، حل شائع لمحاور مزدحمة */}
              <div className="relative mb-5 h-6 text-[8px] text-gray-400">
                {TICKS.map((day, i) => (
                  <span
                    key={day}
                    className="absolute translate-x-1/2"
                    style={{ right: `${(day / TOTAL_DAYS) * 100}%`, top: i % 2 === 0 ? 0 : "10px" }}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* بطاقات المعلومات الثلاث — أفقية بتمرير، كما طُلب صراحةً */}
          <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="w-[78%] shrink-0 snap-start rounded-xl bg-primary-50 p-3">
              <p className="text-xs font-bold text-primary-700">ماذا يعني 1000 يوم؟</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/70">
                هي الفترة الذهبية من الحمل حتى نهاية السنة الثانية من عمر طفلك. في هذه الفترة
                تتشكل صحة طفلك الجسدية والعقلية والعاطفية مدى الحياة.
              </p>
              <Link href="/dashboard/articles" className="mt-2 inline-block text-[11px] font-bold text-primary-600">
                اكتشفي المزيد ←
              </Link>
            </div>

            {currentStage && (
              <div className="w-[78%] shrink-0 snap-start rounded-xl bg-gray-50 p-3">
                <div className="flex items-center justify-end gap-2">
                  <div className="text-end">
                    <p className="text-xs font-bold text-foreground">{currentStage.label}</p>
                    <p className="text-[10px] text-gray-400">اليوم {displayDay} من 1000</p>
                  </div>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-500">
                    <currentStage.icon className="size-4 text-white" strokeWidth={2} />
                  </span>
                </div>
                <p className="mt-2 text-end text-[11px] leading-relaxed text-foreground/70">
                  {STAGE_DESCRIPTIONS[currentStage.key]}
                </p>
              </div>
            )}

            <div className="flex w-[78%] shrink-0 snap-start items-center gap-3 rounded-xl bg-gray-50 p-3">
              <PercentRing percent={elapsedPercent * 100} />
              <p className="text-end text-xs font-semibold text-foreground">
                أنتِ في اليوم <span className="font-black text-primary-600">{displayDay}</span> من 1000
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
