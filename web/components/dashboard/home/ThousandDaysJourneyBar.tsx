"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { usePregnancy } from "@/lib/hooks/usePregnancy";
import { usePostpartumCurrent } from "@/lib/hooks/usePostpartum";
import { useBabies } from "@/lib/hooks/useBabies";
import { PregnantWomanIcon } from "./journey/PregnantWomanIcon";
import { MotherBabyIcon } from "./journey/MotherBabyIcon";
import { BabyIcon } from "./journey/BabyIcon";
import { ToddlerIcon } from "./journey/ToddlerIcon";

const TOTAL_DAYS = 1000;
const TOTAL_SQUARES = 50;
const DAYS_PER_SQUARE = TOTAL_DAYS / TOTAL_SQUARES;
const TICKS = [1, 270, 310, 365, 730, TOTAL_DAYS];

interface StageDef {
  key: "pregnancy" | "postpartum" | "year1" | "year2";
  label: string;
  startDay: number;
  endDay: number;
  icon: typeof PregnantWomanIcon;
}

const STAGES: StageDef[] = [
  { key: "pregnancy", label: "الحمل", startDay: 0, endDay: 270, icon: PregnantWomanIcon },
  { key: "postpartum", label: "النفاس والولادة", startDay: 270, endDay: 310, icon: MotherBabyIcon },
  { key: "year1", label: "السنة الأولى", startDay: 310, endDay: 365, icon: BabyIcon },
  { key: "year2", label: "السنة الثانية", startDay: 365, endDay: TOTAL_DAYS, icon: ToddlerIcon },
];

function daysSince(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

function stageForDay(day: number): StageDef {
  return STAGES.find((s) => day <= s.endDay) ?? STAGES[STAGES.length - 1];
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
    currentDay = 270 + postpartum.data.dayCount;
  } else if (babies.data && babies.data.length > 0) {
    const firstBaby = [...babies.data].sort(
      (a, b) => new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime(),
    )[0];
    currentDay = 310 + daysSince(firstBaby.birthDate);
  }

  const hasJourney = currentDay !== null;
  const isComplete = hasJourney && currentDay! > TOTAL_DAYS;
  const displayDay = hasJourney ? Math.min(currentDay!, TOTAL_DAYS) : 0;
  const currentStage = hasJourney ? stageForDay(displayDay) : null;
  // كل الأيام قبل بداية المرحلة الحالية تخص مراحل مكتملة بالكامل (أخضر)، ومن بداية المرحلة
  // الحالية حتى اليوم الفعلي هو تقدّم هذه المرحلة تحديدًا (وردي) — لا حد أقصى ثابت عند 270
  // كما كان سابقًا، فالحد يتحرك مع المرحلة النشطة نفسها (270 أثناء النفاس، 310 في السنة الأولى...)
  const completedBoundary = currentStage?.startDay ?? 0;
  const arrowIndex = Math.min(Math.floor(displayDay / DAYS_PER_SQUARE), TOTAL_SQUARES - 1);

  return (
    <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-lg font-bold text-foreground">شريط رحلة الـ 1000 يوم</span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-50">
          <CalendarDays className="size-5 text-primary-500" strokeWidth={2} />
        </span>
      </div>
      <p className="mb-4 text-end text-sm text-gray-500">
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
          {/* المراحل الأربع */}
          <div className="mb-6 flex items-start justify-between gap-1">
            {STAGES.map((stage) => {
              const isStagePast = displayDay > stage.endDay;
              const isCurrent = currentStage?.key === stage.key;
              const StageIcon = stage.icon;
              return (
                <div key={stage.key} className="relative flex flex-1 flex-col items-center gap-1.5">
                  {isCurrent && (
                    <motion.span
                      className="absolute -top-4"
                      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.3 }}
                    >
                      <Star className="size-4 fill-primary-500 text-primary-500" strokeWidth={0} />
                    </motion.span>
                  )}
                  <StageIcon className="size-11" />
                  <span
                    className={cn(
                      "text-center text-[11px] font-semibold leading-tight",
                      isCurrent ? "text-primary-600" : "text-gray-500",
                    )}
                  >
                    {stage.label}
                  </span>
                  {isStagePast && (
                    <span className="text-center text-[10px] font-bold leading-tight text-green-600">
                      ({stage.endDay - stage.startDay} يوماً ✓)
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-center text-[10px] font-bold leading-tight text-primary-600">
                      (اليوم {displayDay})
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {isComplete ? (
            <div className="mb-4 flex items-center justify-center gap-1.5 rounded-xl bg-primary-50 p-3">
              <span className="text-sm font-black text-primary-600">أكملتِ رحلة الألف يوم</span>
              <Star className="size-5 shrink-0 fill-primary-500 text-primary-500" strokeWidth={0} />
            </div>
          ) : (
            <>
              {/* الشريط المقسّم لـ50 مربعًا — أول عنصر DOM يظهر يمينًا تلقائيًا لأن الصفحة كلها
                  dir="rtl"، فترتيب المصفوفة من اليوم 1 (index 0) يطابق الترتيب البصري المطلوب
                  (يمين ← يسار) دون أي انعكاس يدوي */}
              <div className="relative mb-1 pt-4">
                <motion.div
                  className="absolute top-0 size-0 border-x-[5px] border-t-[7px] border-x-transparent border-t-primary-500"
                  style={{ right: `calc(${((arrowIndex + 0.5) / TOTAL_SQUARES) * 100}% - 5px)` }}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 1 }}
                  aria-hidden="true"
                />
                <div className="grid grid-cols-[repeat(50,1fr)] gap-[2px]">
                  {Array.from({ length: TOTAL_SQUARES }, (_, i) => {
                    const squareStart = i * DAYS_PER_SQUARE;
                    const color =
                      squareStart < completedBoundary
                        ? "bg-green-400"
                        : squareStart < displayDay
                          ? "bg-primary-500"
                          : "bg-gray-100";
                    return (
                      <motion.div
                        key={i}
                        className={cn("h-4 rounded-[2px]", color)}
                        initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.2, delay: shouldReduceMotion ? 0 : i * 0.02 }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* right الفعلي لا left: اليوم 1 يمينًا و1000 يسارًا، مطابقةً لاتجاه المربعات نفسه */}
              <div className="relative mb-5 h-6 text-[10px] text-gray-400">
                {TICKS.map((day, i) => (
                  <span
                    key={day}
                    className="absolute translate-x-1/2"
                    style={{ right: `${(day / TOTAL_DAYS) * 100}%`, top: i % 2 === 0 ? 0 : "12px" }}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </>
          )}

          {currentStage && !isComplete && (
            <div className="rounded-full bg-primary-50 px-4 py-2 text-center text-xs font-bold text-primary-700">
              رحلة الـ 1000 يوم الأولى | {currentStage.label} (اليوم {displayDay} من 1000)
            </div>
          )}
        </>
      )}
    </div>
  );
}
