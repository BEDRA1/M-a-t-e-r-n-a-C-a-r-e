"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatArabicDateTime,
  formatDzd,
  productOrderStatusBadgeTone,
  productOrderStatusLabel,
} from "@/lib/format";
import { useCancelProductOrder } from "@/lib/hooks/useStore";
import type { ProductOrder } from "@/lib/types";

export function ProductOrderCard({ order }: { order: ProductOrder }) {
  const cancelOrder = useCancelProductOrder();
  const canCancel = order.status === "pending" || order.status === "confirmed";

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{formatArabicDateTime(order.createdAt)}</p>
          <p className="mt-1 text-sm text-foreground">عنوان التوصيل: {order.deliveryAddress}</p>
        </div>
        <Badge tone={productOrderStatusBadgeTone(order.status)}>{productOrderStatusLabel(order.status)}</Badge>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 border-t border-black/5 pt-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-foreground">
              {item.product?.name ?? "منتج"}
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
