"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Baby, Brain, Heart, MessageCircleQuestion, Smile } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatArabicDate, gad7ClassificationLabel, gad7ClassificationTone, epdsClassificationLabel, epdsClassificationTone, moodLevelLabel } from "@/lib/format";
import type { PatientAssessmentEntry, SpecialistPatientDetail } from "@/lib/types";

function assessmentLabelAndTone(entry: PatientAssessmentEntry): { label: string; tone: "success" | "accent" | "warning" | "danger" } {
  if (entry.domain.name === "gad7") {
    return { label: gad7ClassificationLabel(entry.classification as never), tone: gad7ClassificationTone(entry.classification as never) };
  }
  if (entry.domain.name === "epds") {
    return { label: epdsClassificationLabel(entry.classification as never), tone: epdsClassificationTone(entry.classification as never) };
  }
  return { label: entry.classification, tone: "accent" };
}

export function SharedDataTab({ data }: { data: SpecialistPatientDetail }) {
  const hasAnyShared = data.moodLogs || data.assessments || data.pregnancy !== undefined || data.postpartum !== undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="flex items-center gap-2 font-bold text-slate-800">
          <MessageCircleQuestion className="size-4 text-blue-600" strokeWidth={2} />
          استبيان الحجز
        </h2>
        {data.questionnaires.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">لا توجد استبيانات مرسلة مع حجوزاتها.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {data.questionnaires.map((q) => (
              <div key={q.bookingId} className="rounded-xl bg-slate-50 p-3 text-sm">
                <p className="mb-1.5 text-xs font-semibold text-slate-500">{formatArabicDate(q.sessionDate)}</p>
                {Object.entries(q.answers).map(([key, value]) => (
                  <p key={key} className="text-slate-700">
                    <span className="text-slate-500">{key}:</span> {String(value)}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {data.moodLogs && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="flex items-center gap-2 font-bold text-slate-800">
            <Smile className="size-4 text-blue-600" strokeWidth={2} />
            المزاج
          </h2>
          {data.moodLogs.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">لا توجد تسجيلات مزاجية بعد.</p>
          ) : (
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[...data.moodLogs].reverse().map((m) => ({
                    date: new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "short" }).format(new Date(m.logDate)),
                    mood: m.moodLevel,
                  }))}
                  margin={{ top: 10, right: 4, left: -24, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: "#64748b" }} stroke="#cbd5e1" width={20} />
                  <Tooltip formatter={(value) => [moodLevelLabel(Number(value)), "الحالة"]} contentStyle={{ borderRadius: 12, fontSize: 13, direction: "rtl" }} />
                  <Line type="monotone" dataKey="mood" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: "#2563eb" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {data.assessments && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="flex items-center gap-2 font-bold text-slate-800">
            <Brain className="size-4 text-blue-600" strokeWidth={2} />
            نتائج التقييمات النفسية
          </h2>
          {data.assessments.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">لا توجد تقييمات مسجّلة بعد.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {data.assessments.map((a) => {
                const { label, tone } = assessmentLabelAndTone(a);
                return (
                  <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                    <div>
                      <p className="font-semibold text-slate-700">{a.domain.nameAr}</p>
                      <p className="text-xs text-slate-500">{formatArabicDate(a.takenAt)} · الدرجة: {a.totalScore}</p>
                    </div>
                    <Badge tone={tone}>{label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {data.pregnancy !== undefined && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="flex items-center gap-2 font-bold text-slate-800">
            <Heart className="size-4 text-blue-600" strokeWidth={2} />
            بيانات الحمل
          </h2>
          {data.pregnancy === null ? (
            <p className="mt-2 text-sm text-slate-400">لا يوجد حمل نشط حاليًا.</p>
          ) : (
            <p className="mt-2 text-3xl font-extrabold text-blue-700">
              الأسبوع {data.pregnancy.weeks}
              <span className="text-base font-semibold text-slate-500"> + {data.pregnancy.days} يوم</span>
            </p>
          )}
        </div>
      )}

      {data.postpartum !== undefined && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="flex items-center gap-2 font-bold text-slate-800">
            <Baby className="size-4 text-blue-600" strokeWidth={2} />
            بيانات النفاس
          </h2>
          {data.postpartum === null ? (
            <p className="mt-2 text-sm text-slate-400">لا توجد فترة نفاس مسجّلة حاليًا.</p>
          ) : (
            <p className="mt-2 text-3xl font-extrabold text-blue-700">
              يوم {data.postpartum.dayCount}
              <span className="text-base font-semibold text-slate-500"> من 40</span>
            </p>
          )}
        </div>
      )}

      {!hasAnyShared && (
        <p className="rounded-2xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
          لم تفعّل هذه المريضة مشاركة أي بيانات إضافية بعد.
        </p>
      )}
    </div>
  );
}
