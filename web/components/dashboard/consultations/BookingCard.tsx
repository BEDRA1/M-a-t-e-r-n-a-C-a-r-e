"use client";

import { useState } from "react";
import { MapPin, Star, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  bookingStatusBadgeTone,
  bookingStatusLabel,
  consultationTypeLabel,
  formatArabicDateTime,
} from "@/lib/format";
import { useCancelBooking } from "@/lib/hooks/useBookings";
import { cn } from "@/lib/cn";
import { BookingReviewForm } from "./BookingReviewForm";
import type { Booking } from "@/lib/types";

export function BookingCard({ booking }: { booking: Booking }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const cancelBooking = useCancelBooking();

  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  const canReview = booking.status === "completed" && !booking.review;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-foreground">{booking.specialist?.fullName ?? "استشارة"}</p>
          {booking.specialist?.specialty && (
            <p className="text-sm text-muted">{booking.specialist.specialty}</p>
          )}
          <p className="mt-1 text-sm text-muted">
            {booking.availabilitySlot ? formatArabicDateTime(booking.availabilitySlot.startTime) : ""}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="flex items-center gap-1">
              {booking.consultationType === "remote" ? (
                <Video className="size-3.5" strokeWidth={2} />
              ) : (
                <MapPin className="size-3.5" strokeWidth={2} />
              )}
              {consultationTypeLabel(booking.consultationType)}
            </span>
            {booking.reason && <span>· {booking.reason.reasonText}</span>}
          </div>
        </div>
        <Badge tone={bookingStatusBadgeTone(booking.status)}>{bookingStatusLabel(booking.status)}</Badge>
      </div>

      {(booking.status === "confirmed" || booking.status === "completed") &&
        booking.consultationType === "remote" &&
        booking.videoLink && (
          <a
            href={booking.videoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
          >
            <Video className="size-4" strokeWidth={2} />
            الانضمام إلى مكالمة الفيديو
          </a>
        )}

      {booking.review && (
        <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-sm">
          <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={cn(
                  "size-3.5",
                  value <= booking.review!.rating ? "fill-amber-400 text-amber-400" : "text-black/20",
                )}
                strokeWidth={1.5}
              />
            ))}
          </span>
          {booking.review.comment && (
            <span className="text-foreground/80">{booking.review.comment}</span>
          )}
        </div>
      )}

      {(canCancel || (canReview && !showReviewForm)) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {canReview && !showReviewForm && (
            <Button size="sm" variant="outline" onClick={() => setShowReviewForm(true)}>
              قيّم الاستشارة
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => cancelBooking.mutate(booking.id)}
              loading={cancelBooking.isPending && cancelBooking.variables === booking.id}
            >
              إلغاء الحجز
            </Button>
          )}
        </div>
      )}

      {showReviewForm && (
        <BookingReviewForm bookingId={booking.id} onDone={() => setShowReviewForm(false)} />
      )}
    </Card>
  );
}
