"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ShieldAlert, UserRound } from "lucide-react";
import { PageSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { useSpecialistPatientDetail, useSpecialistPatients } from "@/lib/hooks/useSpecialistPatients";
import { ApiError } from "@/lib/api-client";
import { SharedDataTab } from "./patient-detail/SharedDataTab";
import { SessionHistoryTab } from "./patient-detail/SessionHistoryTab";
import { NewNoteTab } from "./patient-detail/NewNoteTab";

const TABS = [
  { key: "shared", label: "البيانات المشتركة" },
  { key: "history", label: "سجل الجلسات" },
  { key: "note", label: "ملاحظة جديدة" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function PatientDetailContent({ userId }: { userId: string }) {
  const [tab, setTab] = useState<TabKey>("shared");
  const detail = useSpecialistPatientDetail(userId);
  const patients = useSpecialistPatients();
  const summary = patients.data?.find((p) => p.userId === userId);

  if (detail.isLoading) {
    return <PageSpinner />;
  }

  if (detail.isError) {
    const isForbidden = detail.error instanceof ApiError && detail.error.status === 403;
    if (isForbidden) {
      return (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-14 text-center text-slate-400">
          <ShieldAlert className="size-8 text-red-400" strokeWidth={1.5} />
          <p>ليس لديك صلاحية الوصول إلى ملف هذه المريضة.</p>
        </div>
      );
    }
    return (
      <Alert tone="error">
        {detail.error instanceof ApiError ? detail.error.message : "تعذّر تحميل ملف المريضة"}
      </Alert>
    );
  }

  if (!detail.data) return null;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/specialist/patients" className="flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ChevronRight className="size-4 rotate-180" strokeWidth={2} />
        الرجوع إلى مريضاتي
      </Link>

      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <UserRound className="size-6" strokeWidth={2} />
        </span>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">{summary?.maskedPhone ?? "ملف المريضة"}</h1>
          {summary && <p className="text-sm text-slate-500">{summary.sessionCount} جلسات</p>}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-full bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "shared" && <SharedDataTab data={detail.data} />}
      {tab === "history" && <SessionHistoryTab patientUserId={userId} />}
      {tab === "note" && <NewNoteTab patientUserId={userId} />}
    </div>
  );
}
