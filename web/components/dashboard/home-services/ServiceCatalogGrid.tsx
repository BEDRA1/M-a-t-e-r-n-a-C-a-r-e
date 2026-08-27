"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/cn";
import { useHomeServicesCatalog } from "@/lib/hooks/useHomeServices";
import { ApiError } from "@/lib/api-client";
import { ServiceCard } from "./ServiceCard";

export function ServiceCatalogGrid() {
  const services = useHomeServicesCatalog();

  if (services.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (services.isError) {
    return (
      <Alert tone="error">
        {services.error instanceof ApiError ? services.error.message : "تعذّر تحميل قائمة الخدمات"}
      </Alert>
    );
  }

  if (!services.data || services.data.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
        <PackageSearch className="size-8 text-primary-300" strokeWidth={1.5} />
        <p>لا توجد خدمات متاحة حاليًا.</p>
      </Card>
    );
  }

  // "تنظيف عميق" مخفية من العرض فقط بطلب صريح (لا تُحذف من قاعدة البيانات) — الخدمة تبقى
  // موجودة فعليًا في الـBackend، فقط لا تظهر في هذه القائمة
  const visibleServices = services.data.filter((service) => service.name !== "تنظيف عميق");

  if (visibleServices.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
        <PackageSearch className="size-8 text-primary-300" strokeWidth={1.5} />
        <p>لا توجد خدمات متاحة حاليًا.</p>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:pb-0 xl:grid-cols-3",
      )}
    >
      {visibleServices.map((service) => (
        <div key={service.id} className="min-w-[78%] shrink-0 snap-start sm:min-w-0 sm:shrink sm:snap-align-none">
          <ServiceCard service={service} />
        </div>
      ))}
    </div>
  );
}
