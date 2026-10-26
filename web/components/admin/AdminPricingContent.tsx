"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  AdminButton,
  AdminPageHeader,
  AdminPanel,
  AdminPanelTitle,
  AdminTable,
  ConfirmDialog,
  ErrorNotice,
  TableSkeletonRows,
  adminInputClass,
} from "@/components/admin/AdminUi";
import { CONSULTATION_TYPE_LABELS, SERVICE_KIND_LABELS, useAdminPricing, useUpdatePrice } from "@/lib/hooks/useAdminContent";
import { formatDzd } from "@/lib/format";

interface PendingChange {
  kind: "services" | "plans";
  id: string;
  label: string;
  from: number;
  to: number;
}

const IMPACT: Record<PendingChange["kind"], string> = {
  services: "يُطبَّق على الحجوزات والدورات التي تُنشأ بعد الآن فقط. الحجوزات القائمة تحتفظ بسعرها المسجّل، والدورات الموجودة تحتفظ بسعرها.",
  plans: "يُطبَّق على الاشتراكات الجديدة فقط. الاشتراكات القائمة تحتفظ بالمبلغ المدفوع فعلًا ولا تُحاسَب من جديد.",
};

export function AdminPricingContent() {
  const pricing = useAdminPricing();
  const update = useUpdatePrice();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<PendingChange | null>(null);

  const draftOf = (id: string, current: number) => drafts[id] ?? String(current);

  const row = (kind: PendingChange["kind"], id: string, label: string, current: number) => {
    const draft = draftOf(id, current);
    const value = Number(draft);
    const valid = draft !== "" && Number.isInteger(value) && value >= 0;
    const changed = valid && value !== current;
    return (
      <tr key={id}>
        <td className="px-3 py-3 font-semibold">{label}</td>
        <td className="px-3 py-3 tabular-nums text-slate-400">{formatDzd(current)}</td>
        <td className="px-3 py-3">
          <input
            type="number"
            min={0}
            step={50}
            value={draft}
            onChange={(e) => setDrafts((d) => ({ ...d, [id]: e.target.value }))}
            className={`${adminInputClass} w-32 tabular-nums ${valid ? "" : "border-red-500"}`}
            aria-label={`السعر الجديد — ${label}`}
          />
        </td>
        <td className="px-3 py-3">
          <AdminButton tone="positive" disabled={!changed || update.isPending} onClick={() => setPending({ kind, id, label, from: current, to: value })}>
            حفظ
          </AdminButton>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="الأسعار" description="أسعار الاستشارات والدورات (حضوري/عن بُعد) وأسعار الباقات الخمس، بالدينار الجزائري" />

      <div className="flex items-start gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-200">
        <Info className="mt-0.5 size-5 shrink-0" />
        <p>تغيير السعر لا يمسّ أي حجز أو اشتراك قائم — كل حجز واشتراك يحتفظ بالسعر الذي سُجّل به. كل تغيير يُسجَّل في سجل النشاط بالسعر القديم والجديد.</p>
      </div>

      {(pricing.error ?? update.error) && <ErrorNotice message={(pricing.error ?? update.error)!.message} />}

      <AdminPanel>
        <AdminPanelTitle>الخدمات</AdminPanelTitle>
        <AdminTable head={["الخدمة", "السعر الحالي", "السعر الجديد", ""]}>
          {pricing.isLoading ? (
            <TableSkeletonRows cols={4} rows={4} />
          ) : (
            pricing.data?.services.map((s) =>
              row("services", s.id, `${SERVICE_KIND_LABELS[s.serviceKind]} — ${CONSULTATION_TYPE_LABELS[s.consultationType]}`, s.price),
            )
          )}
        </AdminTable>
      </AdminPanel>

      <AdminPanel>
        <AdminPanelTitle>الباقات</AdminPanelTitle>
        <AdminTable head={["الباقة", "السعر الحالي", "السعر الجديد", ""]}>
          {pricing.isLoading ? (
            <TableSkeletonRows cols={4} rows={5} />
          ) : (
            pricing.data?.plans.map((p) => row("plans", p.id, `${p.nameAr} (${p.type === "monthly" ? "شهرية" : "مرة واحدة"})`, p.price))
          )}
        </AdminTable>
      </AdminPanel>

      <ConfirmDialog
        open={pending !== null}
        title="تغيير السعر؟"
        description={pending ? `${pending.label}: من ${formatDzd(pending.from)} إلى ${formatDzd(pending.to)}. ${IMPACT[pending.kind]}` : ""}
        confirmLabel="تأكيد التغيير"
        loading={update.isPending}
        onConfirm={() =>
          pending &&
          update.mutate(
            { kind: pending.kind, id: pending.id, price: pending.to },
            {
              onSuccess: () =>
                setDrafts((d) => {
                  const next = { ...d };
                  delete next[pending.id];
                  return next;
                }),
              onSettled: () => setPending(null),
            },
          )
        }
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
