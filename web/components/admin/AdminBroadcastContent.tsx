"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Send, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { AdminButton, AdminPageHeader, AdminPanel, AdminPanelTitle, ConfirmDialog, ErrorNotice, adminInputClass } from "@/components/admin/AdminUi";
import { Field, adminTextareaClass } from "@/components/admin/content/ContentUi";
import { useBroadcastRecipients, useSendBroadcast, type BroadcastAudience } from "@/lib/hooks/useAdminContent";

const AUDIENCES: { value: BroadcastAudience; label: string; hint: string }[] = [
  { value: "all", label: "الكل", hint: "الأمهات والأزواج والأخصائيات" },
  { value: "pregnant", label: "الحوامل", hint: "أمهات لديهن حمل نشط" },
  { value: "postpartum", label: "النفاس", hint: "أمهات في فترة النفاس" },
  { value: "specialists", label: "الأخصائيات", hint: "حسابات الأخصائيات" },
];

const fmt = (n: number) => n.toLocaleString("ar-DZ");

export function AdminBroadcastContent() {
  const [audience, setAudience] = useState<BroadcastAudience>("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [confirming, setConfirming] = useState(false);
  const recipients = useBroadcastRecipients(audience);
  const send = useSendBroadcast();

  const count = recipients.data?.recipients;
  const audienceLabel = AUDIENCES.find((a) => a.value === audience)!.label;
  const canSend = title.trim().length >= 3 && body.trim().length >= 5 && (count ?? 0) > 0 && !send.isPending;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="إشعار جماعي"
        description="يصل الإشعار لصندوق إشعارات كل مستخدم في الفئة المختارة داخل المنصة. الحسابات المعطّلة مستثناة دائمًا"
      />

      {send.isSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="size-5 shrink-0" />
          أُرسل الإشعار إلى {fmt(send.data.recipients)} مستلم.
        </div>
      )}
      {send.error && <ErrorNotice message={send.error.message} />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <AdminPanel>
          <AdminPanelTitle>الرسالة</AdminPanelTitle>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSend) setConfirming(true);
            }}
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-400">الفئة المستهدفة</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {AUDIENCES.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAudience(a.value)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-right transition-colors",
                      audience === a.value ? "border-slate-200 bg-slate-100 text-slate-900" : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500",
                    )}
                  >
                    <span className="block text-sm font-bold">{a.label}</span>
                    <span className={cn("block text-[11px]", audience === a.value ? "text-slate-600" : "text-slate-500")}>{a.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm text-slate-300">
              <Users className="size-4 text-slate-400" />
              عدد المستلمين:
              {recipients.isLoading ? (
                <span className="h-4 w-10 animate-pulse rounded bg-slate-700" />
              ) : recipients.error ? (
                <span className="text-red-400">{recipients.error.message}</span>
              ) : (
                <strong className="tabular-nums text-white">{fmt(count ?? 0)}</strong>
              )}
            </div>

            <Field label="العنوان" hint={`${title.length}/100`}>
              <input required minLength={3} maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} className={`${adminInputClass} w-full`} />
            </Field>
            <Field label="النص" hint={`${body.length}/1000 — نص عادي بلا روابط أو تنسيق`}>
              <textarea required minLength={5} maxLength={1000} rows={6} value={body} onChange={(e) => setBody(e.target.value)} className={adminTextareaClass} />
            </Field>
            <div className="flex justify-end">
              <AdminButton type="submit" tone="positive" className="h-9" disabled={!canSend}>
                <Send className="size-4" />
                مراجعة وإرسال
              </AdminButton>
            </div>
          </form>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelTitle>معاينة</AdminPanelTitle>
          <div className="rounded-xl bg-white p-4 text-slate-800">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Bell className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="font-bold">{title || "عنوان الإشعار"}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{body || "نص الإشعار يظهر هنا"}</p>
                <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">إعلان</span>
              </div>
            </div>
          </div>
        </AdminPanel>
      </div>

      <ConfirmDialog
        open={confirming}
        title="إرسال الإشعار الجماعي؟"
        description={`سيُرسل «${title.trim()}» إلى ${fmt(count ?? 0)} مستلم (${audienceLabel}). لا يمكن سحب الإشعار بعد إرساله.`}
        confirmLabel={`إرسال إلى ${fmt(count ?? 0)}`}
        loading={send.isPending}
        onConfirm={() =>
          send.mutate(
            { audience, title: title.trim(), body: body.trim() },
            {
              onSuccess: () => {
                setTitle("");
                setBody("");
              },
              onSettled: () => setConfirming(false),
            },
          )
        }
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
