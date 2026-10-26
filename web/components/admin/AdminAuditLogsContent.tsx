"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AdminButton,
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  ErrorNotice,
  StatusPill,
  TableMessageRow,
  TableSkeletonRows,
  adminInputClass,
} from "@/components/admin/AdminUi";
import { useAuditLogs } from "@/lib/hooks/useAuditLogs";
import { formatArabicDateTime } from "@/lib/format";
import type { AdminAuditLog } from "@/lib/types";

const ACTION_GROUPS: { label: string; actions: Record<string, string> }[] = [
  {
    label: "المستخدمون",
    actions: {
      view_user_details: "عرض تفاصيل مستخدم",
      set_user_active: "تفعيل/تعطيل حساب",
      change_user_role: "تغيير دور مستخدم",
      create_specialist_account: "إنشاء حساب أخصائية",
      grant_subscription: "منح اشتراك يدوي",
    },
  },
  {
    label: "الأخصائيات والآراء",
    actions: {
      approve_specialist: "اعتماد أخصائية",
      reject_specialist: "رفض أخصائية",
      approve_testimonial: "اعتماد رأي",
      reject_testimonial: "رفض رأي",
    },
  },
  {
    label: "الحجوزات والطلبات",
    actions: {
      update_booking_status: "تحديث حالة حجز",
      update_booking_payment_status: "تحديث دفع حجز",
      update_meal_order_status: "تحديث طلب وجبات",
      update_product_order_status: "تحديث طلب متجر",
      update_service_booking_status: "تحديث حجز خدمة منزلية",
    },
  },
  {
    label: "المساعدة العاجلة",
    actions: {
      view_urgent_help_requests: "عرض طلبات المساعدة",
      update_urgent_help_status: "تحديث طلب مساعدة",
    },
  },
  {
    label: "المحتوى",
    actions: {
      create_article: "إنشاء مقال",
      update_article: "تعديل مقال",
      publish_article: "نشر مقال",
      unpublish_article: "إلغاء نشر مقال",
      create_faq_entry: "إضافة سؤال للدولا",
      update_faq_entry: "تعديل سؤال الدولا",
      create_meal: "إضافة وجبة",
      update_meal: "تعديل وجبة",
      create_product: "إضافة منتج",
      update_product: "تعديل منتج",
      create_daily_tip: "إضافة نصيحة يومية",
      update_daily_tip: "تعديل نصيحة يومية",
      admin_update_course: "تعديل دورة",
    },
  },
  {
    label: "التواصل والتقارير",
    actions: {
      send_broadcast: "إشعار جماعي",
      export_csv: "تصدير CSV",
      update_service_price: "تعديل سعر خدمة",
      update_plan_price: "تعديل سعر باقة",
    },
  },
];

const ACTION_LABELS: Record<string, string> = Object.assign({}, ...ACTION_GROUPS.map((g) => g.actions));

function actionLabel(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  // الإجراءات الفاشلة تُسجَّل بلاحقة _failed من الـinterceptor
  if (action.endsWith("_failed")) return `${ACTION_LABELS[action.slice(0, -7)] ?? action.slice(0, -7)} (فشل)`;
  return action;
}

const adminName = (log: AdminAuditLog) => log.adminUser.adminProfile?.fullName || log.adminUser.phone;

/** التاريخ المختار يوم كامل بالتوقيت المحلي — "إلى" تشمل اليوم نفسه حتى 23:59 */
const dayStart = (d: string) => new Date(`${d}T00:00:00`).toISOString();
const dayEnd = (d: string) => new Date(`${d}T23:59:59.999`).toISOString();

const PAGE_SIZE = 25;

export function AdminAuditLogsContent() {
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const logs = useAuditLogs({
    action: action || undefined,
    dateFrom: dateFrom ? dayStart(dateFrom) : undefined,
    dateTo: dateTo ? dayEnd(dateTo) : undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const withReset = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };
  const total = logs.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(action || dateFrom || dateTo);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="سجل النشاط" description="كل إجراء إداري يغيّر بيانات أو يعرض بيانات حساسة — من نفّذه، وماذا فعل، ومتى" />

      <AdminPanel>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-56 flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">الإجراء</span>
            <select value={action} onChange={(e) => withReset(setAction)(e.target.value)} className={`${adminInputClass} w-full`}>
              <option value="">كل الإجراءات</option>
              {ACTION_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {Object.entries(g.actions).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">من تاريخ</span>
            <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => withReset(setDateFrom)(e.target.value)} className={adminInputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">إلى تاريخ</span>
            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => withReset(setDateTo)(e.target.value)} className={adminInputClass} />
          </label>
          {hasFilters && (
            <AdminButton
              className="h-9"
              onClick={() => {
                setAction("");
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
            >
              مسح الفلاتر
            </AdminButton>
          )}
        </div>
      </AdminPanel>

      {logs.error && <ErrorNotice message={logs.error.message} />}

      <AdminPanel>
        <AdminTable head={["متى", "من", "الإجراء", "العنصر", "التفاصيل"]}>
          {logs.isLoading ? (
            <TableSkeletonRows cols={5} />
          ) : !logs.data || logs.data.items.length === 0 ? (
            <TableMessageRow colSpan={5}>لا توجد سجلات مطابقة</TableMessageRow>
          ) : (
            logs.data.items.map((log) => (
              <tr key={log.id} className="align-top">
                <td className="whitespace-nowrap px-3 py-3 text-slate-300">{formatArabicDateTime(log.createdAt)}</td>
                <td className="px-3 py-3 font-semibold">{adminName(log)}</td>
                <td className="px-3 py-3">
                  <StatusPill tone={log.action.endsWith("_failed") ? "alert" : "neutral"}>{actionLabel(log.action)}</StatusPill>
                </td>
                <td className="px-3 py-3 text-xs text-slate-400">
                  {log.entityType}
                  {log.entityId && <span className="mt-0.5 block max-w-36 truncate font-mono text-slate-500">{log.entityId}</span>}
                </td>
                <td className="px-3 py-3 text-xs text-slate-400">
                  {log.details ? (
                    <details>
                      <summary className="cursor-pointer select-none text-slate-300 hover:text-white">عرض</summary>
                      <pre dir="ltr" className="mt-2 max-h-48 max-w-md overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-900 p-2 text-left font-mono text-[11px] text-slate-300">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))
          )}
        </AdminTable>

        {total > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              صفحة {page} من {totalPages} — {total.toLocaleString("ar-DZ")} سجل
            </p>
            <div className="flex gap-2">
              <AdminButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronRight className="size-4" />
                السابق
              </AdminButton>
              <AdminButton disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                التالي
                <ChevronLeft className="size-4" />
              </AdminButton>
            </div>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
