"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  AdminButton,
  AdminPageHeader,
  AdminPanel,
  ConfirmDialog,
  EndpointPendingNotice,
  ErrorNotice,
  FilterChips,
  StatusPill,
} from "@/components/admin/AdminUi";
import { isMissingEndpoint } from "@/lib/hooks/useAdmin";
import type { DateRange, Workflow } from "./order-workflow";

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "all", label: "كل التواريخ" },
  { value: "today", label: "اليوم" },
  { value: "week", label: "هذا الأسبوع" },
];

export function CallButton({ phone }: { phone?: string }) {
  if (!phone) return <span className="text-sm text-slate-500">—</span>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span dir="ltr" className="font-mono text-base font-bold tabular-nums text-white">
        {phone}
      </span>
      <a
        href={`tel:${phone}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white transition-colors hover:bg-emerald-500"
      >
        <Phone className="size-3.5" strokeWidth={2.25} />
        اتصال
      </a>
    </div>
  );
}

export function OrderField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-0.5 text-sm text-slate-200">{children}</div>
    </div>
  );
}

/** الحالة الحالية + زر الخطوة التالية + زر الإلغاء (بتأكيد) — مشترك بين الأنواع الثلاثة */
export function OrderStatusControls<S extends string>({
  workflow,
  status,
  busy,
  cancelWarning,
  onChange,
}: {
  workflow: Workflow<S>;
  status: S;
  busy: boolean;
  cancelWarning: string;
  onChange: (next: S) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const next = workflow.next[status];
  const canCancel = workflow.cancellableFrom.includes(status);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusPill tone={workflow.tones[status]}>{workflow.labels[status]}</StatusPill>
      {next && (
        <AdminButton tone="positive" disabled={busy} onClick={() => onChange(next)}>
          ← {workflow.labels[next]}
        </AdminButton>
      )}
      {canCancel && (
        <AdminButton tone="alert" disabled={busy} onClick={() => setConfirming(true)}>
          إلغاء
        </AdminButton>
      )}
      <ConfirmDialog
        open={confirming}
        title="تأكيد الإلغاء"
        description={cancelWarning}
        confirmLabel="تأكيد الإلغاء"
        loading={busy}
        onConfirm={() => {
          onChange(workflow.cancelled);
          setConfirming(false);
        }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}

/** الإطار المشترك لصفحات الطلبات: العنوان، فلتر الحالة والتاريخ، حالات التحميل/الخطأ/الفراغ */
export function OrdersPageShell<S extends string>({
  title,
  description,
  endpoint,
  workflow,
  query,
  mutationError,
  status,
  onStatusChange,
  range,
  onRangeChange,
  rangeHint,
  count,
  children,
}: {
  title: string;
  description: string;
  endpoint: string;
  workflow: Workflow<S>;
  query: { isLoading: boolean; error: Error | null };
  mutationError: Error | null;
  status: "all" | S;
  onStatusChange: (value: "all" | S) => void;
  range: DateRange;
  onRangeChange: (value: DateRange) => void;
  rangeHint: string;
  count: number;
  children: React.ReactNode;
}) {
  const statusOptions = [
    { value: "all" as const, label: "الكل" },
    ...(Object.keys(workflow.labels) as S[]).map((s) => ({ value: s, label: workflow.labels[s] })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={title} description={description} />

      {mutationError && <ErrorNotice message={mutationError.message} />}

      <AdminPanel className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips<"all" | S> options={statusOptions} value={status} onChange={onStatusChange} />
        <div className="flex items-center gap-2">
          <FilterChips options={DATE_OPTIONS} value={range} onChange={onRangeChange} />
          <span className="hidden text-xs text-slate-500 xl:inline">{rangeHint}</span>
        </div>
      </AdminPanel>

      {isMissingEndpoint(query.error) ? (
        <EndpointPendingNotice endpoint={endpoint} />
      ) : query.error ? (
        <ErrorNotice message={query.error.message} />
      ) : query.isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-800" />
          ))}
        </div>
      ) : count === 0 ? (
        <AdminPanel>
          <p className="py-8 text-center text-sm text-slate-400">لا توجد عناصر مطابقة</p>
        </AdminPanel>
      ) : (
        <ul className="flex flex-col gap-3">{children}</ul>
      )}
    </div>
  );
}

export function OrderCard({ isNew, children }: { isNew: boolean; children: React.ReactNode }) {
  return (
    <li
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        isNew ? "border-red-500/40 bg-red-950/40" : "border-slate-700/60 bg-[#1E293B]",
      )}
    >
      {children}
    </li>
  );
}
