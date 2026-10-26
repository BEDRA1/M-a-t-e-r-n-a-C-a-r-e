"use client";

import { useState } from "react";
import { useAdminServiceBookings, useSetOrderStatus } from "@/lib/hooks/useAdmin";
import { formatArabicDateTime, formatDzd, homeServiceDisplayName } from "@/lib/format";
import type { ServiceBookingStatus } from "@/lib/types";
import { SERVICE_WORKFLOW, inDateRange, type DateRange } from "./orders/order-workflow";
import { CallButton, OrderCard, OrderField, OrderStatusControls, OrdersPageShell } from "./orders/OrderParts";

export function AdminServiceBookingsContent() {
  const bookings = useAdminServiceBookings();
  const setStatus = useSetOrderStatus("service-bookings");
  const [status, setFilter] = useState<"all" | ServiceBookingStatus>("all");
  const [range, setRange] = useState<DateRange>("all");

  const rows = (bookings.data ?? [])
    .filter((b) => status === "all" || b.status === status)
    .filter((b) => inDateRange(b.scheduledTime, range));
  const newCount = (bookings.data ?? []).filter((b) => b.status === "pending").length;
  const busyId = setStatus.isPending ? setStatus.variables?.id : undefined;

  return (
    <OrdersPageShell
      title="حجوزات الخدمات المنزلية"
      description={bookings.data ? `${bookings.data.length} حجز — ${newCount} جديد` : "التمريض المنزلي والأكل الصحي وغيرها"}
      endpoint="GET /service-bookings"
      workflow={SERVICE_WORKFLOW}
      query={bookings}
      mutationError={setStatus.error}
      status={status}
      onStatusChange={setFilter}
      range={range}
      onRangeChange={setRange}
      rangeHint="حسب موعد الخدمة"
      count={rows.length}
    >
      {rows.map((b) => (
        <OrderCard key={b.id} isNew={b.status === "pending"}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CallButton phone={b.user?.phone} />
              <OrderStatusControls
                workflow={SERVICE_WORKFLOW}
                status={b.status}
                busy={busyId === b.id}
                cancelWarning="سيُلغى حجز الخدمة نهائيًا ولا يمكن إعادة تفعيله."
                onChange={(next) => setStatus.mutate({ id: b.id, status: next })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <OrderField label="الخدمة">
                <span className="font-semibold">{b.service ? homeServiceDisplayName(b.service.name) : "—"}</span>
                {b.service && <span className="block text-xs text-slate-500">يبدأ من {formatDzd(b.service.basePrice)}</span>}
              </OrderField>
              <OrderField label="التاريخ والوقت">{formatArabicDateTime(b.scheduledTime)}</OrderField>
              <OrderField label="العنوان">{b.address}</OrderField>
            </div>
            {b.notes && (
              <p className="whitespace-pre-line rounded-lg bg-black/20 p-3 text-sm leading-relaxed text-slate-300">{b.notes}</p>
            )}
          </div>
        </OrderCard>
      ))}
    </OrdersPageShell>
  );
}
