"use client";

import { Phone, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { AdminButton, AdminPageHeader, AdminPanel, ErrorNotice, StatusPill } from "@/components/admin/AdminUi";
import { useAdminUrgentHelp, useSetUrgentHelpStatus } from "@/lib/hooks/useAdmin";
import { formatArabicDateTime } from "@/lib/format";
import type { UrgentHelpStatus, UrgentHelpTriggerSource } from "@/lib/types";

// تسميات خاصة بمركز الإدارة (سير عمل المتابعة) — مختلفة عمدًا عن urgentHelpStatusLabel في lib/format
const STATUS_LABELS: Record<UrgentHelpStatus, string> = {
  open: "جديد",
  contacted: "قيد المتابعة",
  closed: "تمت المعالجة",
};

const STATUS_TONES = { open: "alert", contacted: "warning", closed: "positive" } as const;

const NEXT_STATUS: Partial<Record<UrgentHelpStatus, UrgentHelpStatus>> = {
  open: "contacted",
  contacted: "closed",
};

const SOURCE_LABELS: Record<UrgentHelpTriggerSource, string> = {
  epds_critical_item: "شاشة سلامة EPDS",
  manual_button: "طلب يدوي",
  assessment_score_threshold: "تجاوز عتبة تقييم الصدمة",
};

export function AdminUrgentHelpContent() {
  const requests = useAdminUrgentHelp();
  const setStatus = useSetUrgentHelpStatus();

  // الأحدث أولًا بغض النظر عن الحالة — الجديدة تبرز بالخلفية الحمراء لا بالترتيب
  const rows = [...(requests.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const openCount = rows.filter((r) => r.status === "open").length;
  const pendingId = setStatus.isPending ? setStatus.variables?.id : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <AdminPageHeader
          title="مركز طلبات المساعدة العاجلة"
          description={
            requests.data
              ? `${openCount.toLocaleString("ar-DZ")} جديد من أصل ${rows.length.toLocaleString("ar-DZ")} — يتحدّث تلقائيًا كل 30 ثانية`
              : "يتحدّث تلقائيًا كل 30 ثانية"
          }
        />
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <RefreshCw className={cn("size-3.5", requests.isFetching && "animate-spin")} />
          {requests.dataUpdatedAt ? `آخر تحديث ${new Date(requests.dataUpdatedAt).toLocaleTimeString("ar-DZ")}` : ""}
        </span>
      </div>

      {setStatus.error && <ErrorNotice message={setStatus.error.message} />}

      {requests.error ? (
        <ErrorNotice message={requests.error.message} />
      ) : requests.isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-800" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <AdminPanel>
          <p className="py-8 text-center text-sm text-slate-400">لا توجد طلبات مساعدة حتى الآن</p>
        </AdminPanel>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => {
            const next = NEXT_STATUS[r.status];
            const isNew = r.status === "open";
            const phone = r.user?.phone;
            return (
              <li
                key={r.id}
                className={cn(
                  "rounded-2xl border p-4 sm:p-5",
                  isNew ? "border-red-500/60 bg-red-950/70" : "border-slate-700/60 bg-[#1E293B]",
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</StatusPill>
                      <StatusPill tone="neutral">{SOURCE_LABELS[r.triggerSource] ?? r.triggerSource}</StatusPill>
                      <span className="text-xs text-slate-400">{formatArabicDateTime(r.createdAt)}</span>
                    </div>
                    {/* الرقم كاملًا هنا فقط في كل اللوحة — الغرض الاتصال بالأم فورًا */}
                    <p dir="ltr" className="mt-3 text-right font-mono text-xl font-bold tabular-nums text-white">
                      {phone ?? "—"}
                    </p>
                    {r.notes && (
                      <p className="mt-2 whitespace-pre-line rounded-lg bg-black/20 p-3 text-sm leading-relaxed text-slate-200">
                        {r.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-stretch">
                    {phone && (
                      <a
                        href={`tel:${phone}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
                      >
                        <Phone className="size-4" strokeWidth={2.25} />
                        اتصال
                      </a>
                    )}
                    {next && (
                      <AdminButton
                        className="h-10"
                        disabled={pendingId === r.id}
                        onClick={() => setStatus.mutate({ id: r.id, status: next })}
                      >
                        {pendingId === r.id ? "جارٍ الحفظ..." : `← ${STATUS_LABELS[next]}`}
                      </AdminButton>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
