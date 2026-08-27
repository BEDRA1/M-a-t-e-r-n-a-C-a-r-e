"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { MoodEntryForm } from "./MoodEntryForm";
import { MoodTrendChart } from "./MoodTrendChart";
import { MoodWeeklySummary } from "./MoodWeeklySummary";

export function MoodTrackingContent() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Badge tone="primary">متابعة الحالة المزاجية</Badge>
        <h1 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">حالتي المزاجية</h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          متابعة يومية لحالتك المزاجية طوال رحلتك، من الحمل إلى ما بعد الولادة
        </p>
      </div>

      <Card>
        <MoodEntryForm />
      </Card>

      <MoodWeeklySummary />

      <Card>
        <MoodTrendChart />
      </Card>

      <Alert tone="info">هذه المتابعة لا تغني عن الاستشارة الطبية أو النفسية</Alert>
    </div>
  );
}
