"use client";

import { useState } from "react";
import { useAdminMealOrders, useSetOrderStatus } from "@/lib/hooks/useAdmin";
import { formatArabicDateTime, formatDzd, mealTypeLabel } from "@/lib/format";
import type { MealOrderStatus } from "@/lib/types";
import { MEAL_WORKFLOW, inDateRange, type DateRange } from "./orders/order-workflow";
import { CallButton, OrderCard, OrderField, OrderStatusControls, OrdersPageShell } from "./orders/OrderParts";

export function AdminMealOrdersContent() {
  const orders = useAdminMealOrders();
  const setStatus = useSetOrderStatus("meal-orders");
  const [status, setFilter] = useState<"all" | MealOrderStatus>("all");
  const [range, setRange] = useState<DateRange>("all");

  // فلتر التاريخ على وقت التوصيل المفضل — هو ما يهم التحضير اليومي، لا وقت إنشاء الطلب
  const rows = (orders.data ?? [])
    .filter((o) => status === "all" || o.status === status)
    .filter((o) => inDateRange(o.preferredTime, range));
  const newCount = (orders.data ?? []).filter((o) => o.status === "pending").length;
  const busyId = setStatus.isPending ? setStatus.variables?.id : undefined;

  return (
    <OrdersPageShell
      title="طلبات الوجبات"
      description={orders.data ? `${orders.data.length} طلب — ${newCount} جديد` : "طلبات الأكل الصحي"}
      endpoint="GET /meal-orders"
      workflow={MEAL_WORKFLOW}
      query={orders}
      mutationError={setStatus.error}
      status={status}
      onStatusChange={setFilter}
      range={range}
      onRangeChange={setRange}
      rangeHint="حسب وقت التوصيل"
      count={rows.length}
    >
      {rows.map((o) => (
        <OrderCard key={o.id} isNew={o.status === "pending"}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CallButton phone={o.user?.phone} />
              <OrderStatusControls
                workflow={MEAL_WORKFLOW}
                status={o.status}
                busy={busyId === o.id}
                cancelWarning="سيُلغى طلب الوجبات نهائيًا ولا يمكن إعادة تفعيله."
                onChange={(next) => setStatus.mutate({ id: o.id, status: next })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <OrderField label="الوجبات">
                <ul className="flex flex-col gap-0.5">
                  {o.items.map((item) => (
                    <li key={item.id}>
                      <span className="font-semibold tabular-nums">{item.quantity}×</span> {item.meal?.name ?? "وجبة"}
                      {item.meal && <span className="text-xs text-slate-500"> · {mealTypeLabel(item.meal.mealType)}</span>}
                    </li>
                  ))}
                </ul>
              </OrderField>
              <OrderField label="العنوان">{o.deliveryAddress}</OrderField>
              <OrderField label="الوقت المفضل للتوصيل">{formatArabicDateTime(o.preferredTime)}</OrderField>
              <OrderField label="المبلغ">
                <span className="font-bold tabular-nums text-emerald-400">{formatDzd(o.totalPrice)}</span>
                <span className="block text-xs text-slate-500">طُلب {formatArabicDateTime(o.createdAt)}</span>
              </OrderField>
            </div>
          </div>
        </OrderCard>
      ))}
    </OrdersPageShell>
  );
}
