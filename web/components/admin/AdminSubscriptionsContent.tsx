"use client";

import { useState } from "react";
import { CheckCircle2, Receipt, Wallet } from "lucide-react";
import {
  AdminPageHeader,
  AdminPanel,
  AdminPanelTitle,
  AdminTable,
  EndpointPendingNotice,
  ErrorNotice,
  FilterChips,
  StatCard,
  StatusPill,
  TableMessageRow,
  TableSkeletonRows,
} from "@/components/admin/AdminUi";
import { subscriptionTone } from "@/components/admin/admin-tones";
import { isMissingEndpoint, subscriptionAmount, useAdminSubscriptions } from "@/lib/hooks/useAdmin";
import { useSubscriptionPlans } from "@/lib/hooks/useSubscriptions";
import { formatArabicDate, formatDzd, maskPhone, subscriptionStatusLabel } from "@/lib/format";
import type { SubscriptionStatus } from "@/lib/types";

type StatusFilter = "all" | SubscriptionStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "active", label: subscriptionStatusLabel("active") },
  { value: "expired", label: subscriptionStatusLabel("expired") },
  { value: "cancelled", label: subscriptionStatusLabel("cancelled") },
];

const HEAD = ["هاتف المشتركة", "الباقة", "السعر", "تاريخ الاشتراك", "الحالة"];

export function AdminSubscriptionsContent() {
  const subscriptions = useAdminSubscriptions();
  // الباقات الخمس متاحة فعلًا (GET /subscriptions/plans) — بيانات حقيقية تُعرض حتى قبل إضافة endpoint الاشتراكات
  const plans = useSubscriptionPlans();
  const [status, setStatus] = useState<StatusFilter>("all");

  const all = subscriptions.data ?? [];
  const totalRevenue = all.reduce((sum, s) => sum + subscriptionAmount(s), 0);
  const activeCount = all.filter((s) => s.status === "active").length;
  const rows = all
    .filter((s) => status === "all" || s.status === status)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  const missing = isMissingEndpoint(subscriptions.error);
  const dash = (value: string) => (subscriptions.error ? "—" : value);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="الاشتراكات والمدفوعات" description="كل اشتراكات الباقات وإيراداتها" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="إجمالي الإيرادات"
          icon={Wallet}
          tone="positive"
          loading={subscriptions.isLoading}
          value={dash(formatDzd(totalRevenue))}
          hint={missing ? "بانتظار GET /subscriptions" : "كل الاشتراكات منذ الإطلاق"}
        />
        <StatCard
          label="اشتراكات نشطة"
          icon={CheckCircle2}
          loading={subscriptions.isLoading}
          value={dash(activeCount.toLocaleString("ar-DZ"))}
        />
        <StatCard
          label="إجمالي الاشتراكات"
          icon={Receipt}
          loading={subscriptions.isLoading}
          value={dash(all.length.toLocaleString("ar-DZ"))}
        />
      </div>

      <AdminPanel>
        <div className="mb-4">
          <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        </div>

        {missing ? (
          <EndpointPendingNotice endpoint="GET /subscriptions" />
        ) : subscriptions.error ? (
          <ErrorNotice message={subscriptions.error.message} />
        ) : (
          <AdminTable head={HEAD}>
            {subscriptions.isLoading ? (
              <TableSkeletonRows cols={HEAD.length} />
            ) : rows.length === 0 ? (
              <TableMessageRow colSpan={HEAD.length}>لا توجد اشتراكات مطابقة</TableMessageRow>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="px-3 py-3 font-mono tabular-nums" dir="ltr">
                    {s.user ? maskPhone(s.user.phone) : "—"}
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-100">{s.plan?.nameAr ?? "—"}</td>
                  <td className="px-3 py-3 tabular-nums text-emerald-400">{formatDzd(subscriptionAmount(s))}</td>
                  <td className="px-3 py-3 text-slate-300">{formatArabicDate(s.startedAt)}</td>
                  <td className="px-3 py-3">
                    <StatusPill tone={subscriptionTone(s.status)}>{subscriptionStatusLabel(s.status)}</StatusPill>
                  </td>
                </tr>
              ))
            )}
          </AdminTable>
        )}
      </AdminPanel>

      <AdminPanel>
        <AdminPanelTitle>الباقات المتاحة</AdminPanelTitle>
        {plans.error ? (
          <ErrorNotice message={plans.error.message} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {plans.isLoading
              ? Array.from({ length: 5 }, (_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-700/60" />)
              : (plans.data ?? []).map((p) => {
                  const subscribers = all.filter((s) => s.planId === p.id).length;
                  return (
                    <div key={p.id} className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4">
                      <p className="font-bold text-slate-100">{p.nameAr}</p>
                      <p className="mt-1 text-sm tabular-nums text-emerald-400">{formatDzd(p.price)}</p>
                      {!subscriptions.error && !subscriptions.isLoading && (
                        <p className="mt-1 text-xs text-slate-500">{subscribers.toLocaleString("ar-DZ")} اشتراك</p>
                      )}
                    </div>
                  );
                })}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
