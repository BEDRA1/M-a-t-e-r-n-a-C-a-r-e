"use client";

import Link from "next/link";
import { Calendar, CalendarClock, Clock, UserRound } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useBookingsForSpecialist, useUpcomingBookingsForSpecialist } from "@/lib/hooks/useBookings";
import { consultationTypeLabel, formatArabicDateTime, maskPhone } from "@/lib/format";

function isToday(dateString: string): boolean {
  const d = new Date(dateString);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function SpecialistDashboardContent() {
  const upcoming = useUpcomingBookingsForSpecialist();
  const pending = useBookingsForSpecialist("pending");

  const todayBookings = (upcoming.data ?? []).filter((b) => b.availabilitySlot && isToday(b.availabilitySlot.startTime));
  const pendingCount = pending.data?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-slate-500">نظرة سريعة على حجوزاتك اليوم وطلباتك المعلّقة.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="flex items-center gap-2 font-bold text-slate-800">
            <Calendar className="size-4 text-blue-600" strokeWidth={2} />
            حجوزاتي اليوم
          </h2>

          {upcoming.isLoading ? (
            <div className="mt-3 flex flex-col gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : todayBookings.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">لا توجد حجوزات مؤكدة اليوم.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {todayBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <UserRound className="size-3.5 text-blue-600" strokeWidth={2} />
                    {booking.user ? maskPhone(booking.user.phone) : "مريضة"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="size-3.5" strokeWidth={2} />
                    {booking.availabilitySlot ? formatArabicDateTime(booking.availabilitySlot.startTime) : ""} ·{" "}
                    {consultationTypeLabel(booking.consultationType)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link href="/specialist/bookings" className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:underline">
            عرض كل الحجوزات
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-slate-800">
              <CalendarClock className="size-4 text-blue-600" strokeWidth={2} />
              طلبات معلّقة
            </h2>
            {pendingCount > 0 && (
              <span className="flex size-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {pendingCount}
              </span>
            )}
          </div>

          {pending.isLoading ? (
            <div className="mt-3 flex flex-col gap-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : pendingCount === 0 ? (
            <p className="mt-3 text-sm text-slate-400">لا توجد طلبات معلّقة حاليًا.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {(pending.data ?? []).slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <UserRound className="size-3.5 text-amber-600" strokeWidth={2} />
                    {booking.user ? maskPhone(booking.user.phone) : "مريضة"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {booking.availabilitySlot ? formatArabicDateTime(booking.availabilitySlot.startTime) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link href="/specialist/bookings" className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:underline">
            مراجعة الطلبات
          </Link>
        </div>
      </div>
    </div>
  );
}
