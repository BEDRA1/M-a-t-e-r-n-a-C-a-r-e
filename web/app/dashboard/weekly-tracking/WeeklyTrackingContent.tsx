"use client";

import { useState } from "react";
import Link from "next/link";
import { Baby, CalendarHeart, ChevronLeft, ChevronRight, Flower2, PencilLine } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePregnancy } from "@/lib/hooks/usePregnancy";
import { usePostpartumCurrent } from "@/lib/hooks/usePostpartum";
import { useBabies } from "@/lib/hooks/useBabies";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { WeekContentCard } from "@/components/dashboard/WeekContentCard";
import { WeeklyLogForm } from "@/components/dashboard/WeeklyLogForm";
import { WeeklyLogsList } from "@/components/dashboard/WeeklyLogsList";
import { PregnancyCalculatorForm } from "@/components/dashboard/PregnancyCalculatorForm";
import { formatArabicDate } from "@/lib/format";
import {
  TOTAL_WEEKS,
  TRIMESTER_LABELS,
  contentWeek,
  daysUntil,
  hasFutureStartDate,
  pregnancyMonth,
  trimesterIndex,
} from "@/lib/pregnancy-stage";
import type { Pregnancy } from "@/lib/types";

/**
 * الصفحة الوحيدة للحمل، تختار ما تعرضه حسب مرحلة الأم:
 * حمل نشط → المتابعة مباشرة · نفاس أو طفل مسجّل بلا حمل نشط → توجيه للنفاس/الطفل · لا شيء → الحاسبة
 */
export function WeeklyTrackingContent() {
  const user = useCurrentUser();
  const pregnancy = usePregnancy();
  const postpartum = usePostpartumCurrent();
  const babies = useBabies();

  if (pregnancy.isLoading || postpartum.isLoading || babies.isLoading || user.isLoading) {
    return (
      <Card className="lg:max-w-2xl">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="mt-3 h-24 w-full" />
      </Card>
    );
  }

  if (pregnancy.data?.status === "active") {
    return <PregnancyTracker pregnancy={pregnancy.data} canEdit={user.data?.role === "mother"} />;
  }

  if (postpartum.data || (babies.data?.length ?? 0) > 0) {
    return <AfterBirthNotice hasPostpartum={Boolean(postpartum.data)} />;
  }

  if (user.data?.role === "spouse") {
    return (
      <Card className="text-center lg:max-w-2xl">
        <h1 className="text-xl font-extrabold text-foreground">لا يوجد حمل مسجّل بعد</h1>
        <p className="mt-2 text-sm text-muted">
          تظهر هنا متابعة الحمل بعد أن تسجّل زوجتك حملها من حسابها، وبعد ربط حسابيكما في صفحة العائلة.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">حاسبة الحمل</h1>
        <p className="mt-1 text-sm text-muted">
          أدخلي تاريخ آخر دورة شهرية (أو الإباضة أو السونار) لتبدأ متابعة حملك أسبوعًا بأسبوع.
        </p>
      </div>
      <PregnancyCalculatorForm />
    </div>
  );
}

function AfterBirthNotice({ hasPostpartum }: { hasPostpartum: boolean }) {
  return (
    <Card className="lg:max-w-2xl">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
        <Flower2 className="size-6" strokeWidth={2} />
      </span>
      <h1 className="mt-4 text-xl font-extrabold text-foreground">مرحلة الحمل انتهت — مبارك عليكِ</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        متابعة الحمل الأسبوعية لم تعد مناسبة لمرحلتك. تابعي تعافيكِ في قسم النفاس، ونمو طفلك في ملفه.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {hasPostpartum && (
          <Link href="/dashboard/postpartum">
            <Button>متابعة النفاس</Button>
          </Link>
        )}
        <Link href="/dashboard/baby">
          <Button variant={hasPostpartum ? "outline" : "primary"}>ملف طفلي</Button>
        </Link>
      </div>
    </Card>
  );
}

function PregnancyTracker({ pregnancy, canEdit }: { pregnancy: Pregnancy; canEdit: boolean }) {
  const { weeks, days, totalDays, progressPercent } = pregnancy.gestationalAge;
  const currentWeek = contentWeek(weeks);
  const [viewWeek, setViewWeek] = useState(currentWeek);
  const [editing, setEditing] = useState(false);

  const trimester = trimesterIndex(weeks);
  const remaining = daysUntil(pregnancy.dueDate);
  const futureStart = hasFutureStartDate(pregnancy);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">متابعة حملي</h1>
          <p className="mt-1 text-sm text-muted">تقدّمك الحالي وتطور جنينك أسبوعًا بأسبوع.</p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-black/[0.03] hover:text-foreground"
          >
            <PencilLine className="size-3.5" strokeWidth={2} />
            {editing ? "إغلاق التعديل" : "تعديل تاريخ الحمل"}
          </button>
        )}
      </div>

      {futureStart && (
        <Alert tone="error">
          التاريخ المسجّل لبداية حملك يقع في المستقبل، لذلك يظهر عمر الحمل صفرًا. صحّحيه من «تعديل تاريخ الحمل».
        </Alert>
      )}

      {editing && (
        <div className="flex flex-col gap-2 lg:max-w-xl">
          <p className="text-sm text-muted">أدخلي التاريخ الصحيح بإحدى الطرق، وسيُعاد حساب أسبوعك وموعد الولادة.</p>
          <PregnancyCalculatorForm
            mode="edit"
            onDone={(p) => {
              setEditing(false);
              setViewWeek(contentWeek(p.gestationalAge.weeks));
            }}
          />
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted">أنتِ في</p>
            <p className="text-3xl font-extrabold text-primary-700">
              الأسبوع {weeks}
              {days > 0 && <span className="text-xl"> + {days} {days === 1 ? "يوم" : days === 2 ? "يومان" : "أيام"}</span>}
            </p>
            <p className="mt-1 text-sm text-foreground/80">
              الشهر {pregnancyMonth(totalDays)} · {TRIMESTER_LABELS[trimester]}
            </p>
          </div>
          <div className="text-start sm:text-end">
            <p className="flex items-center gap-1.5 text-sm text-muted sm:justify-end">
              <CalendarHeart className="size-4" strokeWidth={2} />
              موعد الولادة المتوقع
            </p>
            <p className="font-bold text-foreground">{formatArabicDate(pregnancy.dueDate)}</p>
            <p className="text-sm text-primary-700">
              {remaining > 0 ? `بقي ${remaining} يومًا تقريبًا` : remaining === 0 ? "اليوم هو الموعد المتوقع" : `تجاوزتِ الموعد بـ ${-remaining} يومًا`}
            </p>
          </div>
        </div>

        <WeeksProgress weeks={weeks} progressPercent={progressPercent} />
      </Card>

      {remaining < 0 && (
        <Alert tone="info">
          تجاوزتِ الموعد المتوقع — التزمي بمتابعة طبيبتك. إن وُلد طفلك، يمكنك متابعة النفاس وإضافة طفلك من{" "}
          <Link href="/dashboard/baby" className="font-semibold underline">
            ملف الطفل
          </Link>
          .
        </Alert>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <WeekNavigator week={viewWeek} currentWeek={currentWeek} onChange={setViewWeek} />
          <WeekContentCard weekNumber={viewWeek} />
        </div>

        {canEdit && (
          <Card>
            <h2 className="text-lg font-bold text-foreground">إضافة سجل جديد</h2>
            <div className="mt-4">
              <WeeklyLogForm defaultWeekNumber={currentWeek} />
            </div>
          </Card>
        )}
      </div>

      <WeeklyLogsList />
    </div>
  );
}

/** شريط من 40 أسبوعًا بفواصل الأثلاث الثلاثة */
function WeeksProgress({ weeks, progressPercent }: { weeks: number; progressPercent: number }) {
  return (
    <div className="mt-5">
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-primary-50" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_WEEKS} aria-valuenow={Math.min(weeks, TOTAL_WEEKS)}>
        <div className="h-full rounded-full bg-primary-500 transition-[width]" style={{ width: `${Math.min(100, progressPercent)}%` }} />
        {[13, 27].map((w) => (
          <span key={w} className="absolute inset-y-0 w-0.5 bg-white" style={{ insetInlineStart: `${(w / TOTAL_WEEKS) * 100}%` }} />
        ))}
      </div>
      <div className="mt-1.5 grid text-[11px] text-muted" style={{ gridTemplateColumns: "13fr 14fr 13fr" }}>
        {TRIMESTER_LABELS.map((label, i) => (
          <span key={label} className={cn(i === trimesterIndex(weeks) && "font-bold text-primary-700", i === 1 && "text-center", i === 2 && "text-end")}>
            {label}
          </span>
        ))}
      </div>
      <p className="mt-1 text-xs text-muted">
        {Math.min(weeks, TOTAL_WEEKS)} من {TOTAL_WEEKS} أسبوعًا ({progressPercent}٪)
      </p>
    </div>
  );
}

function WeekNavigator({ week, currentWeek, onChange }: { week: number; currentWeek: number; onChange: (w: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-surface px-3 py-2 shadow-[var(--shadow-soft)]">
      {/* RTL: "السابق" يمينًا بسهم يمين */}
      <button
        type="button"
        disabled={week <= 1}
        onClick={() => onChange(week - 1)}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold text-foreground/80 hover:bg-black/[0.04] disabled:opacity-40"
      >
        <ChevronRight className="size-4" strokeWidth={2} />
        السابق
      </button>
      <div className="flex flex-col items-center">
        <span className="flex items-center gap-1 text-sm font-bold text-foreground">
          <Baby className="size-4 text-primary-500" strokeWidth={2} />
          الأسبوع {week}
        </span>
        {week === currentWeek ? (
          <span className="text-[11px] font-semibold text-primary-600">أسبوعك الحالي</span>
        ) : (
          <button type="button" onClick={() => onChange(currentWeek)} className="text-[11px] font-semibold text-primary-600 underline">
            العودة لأسبوعك ({currentWeek})
          </button>
        )}
      </div>
      <button
        type="button"
        disabled={week >= TOTAL_WEEKS}
        onClick={() => onChange(week + 1)}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold text-foreground/80 hover:bg-black/[0.04] disabled:opacity-40"
      >
        التالي
        <ChevronLeft className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

