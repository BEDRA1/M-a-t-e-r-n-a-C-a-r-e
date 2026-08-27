"use client";

import { PageSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { usePostpartumCurrent } from "@/lib/hooks/usePostpartum";
import { ApiError } from "@/lib/api-client";
import { PostpartumEmptyState } from "./PostpartumEmptyState";
import { PostpartumDashboard } from "./PostpartumDashboard";

export function PostpartumContent() {
  const current = usePostpartumCurrent();

  if (current.isLoading) {
    return <PageSpinner />;
  }

  if (current.isError) {
    const isNotFound = current.error instanceof ApiError && current.error.status === 404;
    if (isNotFound) {
      return <PostpartumEmptyState />;
    }
    return (
      <Alert tone="error">
        {current.error instanceof ApiError ? current.error.message : "تعذّر تحميل بيانات النفاس"}
      </Alert>
    );
  }

  if (!current.data) {
    return <PostpartumEmptyState />;
  }

  return <PostpartumDashboard period={current.data} />;
}
