"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  formatArabicDate,
  formatDzd,
  subscriptionStatusBadgeTone,
  subscriptionStatusLabel,
} from "@/lib/format";
import { ApiError } from "@/lib/api-client";
import { useCancelSubscription } from "@/lib/hooks/useSubscriptions";
import type { UserSubscription } from "@/lib/types";

export function CurrentSubscriptionCard({ subscription }: { subscription: UserSubscription }) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const cancelSubscription = useCancelSubscription();

  const canCancel = subscription.status === "active" && subscription.plan.type === "monthly";
  const errorMessage =
    cancelSubscription.isError && cancelSubscription.error instanceof ApiError
      ? cancelSubscription.error.message
      : cancelSubscription.isError
        ? "تعذّر إلغاء الاشتراك"
        : null;

  return (
    <Card className="border-2 border-primary-500">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
            <Crown className="size-5" strokeWidth={2} />
          </span>
          <div>
            <p className="font-extrabold text-foreground">باقة {subscription.plan.nameAr}</p>
            <p className="text-sm text-muted">{formatDzd(subscription.plan.price)}</p>
          </div>
        </div>
        <Badge tone={subscriptionStatusBadgeTone(subscription.status)}>
          {subscriptionStatusLabel(subscription.status)}
        </Badge>
      </div>

      <p className="mt-3 text-sm text-muted">
        {subscription.expiresAt ? (
          <>تنتهي في: {formatArabicDate(subscription.expiresAt)}</>
        ) : (
          <>باقة دائمة (بدون تاريخ انتهاء)</>
        )}
      </p>

      {(subscription.plan.unlimitedBookings || subscription.plan.bookingCredits > 0 || subscription.plan.courseCredits > 0) && (
        <div className="mt-4 flex flex-col gap-3">
          {subscription.plan.unlimitedBookings ? (
            <span className="inline-flex w-fit items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
              استشارات غير محدودة
            </span>
          ) : (
            subscription.plan.bookingCredits > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>استشارات متبقية</span>
                  <span>
                    {subscription.bookingCreditsRemaining} / {subscription.plan.bookingCredits}
                  </span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar
                    percent={(subscription.bookingCreditsRemaining / subscription.plan.bookingCredits) * 100}
                  />
                </div>
              </div>
            )
          )}

          {subscription.plan.courseCredits > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>دورات متبقية</span>
                <span>
                  {subscription.courseCreditsRemaining} / {subscription.plan.courseCredits}
                </span>
              </div>
              <div className="mt-1.5">
                <ProgressBar
                  percent={(subscription.courseCreditsRemaining / subscription.plan.courseCredits) * 100}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {canCancel && (
        <div className="mt-4 border-t border-black/5 pt-4">
          {errorMessage && (
            <Alert tone="error">
              <span>{errorMessage}</span>
            </Alert>
          )}

          {confirmingCancel ? (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-sm text-foreground">هل أنتِ متأكدة من إلغاء الاشتراك؟ لن تستفيدي من مزايا الباقة بعد الإلغاء.</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  loading={cancelSubscription.isPending}
                  onClick={() => cancelSubscription.mutate(subscription.id)}
                >
                  نعم، الغِ الاشتراك
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmingCancel(false)}>
                  تراجع
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirmingCancel(true)} className="mt-3">
              إلغاء الاشتراك
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
