"use client";

import { CalendarClock, StickyNote } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useBookingsForSpecialist } from "@/lib/hooks/useBookings";
import { useClinicalNotes } from "@/lib/hooks/useClinicalNotes";
import { bookingStatusBadgeTone, bookingStatusLabel, consultationTypeLabel, formatArabicDateTime } from "@/lib/format";

export function SessionHistoryTab({ patientUserId }: { patientUserId: string }) {
  const bookings = useBookingsForSpecialist();
  const notes = useClinicalNotes(patientUserId);

  if (bookings.isLoading || notes.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const patientBookings = (bookings.data ?? [])
    .filter((b) => b.userId === patientUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (patientBookings.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">لا توجد جلسات مسجّلة مع هذه المريضة بعد.</p>;
  }

  const notesByBooking = new Map((notes.data ?? []).map((n) => [n.bookingId, n]));

  return (
    <div className="flex flex-col gap-3">
      {patientBookings.map((booking) => {
        const note = notesByBooking.get(booking.id);
        return (
          <div key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <CalendarClock className="size-4 text-blue-600" strokeWidth={2} />
                {booking.availabilitySlot ? formatArabicDateTime(booking.availabilitySlot.startTime) : ""} ·{" "}
                {consultationTypeLabel(booking.consultationType)}
              </p>
              <Badge tone={bookingStatusBadgeTone(booking.status)}>{bookingStatusLabel(booking.status)}</Badge>
            </div>

            {note ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-sm text-slate-700">
                <StickyNote className="mt-0.5 size-4 shrink-0 text-blue-600" strokeWidth={2} />
                <p className="leading-relaxed">{note.noteText}</p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400">لا توجد ملاحظة كلينيكية لهذه الجلسة بعد.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
