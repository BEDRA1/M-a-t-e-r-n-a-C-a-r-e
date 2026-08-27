"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { usePregnancy } from "@/lib/hooks/usePregnancy";
import { WeekContentCard } from "@/components/dashboard/WeekContentCard";
import { WeeklyLogForm } from "@/components/dashboard/WeeklyLogForm";
import { WeeklyLogsList } from "@/components/dashboard/WeeklyLogsList";

export function WeeklyTrackingContent() {
  const pregnancy = usePregnancy();

  if (pregnancy.isLoading) {
    return (
      <Card className="lg:max-w-2xl">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-3 w-full" />
      </Card>
    );
  }

  if (!pregnancy.data) {
    return (
      <Card className="text-center lg:max-w-2xl">
        <h1 className="text-xl font-extrabold text-foreground">لا يوجد حمل نشط</h1>
        <p className="mt-2 text-sm text-muted">
          احسبي حملك أولًا حتى تتمكني من متابعة تقدمك الأسبوعي.
        </p>
        <div className="mt-4">
          <Link href="/dashboard/pregnancy-calculator">
            <Button>الانتقال إلى حاسبة الحمل</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const currentWeek = pregnancy.data.gestationalAge.weeks;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">المتابعة الأسبوعية</h1>
        <p className="mt-1 text-sm text-muted">تقدّمك الحالي وتطور جنينك أسبوعًا بأسبوع.</p>
      </div>

      <Card>
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-primary-700">
            الأسبوع {pregnancy.data.gestationalAge.weeks} + {pregnancy.data.gestationalAge.days} يوم
          </span>
          <span className="text-muted">{pregnancy.data.gestationalAge.progressPercent}٪</span>
        </div>
        <div className="mt-2">
          <ProgressBar percent={pregnancy.data.gestationalAge.progressPercent} />
        </div>
      </Card>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <WeekContentCard weekNumber={currentWeek} />

        <Card>
          <h2 className="text-lg font-bold text-foreground">إضافة سجل جديد</h2>
          <div className="mt-4">
            <WeeklyLogForm defaultWeekNumber={currentWeek} />
          </div>
        </Card>
      </div>

      <WeeklyLogsList />
    </div>
  );
}
