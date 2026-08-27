"use client";

import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDzd } from "@/lib/format";
import type { SubscriptionPlan } from "@/lib/types";

// النص الكامل لكل باقة (featuresJson) أصبح مخزَّنًا في prisma/seed.ts نفسه الآن ويأتي مباشرة
// من الـAPI — لم يعد هناك حاجة لتراكب عرض في الواجهة له. يبقى تراكب مدة الباقة (periodLabel)
// وحده ضروريًا لأن نموذج البيانات الحالي لا يملك حقل نصي لمدة الباقة (فقط type: monthly/one_time)
const PLAN_PERIOD_OVERRIDES: Record<string, string> = {
  royal: "/ 3 أشهر",
  postpartum: "/ 40 يوماً",
};

export function PlanCard({
  plan,
  onSubscribe,
}: {
  plan: SubscriptionPlan;
  onSubscribe?: () => void;
}) {
  const highlight = plan.code === "royal";
  const periodLabel = PLAN_PERIOD_OVERRIDES[plan.code] ?? (plan.type === "monthly" ? "/ شهريًا" : "لمرة واحدة");

  return (
    <div
      className={
        highlight
          ? "relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border-2 border-primary-500 bg-surface p-6 shadow-[var(--shadow-soft)]"
          : "relative flex flex-col rounded-[var(--radius-card)] border border-black/5 bg-surface p-6 shadow-[var(--shadow-soft)]"
      }
    >
      {highlight && (
        <span className="absolute end-0 top-0 flex items-center gap-1 rounded-bl-xl bg-primary-500 px-3 py-1.5 text-xs font-bold text-white">
          <Crown className="size-3.5" strokeWidth={2} />
          الأشمل
        </span>
      )}

      <p className="text-lg font-extrabold text-foreground">{plan.nameAr}</p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold text-foreground">{formatDzd(plan.price)}</span>
        <span className="text-sm text-muted">{periodLabel}</span>
      </div>

      {(plan.unlimitedBookings || plan.bookingCredits > 0 || plan.courseCredits > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {plan.unlimitedBookings ? (
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
              استشارات غير محدودة
            </span>
          ) : (
            <>
              {plan.bookingCredits > 0 && (
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                  {plan.bookingCredits} استشارة مجانية
                </span>
              )}
              {plan.courseCredits > 0 && (
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                  {plan.courseCredits} دورة مجانية
                </span>
              )}
            </>
          )}
        </div>
      )}

      <ul className="mt-4 flex flex-1 flex-col gap-2">
        {plan.featuresJson.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80">
            <Check className="mt-0.5 size-4 shrink-0 text-primary-500" strokeWidth={2.5} />
            {feature}
          </li>
        ))}
      </ul>

      {onSubscribe && (
        <Button className="mt-5 w-full justify-center" variant={highlight ? "primary" : "outline"} onClick={onSubscribe}>
          اشتركي الآن
        </Button>
      )}
    </div>
  );
}
