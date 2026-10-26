"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { AdminButton, ErrorNotice, adminInputClass } from "@/components/admin/AdminUi";
import { useCreateSpecialistAccount, type CreateSpecialistAccountInput } from "@/lib/hooks/useAdmin";
import { TRACK_LIST } from "@/lib/tracks";
import type { SpecialistTrack } from "@/lib/types";

/** كلمة مرور مؤقتة عشوائية — بلا أحرف ملتبسة (0/O، 1/l) لأنها تُملى للأخصائية شفهيًا غالبًا */
function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

const EMPTY: CreateSpecialistAccountInput = {
  fullName: "",
  phone: "",
  specialty: "",
  track: "psychological",
  wilaya: "",
  password: "",
};

export function CreateSpecialistDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateSpecialistAccount();
  const [form, setForm] = useState<CreateSpecialistAccountInput>(EMPTY);
  const [created, setCreated] = useState<{ phone: string; password: string } | null>(null);

  if (!open) return null;

  const set = <K extends keyof CreateSpecialistAccountInput>(key: K, value: CreateSpecialistAccountInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const close = () => {
    setForm(EMPTY);
    setCreated(null);
    create.reset();
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      { ...form, wilaya: form.wilaya?.trim() || undefined },
      { onSuccess: () => setCreated({ phone: form.phone, password: form.password }) },
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/70" onClick={close} aria-label="إغلاق" />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-[#1E293B] p-5 shadow-2xl">
        <h3 className="text-base font-bold text-white">إنشاء حساب أخصائية</h3>

        {created ? (
          <div className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-emerald-400">أُنشئ الحساب معتمدًا ويظهر الآن في قائمة الأخصائيات.</p>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm">
              <p className="text-slate-400">بيانات الدخول — سلّميها للأخصائية، ولن تظهر مرة أخرى:</p>
              <p className="mt-2 text-slate-200">
                الهاتف: <span dir="ltr" className="font-mono font-bold">{created.phone}</span>
              </p>
              <p className="mt-1 text-slate-200">
                كلمة المرور المؤقتة: <span dir="ltr" className="font-mono font-bold">{created.password}</span>
              </p>
            </div>
            <div className="flex justify-end">
              <AdminButton onClick={close}>إغلاق</AdminButton>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
            {create.error && <ErrorNotice message={create.error.message} />}
            <Field label="الاسم الكامل">
              <input required minLength={3} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={`${adminInputClass} w-full`} />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="الهاتف">
                <input
                  required
                  dir="ltr"
                  inputMode="tel"
                  pattern="0[5-7][0-9]{8}"
                  title="مثال: 0555123456"
                  placeholder="0555123456"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value.trim())}
                  className={`${adminInputClass} w-full text-right`}
                />
              </Field>
              <Field label="الولاية (اختياري)">
                <input value={form.wilaya} onChange={(e) => set("wilaya", e.target.value)} className={`${adminInputClass} w-full`} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="التخصص">
                <input required minLength={2} placeholder="أخصائية نفسانية" value={form.specialty} onChange={(e) => set("specialty", e.target.value)} className={`${adminInputClass} w-full`} />
              </Field>
              <Field label="المسار">
                <select value={form.track} onChange={(e) => set("track", e.target.value as SpecialistTrack)} className={`${adminInputClass} w-full`}>
                  {TRACK_LIST.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="كلمة مرور مؤقتة (8 أحرف على الأقل)">
              <div className="flex gap-2">
                <input
                  required
                  minLength={8}
                  dir="ltr"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className={`${adminInputClass} w-full font-mono`}
                />
                <AdminButton className="h-9 shrink-0" onClick={() => set("password", generatePassword())}>
                  <KeyRound className="size-3.5" />
                  توليد
                </AdminButton>
              </div>
            </Field>
            <div className="mt-2 flex justify-end gap-2">
              <AdminButton onClick={close} disabled={create.isPending}>
                إلغاء
              </AdminButton>
              <AdminButton tone="positive" type="submit" disabled={create.isPending}>
                {create.isPending ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
              </AdminButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}
