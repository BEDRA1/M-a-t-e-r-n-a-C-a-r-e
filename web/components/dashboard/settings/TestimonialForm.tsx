"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ApiError } from "@/lib/api-client";
import { useCreateTestimonial } from "@/lib/hooks/useTestimonials";
import { cn } from "@/lib/cn";

export function TestimonialForm() {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const createTestimonial = useCreateTestimonial();

  const submit = async () => {
    if (rating < 1 || content.trim().length < 5) return;
    setError(null);
    try {
      await createTestimonial.mutateAsync({
        content: content.trim(),
        rating,
        displayName: displayName.trim() || undefined,
      });
      setSubmitted(true);
      setContent("");
      setDisplayName("");
      setRating(0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال رأيك");
    }
  };

  if (submitted) {
    return (
      <Alert tone="success">
        شكراً لكِ على مشاركة رأيكِ! ملاحظاتكِ تساعدنا على تطوير المنصة باستمرار
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-3">
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
              className={cn("size-7", value <= rating ? "fill-amber-400 text-amber-400" : "text-black/20")}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="شاركينا تجربتك مع المنصة..."
        rows={3}
        maxLength={1000}
        className="w-full resize-none rounded-xl border border-black/10 bg-surface px-3.5 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
      />

      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="الاسم الذي سيظهر مع رأيك (اختياري)"
        maxLength={50}
        className="w-full rounded-xl border border-black/10 bg-surface px-3.5 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
      />

      <div className="flex sm:justify-end">
        <Button
          onClick={submit}
          disabled={rating < 1 || content.trim().length < 5}
          loading={createTestimonial.isPending}
          className="w-full sm:w-auto"
        >
          إرسال رأيي
        </Button>
      </div>
    </div>
  );
}
