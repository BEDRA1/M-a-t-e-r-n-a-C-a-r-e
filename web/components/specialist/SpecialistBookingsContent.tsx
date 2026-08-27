"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Check, UserRound, Video, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import {
  useBookingsForSpecialist,
  useSetBookingVideoLink,
  useUpdateBookingStatus,
} from "@/lib/hooks/useBookings";
import { bookingStatusBadgeTone, bookingStatusLabel, consultationTypeLabel, formatArabicDateTime, maskPhone } from "@/lib/format";
import { ApiError } from "@/lib/api-client";
import type { Booking, BookingStatus } from "@/lib/types";

const TABS: { key: BookingStatus; label: string }[] = [
  { key: "confirmed", label: "قادمة" },
  { key: "pending", label: "معلقة" },
  { key: "completed", label: "مكتملة" },
  { key: "cancelled", label: "ملغاة" },
];

function VideoLinkField({ booking }: { booking: Booking }) {
  const [value, setValue] = useState("");
  const setVideoLink = useSetBookingVideoLink();

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-xl bg-blue-50 p-3 sm:flex-row sm:items-center">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="رابط جلسة الفيديو (مثلًا Google Meet)"
        className="focus:border-blue-400 focus:ring-blue-300"
      />
      <Button
        variant="ghost"
        size="sm"
        disabled={!value.trim()}
        loading={setVideoLink.isPending}
        onClick={() => setVideoLink.mutate({ id: booking.id, videoLink: value.trim() })}
        className="shrink-0 bg-blue-600 text-white hover:bg-blue-700"
      >
        <Video className="size-4" strokeWidth={2} />
        حفظ الرابط
      </Button>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const updateStatus = useUpdateBookingStatus();
  const [expanded, setExpanded] = useState(false);

  const needsVideoLink =
    booking.status === "confirmed" && booking.consultationType === "remote" && !booking.videoLink;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="flex w-full flex-wrap items-start justify-between gap-3 text-start">
        <div>
          <p className="flex items-center gap-1.5 font-bold text-slate-800">
            <UserRound className="size-4 text-blue-600" strokeWidth={2} />
            {booking.user ? maskPhone(booking.user.phone) : "مريضة"}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Calendar className="size-3.5" strokeWidth={2} />
            {booking.availabilitySlot ? formatArabicDateTime(booking.availabilitySlot.startTime) : ""} ·{" "}
            {consultationTypeLabel(booking.consultationType)}
          </p>
        </div>
        <Badge tone={bookingStatusBadgeTone(booking.status)}>{bookingStatusLabel(booking.status)}</Badge>
      </button>

      {expanded && (
        <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
          <p>سبب الحجز: {booking.reason?.reasonText ?? "—"}</p>
          <Link
            href={`/specialist/patients/${booking.userId}`}
            className="mt-2 inline-flex text-sm font-semibold text-blue-600 hover:underline"
          >
            عرض ملف المريضة
          </Link>
        </div>
      )}

      {booking.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            loading={updateStatus.isPending}
            onClick={() => updateStatus.mutate({ id: booking.id, status: "confirmed" })}
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Check className="size-4" strokeWidth={2.5} />
            قبول
          </Button>
          <Button
            variant="outline"
            size="sm"
            loading={updateStatus.isPending}
            onClick={() => updateStatus.mutate({ id: booking.id, status: "cancelled" })}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <X className="size-4" strokeWidth={2.5} />
            رفض
          </Button>
        </div>
      )}

      {needsVideoLink && <VideoLinkField booking={booking} />}

      {booking.status === "confirmed" && (
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            loading={updateStatus.isPending}
            onClick={() => updateStatus.mutate({ id: booking.id, status: "completed" })}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            إكمال الجلسة
          </Button>
        </div>
      )}
    </div>
  );
}

export function SpecialistBookingsContent() {
  const [tab, setTab] = useState<BookingStatus>("confirmed");
  const bookings = useBookingsForSpecialist(tab);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">حجوزاتي</h1>
        <p className="mt-1 text-sm text-slate-500">إدارة كل الحجوزات الموجّهة إليك.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-full bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {bookings.isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : bookings.isError ? (
        <Alert tone="error">
          {bookings.error instanceof ApiError ? bookings.error.message : "تعذّر تحميل الحجوزات"}
        </Alert>
      ) : !bookings.data || bookings.data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-400">
          <Calendar className="size-8" strokeWidth={1.5} />
          <p>لا توجد حجوزات في هذا القسم حاليًا.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.data.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
