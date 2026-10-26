import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Construction } from "lucide-react";
import { cn } from "@/lib/cn";

// عناصر واجهة خاصة بلوحة الإدارة — منفصلة عمدًا عن components/ui (وردية فاتحة لواجهة الأم)
// لأن لوحة الإدارة بهوية داكنة مهنية مختلفة كليًا

export function AdminPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{title}</h1>
      {description && <p className="mt-1.5 text-sm text-slate-400">{description}</p>}
    </div>
  );
}

export function AdminPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-slate-700/60 bg-[#1E293B] p-5", className)}>{children}</section>
  );
}

export function AdminPanelTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-slate-100">{children}</h2>
      {action}
    </div>
  );
}

type Tone = "neutral" | "positive" | "alert" | "warning";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-slate-700/60 text-slate-200",
  positive: "bg-emerald-500/15 text-emerald-400",
  alert: "bg-red-500/15 text-red-400",
  warning: "bg-amber-500/15 text-amber-300",
};

export function StatusPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE_CLASSES[tone])}>
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  loading?: boolean;
}) {
  return (
    <AdminPanel>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-xl", TONE_CLASSES[tone])}>
          <Icon className="size-5" strokeWidth={2} />
        </span>
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-slate-700" />
      ) : (
        <p className="mt-3 text-3xl font-extrabold tabular-nums text-white">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </AdminPanel>
  );
}

export function EndpointPendingNotice({ endpoint }: { endpoint: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
      <Construction className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
      <p>
        الـendpoint <code dir="ltr" className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">{endpoint}</code>{" "}
        غير متوفر بعد في الـBackend — ستظهر البيانات هنا تلقائيًا فور إضافته.
      </p>
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      <AlertTriangle className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
      <p>{message}</p>
    </div>
  );
}

export function AdminTable({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-right text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-xs font-semibold text-slate-400">
            {head.map((h) => (
              <th key={h} className="px-3 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/60 text-slate-200">{children}</tbody>
      </table>
    </div>
  );
}

export function TableMessageRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-10 text-center text-sm text-slate-500">
        {children}
      </td>
    </tr>
  );
}

export function TableSkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className="px-3 py-3.5">
              <div className="h-4 w-full max-w-28 animate-pulse rounded bg-slate-700/70" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            value === opt.value ? "bg-white text-slate-900" : "bg-slate-800 text-slate-300 hover:bg-slate-700",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export const adminInputClass =
  "h-9 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none [color-scheme:dark]";

export function AdminButton({
  tone = "neutral",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "neutral" | "positive" | "alert" }) {
  const toneClass = {
    neutral: "bg-slate-700 text-slate-100 hover:bg-slate-600",
    positive: "bg-emerald-600 text-white hover:bg-emerald-500",
    alert: "bg-red-600 text-white hover:bg-red-500",
  }[tone];
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        toneClass,
        className,
      )}
    />
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/70" onClick={onCancel} aria-label="إلغاء" />
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-[#1E293B] p-5 shadow-2xl">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <AdminButton onClick={onCancel} disabled={loading}>
            إلغاء
          </AdminButton>
          <AdminButton tone="alert" onClick={onConfirm} disabled={loading}>
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
