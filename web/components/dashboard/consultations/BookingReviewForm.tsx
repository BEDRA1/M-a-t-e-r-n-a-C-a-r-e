"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ApiError } from "@/lib/api-client";
import { useCreateReview } from "@/lib/hooks/useBookingReviews";
import { cn } from "@/lib/cn";

export function BookingReviewForm({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createReview = useCreateReview();

  const submit = async () => {
    if (rating < 1) return;
    setError(null);
    try {
      await createReview.mutateAsync({ bookingId, rating, comment: comment.trim() || undefined });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال التقييم");
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-primary-100 bg-primary-50/40 p-4">
      {error && <Alert tone="error">{error}</Alert>}
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`${value} من 5`}
            className="flex size-11 items-center justify-center"
          >
            <Star
              className={cn(
                "size-6",
                value <= rating ? "fill-amber-400 text-amber-400" : "text-black/20",
              )}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="تعليق اختياري عن تجربتك..."
        rows={2}
        className="w-full resize-none rounded-xl border border-black/10 bg-surface px-3.5 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" size="sm" onClick={onDone} className="w-full sm:w-auto">
          إلغاء
        </Button>
        <Button size="sm" onClick={submit} disabled={rating < 1} loading={createReview.isPending} className="w-full sm:w-auto">
          إرسال التقييم
        </Button>
      </div>
    </div>
  );
}
