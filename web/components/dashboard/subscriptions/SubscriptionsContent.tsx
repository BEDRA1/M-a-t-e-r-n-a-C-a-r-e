"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/api-client";
import { useMySubscriptions, useSubscriptionPlans } from "@/lib/hooks/useSubscriptions";
import type { SubscriptionPlan } from "@/lib/types";
import { SubscriptionCrownIllustration } from "@/components/dashboard/illustrations/SubscriptionCrownIllustration";
import { ArticlesPreviewSection } from "./ArticlesPreviewSection";
import { MothersSupportSection } from "./MothersSupportSection";
import { PlanCard } from "./PlanCard";
import { PaymentOverlay } from "./PaymentOverlay";
import { CurrentSubscriptionCard } from "./CurrentSubscriptionCard";

// ترتيب عرض منطقي (الصف الأول: الرقمية/المميزة/الملكية، الصف الثاني: النفاس/الزوجين) بدل
// ترتيب الـAPI الفعلي (بالسعر تصاعديًا) الذي يخلط الباقات لمرة واحدة بين باقات الاشتراك الشهري
const PLAN_DISPLAY_ORDER = ["basic", "premium", "royal", "postpartum", "couples"];

function sortPlansForDisplay(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  return [...plans].sort((a, b) => {
    const ai = PLAN_DISPLAY_ORDER.indexOf(a.code);
    const bi = PLAN_DISPLAY_ORDER.indexOf(b.code);
    return (ai === -1 ? PLAN_DISPLAY_ORDER.length : ai) - (bi === -1 ? PLAN_DISPLAY_ORDER.length : bi);
  });
}

/** شبكة الباقات: الصف الأول 3 أعمدة متساوية الارتفاع، والباقي صفًا ثانيًا بعمودين — على
 * الموبايل عمود واحد دائمًا. h-full على PlanCard + items-stretch الافتراضي في grid يضمن تساوي
 * ارتفاع كل بطاقات نفس الصف بغض النظر عن طول قائمة مميزاتها */
function PlansGrid({
  plans,
  onSubscribe,
}: {
  plans: SubscriptionPlan[];
  onSubscribe?: (plan: SubscriptionPlan) => void;
}) {
  const ordered = sortPlansForDisplay(plans);
  const firstRow = ordered.slice(0, 3);
  const secondRow = ordered.slice(3);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {firstRow.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onSubscribe={onSubscribe ? () => onSubscribe(plan) : undefined} />
        ))}
      </div>
      {secondRow.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {secondRow.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSubscribe={onSubscribe ? () => onSubscribe(plan) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SubscriptionsContent() {
  const plans = useSubscriptionPlans();
  const mySubscriptions = useMySubscriptions();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const activeSubscription = mySubscriptions.data?.find((s) => s.status === "active");

  return (
    <div className="flex flex-col gap-10">
      <ArticlesPreviewSection />

      <MothersSupportSection />

      <section>
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-start">
        <SubscriptionCrownIllustration className="size-28 shrink-0 sm:size-32" />
        <div>
          <Badge tone="primary" className="mx-auto sm:mx-0">
            دعم مستمر لرحلتك
          </Badge>
          <h1 className="mt-3 text-2xl font-extrabold text-foreground sm:text-3xl">الاشتراكات</h1>
        </div>
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
        اختاري الباقة التي تناسب احتياجاتك خلال رحلة الحمل والنفاس، واستفيدي من استشارات ودورات مجانية ضمن اشتراكك.
      </p>

      <div className="mt-8 flex items-center gap-2">
        <Crown className="size-5 text-primary-500" strokeWidth={2} />
        <h2 className="font-bold text-foreground">باقاتنا المميزة</h2>
      </div>

      {plans.isLoading || mySubscriptions.isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : plans.isError ? (
        <div className="mt-8">
          <Alert tone="error">
            {plans.error instanceof ApiError ? plans.error.message : "تعذّر تحميل الباقات"}
          </Alert>
        </div>
      ) : !plans.data || plans.data.length === 0 ? null : activeSubscription ? (
        <div className="mt-8">
          <CurrentSubscriptionCard subscription={activeSubscription} />

          <div className="mt-10">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">باقات أخرى للمقارنة</h2>
            <div className="mt-5">
              <PlansGrid plans={plans.data.filter((plan) => plan.id !== activeSubscription.planId)} />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <PlansGrid plans={plans.data} onSubscribe={(plan) => setSelectedPlan(plan)} />
        </div>
      )}

      {mySubscriptions.isError && (
        <div className="mt-4">
          <Alert tone="error">
            {mySubscriptions.error instanceof ApiError ? mySubscriptions.error.message : "تعذّر تحميل اشتراكك الحالي"}
          </Alert>
        </div>
      )}
      </section>

      {selectedPlan && <PaymentOverlay plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
}
