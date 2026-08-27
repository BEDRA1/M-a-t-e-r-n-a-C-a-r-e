"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatArabicDateTime,
  formatDzd,
  mealOrderStatusBadgeTone,
  mealOrderStatusLabel,
  mealTypeLabel,
} from "@/lib/format";
import { useCancelMealOrder } from "@/lib/hooks/useNutrition";
import type { MealOrder } from "@/lib/types";

export function MealOrderCard({ order }: { order: MealOrder }) {
  const cancelOrder = useCancelMealOrder();
  const canCancel = order.status === "pending" || order.status === "confirmed";

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{formatArabicDateTime(order.createdAt)}</p>
          <p className="mt-1 text-sm text-foreground">عنوان التوصيل: {order.deliveryAddress}</p>
          <p className="text-sm text-muted">الوقت المفضل: {formatArabicDateTime(order.preferredTime)}</p>
        </div>
        <Badge tone={mealOrderStatusBadgeTone(order.status)}>{mealOrderStatusLabel(order.status)}</Badge>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 border-t border-black/5 pt-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-foreground">
              {item.meal?.name ?? "وجبة"}
              {item.meal && <span className="text-muted"> ({mealTypeLabel(item.meal.mealType)})</span>}
              <span className="text-muted"> × {item.quantity}</span>
            </span>
            <span className="font-medium text-foreground">{formatDzd(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-1.5 flex items-center justify-between border-t border-black/5 pt-2 text-sm font-bold text-foreground">
          <span>المجموع</span>
          <span>{formatDzd(order.totalPrice)}</span>
        </div>
      </div>

      {canCancel && (
        <div className="mt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => cancelOrder.mutate(order.id)}
            loading={cancelOrder.isPending && cancelOrder.variables === order.id}
          >
            إلغاء الطلب
          </Button>
        </div>
      )}
    </Card>
  );
}
