"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuditLogs } from "@/lib/hooks/useAuditLogs";
import { formatArabicDateTime } from "@/lib/format";
import { ApiError } from "@/lib/api-client";
import type { AdminAuditLog } from "@/lib/types";

const ACTION_LABELS: Record<string, string> = {
  approve_specialist: "اعتماد أخصائي",
  reject_specialist: "رفض أخصائي",
  update_booking_status: "تحديث حالة حجز استشارة",
  update_booking_payment_status: "تحديث حالة دفع حجز",
  update_meal_order_status: "تحديث حالة طلب وجبات",
  update_product_order_status: "تحديث حالة طلب متجر",
  update_service_booking_status: "تحديث حالة حجز خدمة منزلية",
  approve_testimonial: "اعتماد رأي أم",
  reject_testimonial: "رفض رأي أم",
  create_faq_entry: "إضافة سؤال للدولا الرقمية",
  update_faq_entry: "تعديل سؤال الدولا الرقمية",
  delete_faq_entry: "حذف سؤال الدولا الرقمية",
  view_urgent_help_requests: "عرض قائمة طلبات المساعدة العاجلة",
  update_urgent_help_status: "تحديث حالة طلب مساعدة عاجل",
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  specialist: "أخصائي",
  booking: "حجز استشارة",
  meal_order: "طلب وجبات",
  product_order: "طلب متجر",
  service_booking: "حجز خدمة منزلية",
  testimonial: "رأي أم",
  faq_entry: "سؤال الدولا",
  urgent_help: "مساعدة عاجلة",
};

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function entityTypeLabel(entityType: string): string {
  return ENTITY_TYPE_LABELS[entityType] ?? entityType;
}

function adminDisplayName(log: AdminAuditLog): string {
  return log.adminUser.adminProfile?.fullName || log.adminUser.phone;
}

const PAGE_SIZE = 20;

export function AuditLogContent() {
  const [adminUserId, setAdminUserId] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const logs = useAuditLogs({
    adminUserId: adminUserId || undefined,
    action: action || undefined,
    entityType: entityType || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  // استعلام غير مُصفّى منفصل، فقط لجمع قائمة الإداريين الذين لديهم سجلات فعلية لخيارات الفلتر
  const adminDirectory = useAuditLogs({ page: 1, pageSize: 100 });
  const adminOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const log of adminDirectory.data?.items ?? []) {
      map.set(log.adminUserId, adminDisplayName(log));
    }
    return Array.from(map.entries());
  }, [adminDirectory.data]);

  const resetPageAnd = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const totalPages = logs.data ? Math.max(1, Math.ceil(logs.data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Badge tone="primary">للإدارة فقط</Badge>
        <h1 className="mt-4 flex items-center gap-2 text-2xl font-extrabold text-foreground sm:text-3xl">
          <ShieldCheck className="size-6 text-primary-600" strokeWidth={2} />
          سجل النشاط الإداري
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          سجل تلقائي لكل إجراء إداري يغيّر شيئًا أو يمس بيانات حساسة — من نفّذه، وماذا فعل، ومتى.
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            label="الإداري/ة"
            value={adminUserId}
            onChange={(e) => resetPageAnd(setAdminUserId)(e.target.value)}
          >
            <option value="">الكل</option>
            {adminOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </Select>

          <Select label="الإجراء" value={action} onChange={(e) => resetPageAnd(setAction)(e.target.value)}>
            <option value="">الكل</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <Select
            label="نوع العنصر"
            value={entityType}
            onChange={(e) => resetPageAnd(setEntityType)(e.target.value)}
          >
            <option value="">الكل</option>
            {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <Input
            label="من تاريخ"
            type="date"
            value={dateFrom}
            onChange={(e) => resetPageAnd(setDateFrom)(e.target.value)}
          />
          <Input
            label="إلى تاريخ"
            type="date"
            value={dateTo}
            onChange={(e) => resetPageAnd(setDateTo)(e.target.value)}
          />
        </div>
      </Card>

      {logs.isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : logs.isError ? (
        <Alert tone="error">
          {logs.error instanceof ApiError ? logs.error.message : "تعذّر تحميل سجل النشاط"}
        </Alert>
      ) : !logs.data || logs.data.items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <ShieldCheck className="size-8 text-primary-300" strokeWidth={1.5} />
          <p>لا توجد سجلات مطابقة لهذه الفلاتر.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-black/5 bg-surface shadow-[var(--shadow-soft)]">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs font-bold text-muted">
                <th className="px-4 py-3 text-start">من</th>
                <th className="px-4 py-3 text-start">ماذا فعل/ت</th>
                <th className="px-4 py-3 text-start">على ماذا</th>
                <th className="px-4 py-3 text-start">التفاصيل</th>
                <th className="px-4 py-3 text-start">متى</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {logs.data.items.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 font-semibold text-foreground">{adminDisplayName(log)}</td>
                  <td className="px-4 py-3 text-foreground/80">{actionLabel(log.action)}</td>
                  <td className="px-4 py-3 text-muted">
                    {entityTypeLabel(log.entityType)}
                    {log.entityId && (
                      <span className="mt-0.5 block truncate font-mono text-xs text-muted/70" style={{ maxWidth: 140 }}>
                        {log.entityId}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {log.details ? (
                      <span className="block max-w-[220px] truncate font-mono">{JSON.stringify(log.details)}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatArabicDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {logs.data && logs.data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            صفحة {page} من {totalPages} — {logs.data.total} سجلًا
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronRight className="size-4" strokeWidth={2} />
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              التالي
              <ChevronLeft className="size-4" strokeWidth={2} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
