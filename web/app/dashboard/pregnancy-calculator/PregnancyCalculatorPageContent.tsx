"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { usePregnancy } from "@/lib/hooks/usePregnancy";
import { PregnancyCalculatorForm } from "@/components/dashboard/PregnancyCalculatorForm";
import { formatArabicDate, calcMethodLabel } from "@/lib/format";

export function PregnancyCalculatorPageContent() {
  const pregnancy = usePregnancy();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">حاسبة الحمل</h1>
        <p className="mt-1 text-sm text-muted">
          احسبي عمر حملك وتاريخ ولادتك المتوقع بإحدى الطرق الثلاث.
        </p>
      </div>

      {pregnancy.isLoading ? (
        <Card className="lg:max-w-2xl">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-3 w-full" />
        </Card>
      ) : pregnancy.data ? (
        <Card className="lg:max-w-2xl">
          <h2 className="text-lg font-bold text-foreground">لديك حمل نشط بالفعل</h2>
          <p className="mt-1 text-sm text-muted">
            تم الحساب بطريقة: {calcMethodLabel(pregnancy.data.calcMethod)}
          </p>

          <div className="mt-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold text-primary-700">
                الأسبوع {pregnancy.data.gestationalAge.weeks} + {pregnancy.data.gestationalAge.days} يوم
              </span>
              <span className="text-muted">{pregnancy.data.gestationalAge.progressPercent}٪</span>
            </div>
            <div className="mt-2">
              <ProgressBar percent={pregnancy.data.gestationalAge.progressPercent} />
            </div>
          </div>

          <p className="mt-4 text-sm text-muted">
            تاريخ الولادة المتوقع:{" "}
            <span className="font-semibold text-foreground">
              {formatArabicDate(pregnancy.data.dueDate)}
            </span>
          </p>

          <div className="mt-4">
            <Link href="/dashboard/weekly-tracking">
              <Button variant="outline" size="sm">
                الانتقال إلى المتابعة الأسبوعية
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <PregnancyCalculatorForm />
      )}
    </div>
  );
}
