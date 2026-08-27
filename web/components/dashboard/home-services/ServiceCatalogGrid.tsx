"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { PackageSearch } from "lucide-react";
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {visibleServices.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
