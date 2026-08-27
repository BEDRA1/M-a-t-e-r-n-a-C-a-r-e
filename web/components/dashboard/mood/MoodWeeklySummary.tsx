"use client";

import { useMoodLogs } from "@/lib/hooks/useMood";

function buildSummary(entryCount: number, average: number): string {
  if (entryCount === 0) {
    return "لم تُسجَّل أي حالة مزاجية هذا الأسبوع بعد — سجلي مزاجك يوميًا لمتابعة حالتك بمرور الوقت";
  }
  if (average >= 4) {
    return "كان مزاجك مستقرًا وإيجابيًا في أغلب أيام هذا الأسبوع، استمري في الاعتناء بنفسك";
  }
  if (average >= 3) {
    return "كان مزاجك متوازنًا بشكل عام هذا الأسبوع";
  }
  if (average >= 2) {
    return "مررتِ ببعض الأيام الصعبة هذا الأسبوع، خذي وقتك واعتني بنفسك";
  }
  return "بدا هذا الأسبوع صعبًا عليكِ، لا تترددي في طلب الدعم ممن حولك أو من أخصائية";
}

export function MoodWeeklySummary() {
  const moodLogs = useMoodLogs(7);
  const entries = moodLogs.data ?? [];
  const average = entries.length > 0 ? entries.reduce((sum, e) => sum + e.moodLevel, 0) / entries.length : 0;

  if (moodLogs.isLoading) return null;

  return (
    <div className="rounded-[var(--radius-card)] border border-primary-100 bg-primary-50/40 p-5">
      <p className="text-sm font-bold text-foreground">ملخص الأسبوع</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{buildSummary(entries.length, average)}</p>
    </div>
  );
}
