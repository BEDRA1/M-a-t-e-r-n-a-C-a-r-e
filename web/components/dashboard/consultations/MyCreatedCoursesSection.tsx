"use client";

import { useState } from "react";
import { ChevronDown, GraduationCap, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { consultationTypeLabel, formatArabicDate, formatDzd } from "@/lib/format";
import { useCourses } from "@/lib/hooks/useCourses";
import { useMySpecialistProfile } from "@/lib/hooks/useSpecialists";
import { ApiError } from "@/lib/api-client";
import { CreateCourseForm } from "./CreateCourseForm";
import { CourseEnrollmentsList } from "./CourseEnrollmentsList";

export function MyCreatedCoursesSection() {
  const myProfile = useMySpecialistProfile(true);
  const allCourses = useCourses({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  const myCourses = allCourses.data?.filter((course) => course.specialistId === myProfile.data?.id) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">دوراتي المُنشأة</h2>
          <p className="mt-1 text-sm text-muted">أنشئي دورات تكوينية وتابعي المسجلين فيها.</p>
        </div>
        {!showCreateForm && (
          <Button size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="size-4" strokeWidth={2} />
            دورة جديدة
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card>
          <CreateCourseForm onDone={() => setShowCreateForm(false)} />
        </Card>
      )}

      {myProfile.isLoading || allCourses.isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : allCourses.isError ? (
        <Alert tone="error">
          {allCourses.error instanceof ApiError ? allCourses.error.message : "تعذّر تحميل الدورات"}
        </Alert>
      ) : myCourses.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-8 text-center text-muted">
          <GraduationCap className="size-8 text-primary-300" strokeWidth={1.5} />
          <p>لم تنشئي أي دورة بعد.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {myCourses.map((course) => {
            const isExpanded = expandedCourseId === course.id;
            return (
              <Card key={course.id}>
                <button
                  type="button"
                  onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                  className="flex w-full items-start justify-between gap-3 text-start"
                >
                  <div>
                    <p className="font-bold text-foreground">{course.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {formatArabicDate(course.startDate)} · {consultationTypeLabel(course.type)} · {formatDzd(course.price)}
                    </p>
                    {course.type === "in_person" && course.capacity !== null && (
                      <p className="mt-1 text-xs text-muted">
                        {course.enrolledCount} / {course.capacity} مسجّلين
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">{course.enrolledCount} مسجّل</Badge>
                    <ChevronDown className={cn("size-4 text-muted transition-transform", isExpanded && "-rotate-180")} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 border-t border-black/5 pt-4">
                    <CourseEnrollmentsList course={course} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
