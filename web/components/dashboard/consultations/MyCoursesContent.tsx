"use client";

import { GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { isCourseCompleted } from "@/lib/format";
import { useMyCourseEnrollments } from "@/lib/hooks/useCourses";
import { ApiError } from "@/lib/api-client";
import { MyCourseEnrollmentCard } from "./MyCourseEnrollmentCard";

export function MyCoursesContent() {
  const enrollments = useMyCourseEnrollments();

  if (enrollments.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (enrollments.isError) {
    return (
      <Alert tone="error">
        {enrollments.error instanceof ApiError ? enrollments.error.message : "تعذّر تحميل دوراتك"}
      </Alert>
    );
  }

  const data = enrollments.data ?? [];
  const upcoming = data.filter((e) => e.course && !isCourseCompleted(e.course));
  const completed = data.filter((e) => e.course && isCourseCompleted(e.course));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">دوراتي</h1>
        <p className="mt-1 text-sm text-muted">الدورات التكوينية التي سجّلتِ بها.</p>
      </div>

      {data.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <GraduationCap className="size-8 text-primary-300" strokeWidth={1.5} />
          <p>لم تسجّلي في أي دورة بعد.</p>
        </Card>
      ) : (
        <>
          <section>
            <h2 className="text-lg font-bold text-foreground">قادمة</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-muted">لا توجد دورات قادمة مسجَّلة حاليًا.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {upcoming.map((enrollment) => (
                  <MyCourseEnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">مكتملة</h2>
            {completed.length === 0 ? (
              <p className="mt-3 text-sm text-muted">لا توجد دورات مكتملة بعد.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {completed.map((enrollment) => (
                  <MyCourseEnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
