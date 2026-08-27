"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useDeleteWeeklyLog, useWeeklyLogs } from "@/lib/hooks/usePregnancy";
import { formatArabicDate } from "@/lib/format";

export function WeeklyLogsList() {
  const logs = useWeeklyLogs();
  const deleteLog = useDeleteWeeklyLog();

  return (
    <Card>
      <h2 className="text-lg font-bold text-foreground">سجلاتك الأسبوعية</h2>

      {logs.isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : !logs.data || logs.data.length === 0 ? (
        <p className="mt-4 text-sm text-muted">لم تُضيفي أي سجل أسبوعي بعد.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[...logs.data]
            .sort((a, b) => b.weekNumber - a.weekNumber)
            .map((log) => (
              <li key={log.id} className="rounded-xl border border-black/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">الأسبوع {log.weekNumber}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{formatArabicDate(log.loggedAt)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLog.mutate(log.id)}
                      loading={deleteLog.isPending && deleteLog.variables === log.id}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                  {log.weightKg && <span>الوزن: {log.weightKg} كغ</span>}
                  {log.symptoms && log.symptoms.length > 0 && (
                    <span>الأعراض: {log.symptoms.join("، ")}</span>
                  )}
                </div>
                {log.notes && <p className="mt-2 text-sm text-foreground">{log.notes}</p>}
              </li>
            ))}
        </ul>
      )}
    </Card>
  );
}
