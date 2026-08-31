"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";
import { ApiError } from "@/lib/api-client";
import { useCreateTestimonial } from "@/lib/hooks/useTestimonials";

const STORAGE_KEY = "feedback_shown";
// بلا إيموجي إطلاقًا (قاعدة ثابتة في هذا المشروع) — حُذفت 💬 من العنوان المُرسَل حرفيًا
const TITLE = "رأيكِ يهمّنا";

/** استبيان رأي يظهر مرة واحدة فقط لكل متصفح — فور أول دخول للوحة التحكم حين لا يوجد
 * علامة 'feedback_shown' في localStorage بعد (الحالة الأكثر شيوعًا: مباشرة بعد التسجيل).
 * تُسجَّل العلامة فور اتخاذ قرار العرض نفسه، لا فور الإرسال/الإغلاق، لضمان "مرة واحدة فقط"
 * بشكل مطلق حتى لو غادرت المستخدمة الصفحة دون تفاعل */
export function FeedbackPrompt() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createTestimonial = useCreateTestimonial();

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    localStorage.setItem(STORAGE_KEY, "true");
    const timer = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const isValid = rating >= 1 && content.trim().length >= 5;

  const submit = async () => {
    if (!isValid) return;
    setError(null);
    try {
      await createTestimonial.mutateAsync({ content: content.trim(), rating });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال ملاحظاتك");
    }
  };

  return (
    <BottomSheet open={open} onClose={() => setOpen(false)} title={TITLE}>
      {submitted ? (
        <Alert tone="success">شكراً لمشاركتكِ! رأيكِ سيساعدنا على التحسين المستمر</Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">ساعدينا على تحسين المنصة بمشاركة ملاحظاتكِ</p>

          {error && <Alert tone="error">{error}</Alert>}

          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">كيف تقيّمين تجربتكِ؟</p>
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
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتبي ملاحظاتكِ أو أي خلل لاحظتِه..."
            rows={4}
            maxLength={1000}
            className="w-full resize-none rounded-xl border border-black/10 bg-surface px-3.5 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              لاحقاً
            </Button>
            <Button
              className="flex-1"
              disabled={!isValid}
              loading={createTestimonial.isPending}
              onClick={submit}
            >
              إرسال
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
