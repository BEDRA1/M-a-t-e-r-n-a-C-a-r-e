"use client";

import { Award, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { isCourseCompleted } from "@/lib/format";
import { useCourseEnrollments, useIssueCertificate } from "@/lib/hooks/useCourses";
import { ApiError } from "@/lib/api-client";
import type { Course } from "@/lib/types";

export function CourseEnrollmentsList({ course }: { course: Course }) {
  const enrollments = useCourseEnrollments(course.id);
  const issueCertificate = useIssueCertificate(course.id);
  const completed = isCourseCompleted(course);

  if (enrollments.isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  if (enrollments.isError) {
    return (
      <Alert tone="error">
        {enrollments.error instanceof ApiError ? enrollments.error.message : "تعذّر تحميل المسجلين"}
      </Alert>
    );
  }

  if (!enrollments.data || enrollments.data.length === 0) {
    return <p className="text-sm text-muted">لا يوجد مسجلون في هذه الدورة بعد.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {!completed && (
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <Users className="size-3.5" strokeWidth={2} />
          إصدار الشهادات يُتاح بعد اكتمال الدورة فعليًا
        </p>
      )}
      {enrollments.data.map((enrollment) => (
        <div key={enrollment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">{enrollment.user?.phone ?? "مستخدم"}</span>
            {enrollment.isFree && (
              <span className="flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
                <Sparkles className="size-3" strokeWidth={2.5} />
                مجاني
              </span>
            )}
          </div>

          {enrollment.certificateIssued ? (
            <Badge tone="success">
              <span className="flex items-center gap-1">
                <Award className="size-3" strokeWidth={2.5} />
                شهادة صادرة
              </span>
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={!completed}
              loading={issueCertificate.isPending && issueCertificate.variables === enrollment.id}
              onClick={() => issueCertificate.mutate(enrollment.id)}
            >
              إصدار شهادة
            </Button>
          )}
        </div>
      ))}

      {issueCertificate.isError && (
        <Alert tone="error">
          {issueCertificate.error instanceof ApiError ? issueCertificate.error.message : "تعذّر إصدار الشهادة"}
        </Alert>
      )}
    </div>
  );
}
