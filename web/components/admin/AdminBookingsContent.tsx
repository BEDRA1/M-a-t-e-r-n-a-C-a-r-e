"use client";

import { useState } from "react";
import {
  AdminButton,
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  EndpointPendingNotice,
  ErrorNotice,
  FilterChips,
  StatusPill,
  TableMessageRow,
  TableSkeletonRows,
  ConfirmDialog,
  adminInputClass,
} from "@/components/admin/AdminUi";
import { bookingTone } from "@/components/admin/admin-tones";
import { isMissingEndpoint, useAdminBookings, useCancelBooking, type AdminBooking } from "@/lib/hooks/useAdmin";
import { bookingStatusLabel, consultationTypeLabel, formatArabicDateTime, maskPhone } from "@/lib/format";
import type { BookingStatus } from "@/lib/types";

type StatusFilter = "all" | BookingStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "pending", label: bookingStatusLabel("pending") },
  { value: "confirmed", label: bookingStatusLabel("confirmed") },
  { value: "completed", label: bookingStatusLabel("completed") },
  { value: "cancelled", label: bookingStatusLabel("cancelled") },
];

const HEAD = ["هاتف الأم", "الأخصائية", "التاريخ والوقت", "النوع", "الحالة", "إجراءات"];

/** YYYY-MM-DD بالتوقيت المحلي، للمقارنة مع قيمة input[type=date] */
function localDateKey(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function AdminBookingsContent() {
  const bookings = useAdminBookings();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const cancelBooking = useCancelBooking();
  const [toCancel, setToCancel] = useState<AdminBooking | null>(null);

  const rows = (bookings.data ?? [])
    .map((b) => ({ ...b, when: b.availabilitySlot?.startTime ?? b.createdAt }))
    .filter((b) => status === "all" || b.status === status)
    .filter((b) => !dateFrom || localDateKey(b.when) >= dateFrom)
    .filter((b) => !dateTo || localDateKey(b.when) <= dateTo)
    .sort((a, b) => b.when.localeCompare(a.when));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="الحجوزات"
        description={bookings.data ? `${bookings.data.length.toLocaleString("ar-DZ")} حجز` : "كل حجوزات الاستشارات"}
      />

      {cancelBooking.error && <ErrorNotice message={cancelBooking.error.message} />}

      <AdminPanel>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>من</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={adminInputClass} />
            <span>إلى</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={adminInputClass} />
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="rounded-lg px-2 py-1 font-semibold text-slate-300 hover:bg-slate-800"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {isMissingEndpoint(bookings.error) ? (
          <EndpointPendingNotice endpoint="GET /bookings" />
        ) : bookings.error ? (
          <ErrorNotice message={bookings.error.message} />
        ) : (
          <AdminTable head={HEAD}>
            {bookings.isLoading ? (
              <TableSkeletonRows cols={HEAD.length} />
            ) : rows.length === 0 ? (
              <TableMessageRow colSpan={HEAD.length}>لا توجد حجوزات مطابقة</TableMessageRow>
            ) : (
              rows.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40">
                  <td className="px-3 py-3 font-mono tabular-nums" dir="ltr">
                    {b.user ? maskPhone(b.user.phone) : "—"}
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-100">{b.specialist?.fullName ?? "—"}</td>
                  <td className="px-3 py-3 text-slate-300">{formatArabicDateTime(b.when)}</td>
                  <td className="px-3 py-3 text-slate-300">{consultationTypeLabel(b.consultationType)}</td>
                  <td className="px-3 py-3">
                    <StatusPill tone={bookingTone(b.status)}>{bookingStatusLabel(b.status)}</StatusPill>
                  </td>
                  <td className="px-3 py-3">
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <AdminButton tone="alert" disabled={cancelBooking.isPending} onClick={() => setToCancel(b)}>
                        إلغاء الحجز
                      </AdminButton>
                    )}
                  </td>
                </tr>
              ))
            )}
          </AdminTable>
        )}
      </AdminPanel>

      <ConfirmDialog
        open={toCancel !== null}
        title="إلغاء الحجز؟"
        description={
          toCancel
            ? `سيُلغى حجز الأم مع ${toCancel.specialist?.fullName ?? "الأخصائية"} نهائيًا، وتعود الفترة الزمنية متاحة للحجز من جديد.`
            : ""
        }
        confirmLabel="تأكيد الإلغاء"
        loading={cancelBooking.isPending}
        onConfirm={() => toCancel && cancelBooking.mutate(toCancel.id, { onSettled: () => setToCancel(null) })}
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
}
