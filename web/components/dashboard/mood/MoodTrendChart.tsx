"use client";

import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMoodLogs } from "@/lib/hooks/useMood";
import { moodLevelLabel } from "@/lib/format";

const WINDOWS: (7 | 14 | 30)[] = [7, 14, 30];

export function MoodTrendChart() {
  const [days, setDays] = useState<7 | 14 | 30>(7);
  const moodLogs = useMoodLogs(days);

  const chartData = (moodLogs.data ?? []).map((log) => ({
    date: new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "short" }).format(new Date(log.loggedAt)),
    mood: log.moodLevel,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">تطور حالتك المزاجية</h2>
        <div className="flex gap-1.5 rounded-full bg-black/5 p-1">
          {WINDOWS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setDays(w)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                days === w ? "bg-primary-500 text-white" : "text-foreground/60 hover:text-foreground",
              )}
            >
              {w} يوم
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-56 w-full sm:h-64">
        {moodLogs.isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-primary-50/40 text-center text-sm text-muted">
            لا توجد تسجيلات مزاجية خلال هذه الفترة بعد
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
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 10, fill: "#7a7166" }}
                stroke="#e5ded4"
                width={20}
              />
              <Tooltip
                formatter={(value) => [moodLevelLabel(Number(value)), "الحالة"]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #fce4ec",
                  fontSize: 13,
                  direction: "rtl",
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#e91e8c"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#e91e8c" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
