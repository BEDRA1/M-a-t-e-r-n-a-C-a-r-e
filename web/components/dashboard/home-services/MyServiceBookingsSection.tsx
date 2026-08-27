"use client";

import { CalendarX } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { useMyServiceBookings } from "@/lib/hooks/useHomeServices";
import { ApiError } from "@/lib/api-client";
import { ServiceBookingCard } from "./ServiceBookingCard";

export function MyServiceBookingsSection() {
  const bookings = useMyServiceBookings();

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-foreground sm:text-xl">حجوزاتي</h2>

      <div className="mt-4">
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
              <ServiceBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
