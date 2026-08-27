import { Clock } from "lucide-react";

/** إشارة صادقة وصغيرة أسفل الصفحة: المحتوى تعريفي، والحجز/الطلب الفعلي قيد التطوير */
export function ComingSoonNotice({ actionLabel }: { actionLabel: string }) {
  return (
    <div className="mt-10 flex items-center gap-3 rounded-2xl border border-primary-100 bg-primary-50/60 px-5 py-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
        <Clock className="size-4.5" strokeWidth={2} />
      </span>
      <p className="text-sm text-foreground/80">
        <span className="font-semibold text-primary-700">هذه الخدمة قيد التطوير. </span>
        {actionLabel} ستتوفر قريبًا مباشرة من داخل التطبيق.
      </p>
    </div>
  );
}
