"use client";

import { Baby, Check, Info } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWeekContent } from "@/lib/hooks/usePregnancy";
import { scaleIn } from "@/lib/motion";

export function WeekContentCard({ weekNumber }: { weekNumber: number }) {
  const weekContent = useWeekContent(weekNumber);
  const shouldReduceMotion = useReducedMotion();

  if (weekContent.isLoading) {
    return (
      <Card>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </Card>
    );
  }

  if (weekContent.isError || !weekContent.data) {
    return (
      <Card>
        <h2 className="text-lg font-bold text-foreground">تطور جنينك هذا الأسبوع</h2>
        <p className="mt-2 text-sm text-muted">
          لا يتوفر محتوى تفصيلي لهذا الأسبوع بعد، سيتم إضافته قريبًا.
        </p>
      </Card>
    );
  }

  const content = weekContent.data;

  return (
    <motion.div initial={shouldReduceMotion ? false : "hidden"} animate="visible" variants={scaleIn(0)}>
      <Card>
        <h2 className="text-lg font-bold text-foreground">تطور جنينك — الأسبوع {content.weekNumber}</h2>
        <p className="mt-2 text-sm text-primary-700 font-medium">
          حجم الجنين تقريبًا: {content.babySizeComparison}
        </p>

        {(content.babyWeightGrams || content.babyLengthCm) && (
          <p className="mt-1 text-sm text-muted">
            {content.babyWeightGrams ? `الوزن: ${content.babyWeightGrams} غرام` : ""}
            {content.babyWeightGrams && content.babyLengthCm ? " · " : ""}
            {content.babyLengthCm ? `الطول: ${content.babyLengthCm} سم` : ""}
          </p>
        )}

        <p className="mt-4 text-sm leading-relaxed text-foreground">{content.bodyChangesText}</p>

        {content.developmentJson?.points && content.developmentJson.points.length > 0 && (
          <div className="mt-5 border-t border-black/5 pt-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Baby className="size-4 text-accent-600" strokeWidth={2} />
              تطورات الجنين هذا الأسبوع
            </h3>
            <ul className="mt-2.5 flex flex-col gap-2">
              {content.developmentJson.points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-400" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.tipsJson?.length > 0 && (
          <div className="mt-5 border-t border-black/5 pt-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Check className="size-4 text-primary-600" strokeWidth={2.5} />
              نصائح هذا الأسبوع
            </h3>
            <ul className="mt-2.5 flex flex-col gap-2">
              {content.tipsJson.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary-500" strokeWidth={2.5} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-black/[0.03] px-3.5 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={2} />
          <p className="text-xs leading-relaxed text-muted">
            هذا المحتوى تثقيفي عام ولا يُغني عن استشارة طبيبك. إن شعرتِ بأي أعراض غير معتادة، راجعي طبيبك مباشرة.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
