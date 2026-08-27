"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CountUp } from "@/components/ui/CountUp";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePregnancy } from "@/lib/hooks/usePregnancy";
import { usePostpartumCurrent } from "@/lib/hooks/usePostpartum";
import { useBabies } from "@/lib/hooks/useBabies";

const TOTAL_DAYS = 1000;
const PREGNANCY_DAYS = 280;
const POSTPARTUM_END_DAY = 320;

function daysSince(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** الشريط يعطي أولوية الحمل النشط > النفاس الحالي > أصغر طفل (الأقرب لتاريخ ميلاد) — الفترات
 * الثلاث متتالية زمنيًا حسب تصميم "رحلة الألف يوم" فلا تتداخل عمليًا لنفس الأم */
export function ThousandDaysJourneyBar() {
  const pregnancy = usePregnancy();
  const postpartum = usePostpartumCurrent();
  const babies = useBabies();

  if (pregnancy.isLoading || postpartum.isLoading || babies.isLoading) {
    return (
      <div className="mx-4 mt-4">
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  let currentDay: number | null = null;
  let stageLabel = "";

  if (pregnancy.data?.status === "active") {
    currentDay = pregnancy.data.gestationalAge.totalDays;
    stageLabel = `أنتِ في الأسبوع ${pregnancy.data.gestationalAge.weeks} من الحمل`;
  } else if (postpartum.data) {
    currentDay = PREGNANCY_DAYS + postpartum.data.dayCount;
    stageLabel = `أنتِ في اليوم ${postpartum.data.dayCount} من فترة النفاس`;
  } else if (babies.data && babies.data.length > 0) {
    const firstBaby = [...babies.data].sort(
      (a, b) => new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime(),
    )[0];
    const ageDays = daysSince(firstBaby.birthDate);
    currentDay = POSTPARTUM_END_DAY + ageDays;
    const ageVerb = firstBaby.gender === "female" ? "عمرها" : "عمره";
    stageLabel = `${firstBaby.fullName} ${ageVerb} ${ageDays} يومًا`;
  }

  const hasJourney = currentDay !== null;
  const isComplete = hasJourney && currentDay! > TOTAL_DAYS;
  const displayDay = hasJourney ? Math.min(currentDay!, TOTAL_DAYS) : 0;
  const percent = (displayDay / TOTAL_DAYS) * 100;

  return (
    <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">من 1,000 يوم</span>
        <span className="text-sm font-bold text-primary-600">رحلة الألف يوم</span>
      </div>

      {!hasJourney ? (
        <>
          <div className="mb-3 text-end">
            <span className="text-sm text-gray-400">لم تبدئي رحلتك بعد</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-100" />
          <Link
            href="/dashboard/pregnancy-calculator"
            className="mt-3 block rounded-xl bg-primary-50 py-2.5 text-center text-xs font-bold text-primary-700"
          >
            سجّلي رحلتك
          </Link>
        </>
      ) : isComplete ? (
        <>
          <div className="mb-3 flex items-center justify-end gap-1.5 text-end">
            <span className="text-lg font-black text-primary-600">أكملتِ رحلة الألف يوم</span>
            <Star className="size-5 shrink-0 fill-primary-500 text-primary-500" strokeWidth={0} />
          </div>
          <ProgressBar percent={100} />
        </>
      ) : (
        <>
          <div className="mb-3 text-end">
            <CountUp value={displayDay} className="text-4xl font-black text-primary-600" />
            <span className="me-1 text-sm text-gray-400">اليوم</span>
          </div>

          {/* نقاط تحوّل المراحل تستخدم right الفعلي (لا end المنطقية) عمدًا: شريط التقدّم يمتلئ
              دائمًا من اليسار (خاصية width لا تنعكس مع dir)، فموضع النقطة يجب أن يقاس بنفس
              الاتجاه الفعلي كي يطابق فعليًا نسبة التقدّم على الشريط تحته */}
          <div className="relative mb-2">
            <ProgressBar percent={percent} />
            <span
              className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-white"
              style={{
                right: `${100 - (PREGNANCY_DAYS / TOTAL_DAYS) * 100}%`,
                backgroundColor: displayDay >= PREGNANCY_DAYS ? "var(--color-primary-500)" : "#d1d5db",
              }}
              aria-hidden="true"
            />
            <span
              className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-white"
              style={{
                right: `${100 - (POSTPARTUM_END_DAY / TOTAL_DAYS) * 100}%`,
                backgroundColor: displayDay >= POSTPARTUM_END_DAY ? "var(--color-primary-500)" : "#d1d5db",
              }}
              aria-hidden="true"
            />
          </div>

          <div className="mb-3 flex justify-between text-xs text-gray-400">
            <span>سنتان</span>
            <span>ما بعد الولادة</span>
            <span>النفاس</span>
            <span>الحمل</span>
          </div>

          <div className="rounded-xl bg-primary-50 p-2 text-center">
            <span className="text-xs font-bold text-primary-700">{stageLabel}</span>
          </div>
        </>
      )}
    </div>
  );
}
