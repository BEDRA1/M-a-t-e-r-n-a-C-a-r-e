"use client";

import { useState } from "react";
import { useAdminProductOrders, useSetOrderStatus } from "@/lib/hooks/useAdmin";
import { formatArabicDateTime, formatDzd } from "@/lib/format";
import type { ProductOrderStatus } from "@/lib/types";
import { PRODUCT_WORKFLOW, inDateRange, type DateRange } from "./orders/order-workflow";
import { CallButton, OrderCard, OrderField, OrderStatusControls, OrdersPageShell } from "./orders/OrderParts";

export function AdminProductOrdersContent() {
  const orders = useAdminProductOrders();
  const setStatus = useSetOrderStatus("product-orders");
  const [status, setFilter] = useState<"all" | ProductOrderStatus>("all");
  const [range, setRange] = useState<DateRange>("all");

  const rows = (orders.data ?? [])
    .filter((o) => status === "all" || o.status === status)
    .filter((o) => inDateRange(o.createdAt, range));
  const newCount = (orders.data ?? []).filter((o) => o.status === "pending").length;
  const busyId = setStatus.isPending ? setStatus.variables?.id : undefined;

  return (
    <OrdersPageShell
      title="طلبات المتجر"
      description={orders.data ? `${orders.data.length} طلب — ${newCount} جديد` : "طلبات منتجات المتجر"}
      endpoint="GET /product-orders"
      workflow={PRODUCT_WORKFLOW}
      query={orders}
      mutationError={setStatus.error}
      status={status}
      onStatusChange={setFilter}
      range={range}
      onRangeChange={setRange}
      rangeHint="حسب تاريخ الطلب"
      count={rows.length}
    >
      {rows.map((o) => (
        <OrderCard key={o.id} isNew={o.status === "pending"}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CallButton phone={o.user?.phone} />
              <OrderStatusControls
                workflow={PRODUCT_WORKFLOW}
                status={o.status}
                busy={busyId === o.id}
                cancelWarning="سيُلغى الطلب نهائيًا وتُعاد كميات منتجاته إلى المخزون تلقائيًا."
                onChange={(next) => setStatus.mutate({ id: o.id, status: next })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <OrderField label="المنتجات">
                <ul className="flex flex-col gap-0.5">
                  {o.items.map((item) => (
                    <li key={item.id}>
                      <span className="font-semibold tabular-nums">{item.quantity}×</span> {item.product?.name ?? "منتج"}
                      <span className="text-xs text-slate-500"> · {formatDzd(item.unitPrice)}</span>
                    </li>
                  ))}
                </ul>
              </OrderField>
              <OrderField label="العنوان">{o.deliveryAddress}</OrderField>
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
