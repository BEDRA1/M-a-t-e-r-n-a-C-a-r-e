"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatArabicDateTime,
  formatDzd,
  homeServiceDisplayName,
  serviceBookingStatusBadgeTone,
  serviceBookingStatusLabel,
} from "@/lib/format";
import { useCancelServiceBooking } from "@/lib/hooks/useHomeServices";
import type { ServiceBooking } from "@/lib/types";

export function ServiceBookingCard({ booking }: { booking: ServiceBooking }) {
  const cancelBooking = useCancelServiceBooking();
  const canCancel = booking.status === "pending" || booking.status === "confirmed";

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-foreground">
            {booking.service ? homeServiceDisplayName(booking.service.name) : "خدمة منزلية"}
          </p>
          <p className="mt-1 text-sm text-muted">{formatArabicDateTime(booking.scheduledTime)}</p>
          <p className="text-sm text-muted">العنوان: {booking.address}</p>
          {booking.notes && <p className="text-sm text-muted">ملاحظات: {booking.notes}</p>}
          {booking.service && (
            <p className="mt-1 text-sm font-semibold text-foreground">{formatDzd(booking.service.basePrice)}</p>
          )}
        </div>
        <Badge tone={serviceBookingStatusBadgeTone(booking.status)}>
          {serviceBookingStatusLabel(booking.status)}
        </Badge>
      </div>

      {canCancel && (
        <div className="mt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => cancelBooking.mutate(booking.id)}
            loading={cancelBooking.isPending && cancelBooking.variables === booking.id}
          >
            إلغاء الحجز
          </Button>
        </div>
      )}
    </Card>
  );
}
