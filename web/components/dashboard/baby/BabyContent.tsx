"use client";

import { PageSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { useBabies } from "@/lib/hooks/useBabies";
import { ApiError } from "@/lib/api-client";
import { BabyEmptyState } from "./BabyEmptyState";
import { BabyDashboard } from "./BabyDashboard";

export function BabyContent() {
  const babies = useBabies();

  if (babies.isLoading) {
    return <PageSpinner />;
  }

  if (babies.isError) {
    // "أنت غير مرتبط بأي عائلة" حالة طبيعية لأم جديدة لم تُنشئ عائلتها بعد — تُعامَل كحالة
    // فارغة عادية لا كخطأ حقيقي (useCreateBaby يضمن إنشاء العائلة تلقائيًا عند أول إضافة طفل)
    const isNoFamily = babies.error instanceof ApiError && babies.error.status === 404;
    if (isNoFamily) {
      return <BabyEmptyState />;
    }
    return (
      <Alert tone="error">
        {babies.error instanceof ApiError ? babies.error.message : "تعذّر تحميل بيانات الأطفال"}
      </Alert>
    );
  }

  if (!babies.data || babies.data.length === 0) {
    return <BabyEmptyState />;
  }

  return <BabyDashboard babies={babies.data} />;
}
