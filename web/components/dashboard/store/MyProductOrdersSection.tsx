"use client";

import { PackageOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { useMyProductOrders } from "@/lib/hooks/useStore";
import { ApiError } from "@/lib/api-client";
import { ProductOrderCard } from "./ProductOrderCard";

export function MyProductOrdersSection() {
  const orders = useMyProductOrders();

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-foreground sm:text-xl">طلباتي</h2>

      <div className="mt-4">
        {orders.isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : orders.isError ? (
          <Alert tone="error">
            {orders.error instanceof ApiError ? orders.error.message : "تعذّر تحميل طلباتك"}
          </Alert>
        ) : !orders.data || orders.data.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
            <PackageOpen className="size-8 text-primary-300" strokeWidth={1.5} />
            <p>لا توجد لديك طلبات بعد.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.data.map((order) => (
              <ProductOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
