"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Archive, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import {
  epdsClassificationLabel,
  epdsClassificationTone,
  formatArabicDateTime,
  gad7ClassificationLabel,
  gad7ClassificationTone,
} from "@/lib/format";
import { useAssessmentHistory } from "@/lib/hooks/useAssessments";
import { ApiError } from "@/lib/api-client";
import type { AssessmentResult } from "@/lib/types";

function ScaleHistorySection({
  title,
  results,
  maxScore,
  isGad7,
}: {
  title: string;
  results: AssessmentResult[];
  maxScore: number;
  isGad7: boolean;
}) {
  const chartData = [...results]
    .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime())
    .map((r) => ({
      date: new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "short" }).format(new Date(r.takenAt)),
      score: r.totalScore,
    }));

  return (
    <section>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>

      <div className="mt-4 h-52 w-full sm:h-60">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-primary-50/40 text-center text-sm text-muted">
            لا توجد نتائج بعد لهذا المقياس
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce4ec" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#7a7166" }}
                stroke="#e5ded4"
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis domain={[0, maxScore]} tick={{ fontSize: 10, fill: "#7a7166" }} stroke="#e5ded4" width={28} />
              <Tooltip
                formatter={(value) => [value, "الدرجة"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #fce4ec", fontSize: 13, direction: "rtl" }}
              />
              <Line type="monotone" dataKey="score" stroke="#e91e8c" strokeWidth={2.5} dot={{ r: 4, fill: "#e91e8c" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {[...results]
            .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())
            .map((r) => (
              <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="text-sm text-muted">{formatArabicDateTime(r.takenAt)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {r.totalScore} / {maxScore}
                  </span>
                  <Badge
                    tone={isGad7 ? gad7ClassificationTone(r.classification) : epdsClassificationTone(r.classification)}
                  >
                    {isGad7 ? gad7ClassificationLabel(r.classification) : epdsClassificationLabel(r.classification)}
                  </Badge>
                </div>
              </Card>
            ))}
        </div>
      )}
    </section>
  );
}

export function AssessmentHistoryContent() {
  const history = useAssessmentHistory();

  if (history.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (history.isError) {
    return (
      <Alert tone="error">
        {history.error instanceof ApiError ? history.error.message : "تعذّر تحميل سجل نتائجك"}
      </Alert>
    );
  }

  const results = history.data ?? [];
  const gad7Results = results.filter((r) => r.domain?.name === "gad7");
  const epdsResults = results.filter((r) => r.domain?.name === "epds");
  const legacyResults = results.filter((r) => r.domain?.isLegacy);

  if (results.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold text-foreground">سجل نتائجي</h1>
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <ClipboardList className="size-8 text-primary-300" strokeWidth={1.5} />
          <p>لم تُجري أي تقييم بعد.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold text-foreground">سجل نتائجي</h1>

      <ScaleHistorySection title="مقياس القلق العام (GAD-7)" results={gad7Results} maxScore={21} isGad7 />
      <ScaleHistorySection title="مقياس إدنبرة لاكتئاب ما بعد الولادة (EPDS)" results={epdsResults} maxScore={30} isGad7={false} />

      {legacyResults.length > 0 && (
        <section className="border-t border-black/5 pt-6">
          <h2 className="flex items-center gap-2 text-sm font-bold text-muted">
            <Archive className="size-4" strokeWidth={2} />
            نتائج من نظام سابق (غير معياري)
          </h2>
          <p className="mt-1 text-xs text-muted">
            هذه نتائج من نظام تقييم قديم غير معتمد إحصائيًا، مُحتفَظ بها للأرشيف فقط ولا تُقارَن بالمقاييس أعلاه.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {legacyResults.map((r) => (
              <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 bg-black/[0.02] py-3">
                <span className="min-w-0 break-words text-sm text-muted">
                  {r.domain?.nameAr} · {formatArabicDateTime(r.takenAt)}
                </span>
                <Badge tone="neutral">قديم</Badge>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
