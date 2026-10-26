"use client";

import { useState } from "react";
import { Eye, EyeOff, ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { AdminButton, ErrorNotice, StatusPill, adminInputClass } from "@/components/admin/AdminUi";

export const adminTextareaClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

/** نافذة تحرير داكنة — submit داخل form ليعمل Enter والتحقق الأصلي للحقول */
export function EditorModal({
  open,
  title,
  error,
  saving,
  wide,
  onClose,
  onSubmit,
  children,
}: {
  open: boolean;
  title: string;
  error?: string | null;
  saving?: boolean;
  wide?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="إغلاق" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#1E293B] shadow-2xl",
          wide ? "max-w-4xl" : "max-w-lg",
        )}
      >
        <h3 className="border-b border-slate-700/60 px-5 py-4 text-base font-bold text-white">{title}</h3>
        <div className="flex flex-col gap-3 overflow-y-auto px-5 py-4">
          {error && <ErrorNotice message={error} />}
          {children}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-700/60 px-5 py-3">
          <AdminButton onClick={onClose} disabled={saving}>
            إلغاء
          </AdminButton>
          <AdminButton tone="positive" type="submit" disabled={saving}>
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}

/** رابط صورة مع معاينة — لا رفع ملفات: المنصة تستخدم روابط خارجية (Unsplash) لكل الصور */
export function ImageUrlField({
  value,
  onChange,
  required,
  label = "رابط الصورة",
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
}) {
  const [broken, setBroken] = useState<string | null>(null);
  const showPreview = /^https?:\/\//.test(value);
  return (
    <Field label={required ? label : `${label} (اختياري)`} hint="رابط https مباشر لصورة">
      <div className="flex gap-3">
        <input
          type="url"
          dir="ltr"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="https://images.unsplash.com/..."
          className={`${adminInputClass} min-w-0 flex-1 text-left`}
        />
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
          {showPreview && broken !== value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" onError={() => setBroken(value)} />
          ) : (
            <ImageOff className="size-5 text-slate-600" />
          )}
        </div>
      </div>
    </Field>
  );
}

export function VisibilityPill({ active, activeLabel = "ظاهر", hiddenLabel = "مخفي" }: { active: boolean; activeLabel?: string; hiddenLabel?: string }) {
  return <StatusPill tone={active ? "positive" : "neutral"}>{active ? activeLabel : hiddenLabel}</StatusPill>;
}

/** زر إظهار/إخفاء — الإخفاء بديل الحذف في كل المحتوى */
export function VisibilityButton({
  active,
  busy,
  onToggle,
  showLabel = "إظهار",
  hideLabel = "إخفاء",
}: {
  active: boolean;
  busy?: boolean;
  onToggle: () => void;
  showLabel?: string;
  hideLabel?: string;
}) {
  return (
    <AdminButton tone={active ? "neutral" : "positive"} disabled={busy} onClick={onToggle}>
      {active ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      {active ? hideLabel : showLabel}
    </AdminButton>
  );
}

export function Thumb({ src }: { src: string | null | undefined }) {
  return (
    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-900">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <ImageOff className="size-4 text-slate-600" />
      )}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-800" />
      ))}
    </div>
  );
}

/** رابط فارغ = null حتى يُمسح الحقل فعلًا في الـBackend بدل إرسال نص فارغ يُرفض */
export const urlOrNull = (value: string) => (value.trim() ? value.trim() : null);
