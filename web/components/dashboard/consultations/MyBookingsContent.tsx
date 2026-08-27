"use client";

import { CalendarX } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { ApiError } from "@/lib/api-client";
import { BookingCard } from "./BookingCard";

export function MyBookingsContent() {
  const bookings = useMyBookings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">حجوزاتي</h1>
        <p className="mt-1 text-sm text-muted">تابعي حالة استشاراتك المحجوزة وقيّمي ما اكتمل منها.</p>
      </div>

      {bookings.isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : bookings.isError ? (
        <Alert tone="error">
          {bookings.error instanceof ApiError ? bookings.error.message : "تعذّر تحميل حجوزاتك"}
        </Alert>
      ) : !bookings.data || bookings.data.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <CalendarX className="size-8 text-primary-300" strokeWidth={1.5} />
          <p>لا توجد لديك حجوزات بعد.</p>
        </Card>
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
