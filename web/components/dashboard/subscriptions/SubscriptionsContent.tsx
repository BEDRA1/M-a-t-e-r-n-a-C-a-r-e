"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { ApiError } from "@/lib/api-client";
import { useMySubscriptions, useSubscriptionPlans } from "@/lib/hooks/useSubscriptions";
import type { SubscriptionPlan } from "@/lib/types";
import { SubscriptionCrownIllustration } from "@/components/dashboard/illustrations/SubscriptionCrownIllustration";
import { ArticlesPreviewSection } from "./ArticlesPreviewSection";
import { MothersSupportSection } from "./MothersSupportSection";
import { PlanCard } from "./PlanCard";
import { PaymentOverlay } from "./PaymentOverlay";
import { CurrentSubscriptionCard } from "./CurrentSubscriptionCard";

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
          <h1 className="mt-3 text-2xl font-extrabold text-foreground sm:text-3xl">الخدمات الإضافية</h1>
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
            <div
              className={cn(
                "mt-5 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1",
                "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                "sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:pb-0 xl:grid-cols-3",
              )}
            >
              {plans.data
                .filter((plan) => plan.id !== activeSubscription.planId)
                .map((plan) => (
                  <div
                    key={plan.id}
                    className="min-w-[78%] shrink-0 snap-start sm:min-w-0 sm:shrink sm:snap-align-none"
                  >
                    <PlanCard plan={plan} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:pb-0 xl:grid-cols-3",
          )}
        >
          {plans.data.map((plan) => (
            <div key={plan.id} className="min-w-[78%] shrink-0 snap-start sm:min-w-0 sm:shrink sm:snap-align-none">
              <PlanCard plan={plan} onSubscribe={() => setSelectedPlan(plan)} />
            </div>
          ))}
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
