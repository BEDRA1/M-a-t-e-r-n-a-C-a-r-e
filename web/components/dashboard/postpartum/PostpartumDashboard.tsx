"use client";

import { HeartHandshake, Lightbulb, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { CountUp } from "@/components/ui/CountUp";
import { formatArabicDate } from "@/lib/format";
import { useDailyTip } from "@/lib/hooks/useDailyTip";
import { MoodPicker } from "./MoodPicker";
import { MoodChart } from "./MoodChart";
import { MotherAndBabyIllustration } from "./MotherAndBabyIllustration";
import type { PostpartumPeriod } from "@/lib/types";

const MAX_DAYS = 40;

/** معلومة تثقيفية ثابتة عن مرحلة النفاس — نص عام غير قابل للتغيير من لوحة الإدارة، بلا حاجة لـbackend جديد */
const DID_YOU_KNOW_TEXT =
  "تحتاج أغلب الأمهات ما بين 6 و8 أسابيع لتتعافى فيها الأنسجة الأساسية بعد الولادة، لكن التعافي الكامل — جسديًا ونفسيًا — قد يمتد لأشهر. امنحي جسدك الوقت الذي يحتاجه، ولا تقارني رحلتك برحلة غيرك.";

export function PostpartumDashboard({ period }: { period: PostpartumPeriod }) {
  const dailyTip = useDailyTip();
  const remainingDays = Math.max(MAX_DAYS - period.dayCount, 0);
  const percent = Math.min((period.dayCount / MAX_DAYS) * 100, 100);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Badge tone="primary">مرافقة ما بعد الولادة</Badge>
        <h1 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">النفاس</h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          تاريخ الولادة: {formatArabicDate(period.birthDate)}
        </p>
      </div>

      <Card className="overflow-hidden bg-gradient-to-br from-primary-50 to-accent-50/40">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <MotherAndBabyIllustration className="size-20 shrink-0 sm:size-24" />
            <div>
              <p className="text-sm font-medium text-muted">يوم النفاس</p>
              <p className="mt-1 font-black text-6xl leading-none text-primary-700">
                <CountUp value={period.dayCount} />
                <span className="text-xl font-bold text-muted"> من {MAX_DAYS}</span>
              </p>
            </div>
          </div>
          <p className="text-sm font-medium text-muted">
            {remainingDays > 0 ? `متبقٍ ${remainingDays} يومًا` : "اكتملت فترة النفاس"}
          </p>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar percent={percent} />
          </div>
          <span className="shrink-0 text-sm font-bold text-primary-700">{Math.round(percent)}٪</span>
        </div>
      </Card>

      <Card>
        <MoodPicker />
      </Card>

      <Card>
        <MoodChart />
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {dailyTip.isLoading ? (
          <Skeleton className="h-32 w-full rounded-[var(--radius-card)]" />
        ) : dailyTip.data ? (
          <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-primary-100 bg-primary-50/50 p-6 shadow-[var(--shadow-soft)]">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <Sparkles className="size-5" strokeWidth={2} />
            </span>
            <div>
              <p className="font-bold text-foreground">نصيحة اليوم للنفاس</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{dailyTip.data.tipTextAr}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-accent-100 bg-accent-50/40 p-6 shadow-[var(--shadow-soft)]">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
            <Lightbulb className="size-5" strokeWidth={2} />
          </span>
          <div>
            <p className="font-bold text-foreground">هل تعرفين؟</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{DID_YOU_KNOW_TEXT}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted">
        <HeartHandshake className="size-4 shrink-0" strokeWidth={2} />
        <p>رحلة النفاس مختلفة من أم لأخرى — كوني لطيفة مع نفسك في كل خطوة.</p>
      </div>
    </div>
  );
}
