"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";
import { useCourses } from "@/lib/hooks/useCourses";
import { ApiError } from "@/lib/api-client";
import type { ConsultationType } from "@/lib/types";
import { isTrackCode, TRACKS } from "@/lib/tracks";
import { GraduationCapIllustration } from "@/components/dashboard/illustrations/GraduationCapIllustration";
import { CourseCard } from "./CourseCard";

const TYPE_TABS: { value: ConsultationType | "all"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "in_person", label: "حضوري" },
  { value: "remote", label: "عن بُعد" },
];

export function CoursesListContent() {
  const searchParams = useSearchParams();
  const trackParam = searchParams.get("track");
  const track = trackParam && isTrackCode(trackParam) ? trackParam : undefined;

  const [typeFilter, setTypeFilter] = useState<ConsultationType | "all">("all");
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  const courses = useCourses({
    type: typeFilter === "all" ? undefined : typeFilter,
    upcomingOnly,
    track,
  });

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-start">
        <GraduationCapIllustration className="size-28 shrink-0 sm:size-32" />
        <div>
          <Badge tone="primary" className="mx-auto sm:mx-0">
            {track ? TRACKS[track].name : "تعلّم بمرافقة أخصائيين"}
          </Badge>
          <h1 className="mt-3 text-2xl font-extrabold text-foreground sm:text-3xl">
            {track ? `دورات ${TRACKS[track].name}` : "الدورات التكوينية"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            دورات تحضيرية ومتخصصة يقدّمها أخصائيون معتمدون، حضوريًا أو عن بُعد.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setTypeFilter(tab.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                typeFilter === tab.value
                  ? "bg-primary-500 text-white"
                  : "bg-primary-50 text-primary-700 hover:bg-primary-100",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => setUpcomingOnly(e.target.checked)}
            className="size-4 rounded border-black/20 accent-primary-500"
          />
          القادمة فقط
        </label>
      </div>

      {courses.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : courses.isError ? (
        <Alert tone="error">
          {courses.error instanceof ApiError ? courses.error.message : "تعذّر تحميل قائمة الدورات"}
        </Alert>
      ) : !courses.data || courses.data.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <GraduationCap className="size-8 text-primary-300" strokeWidth={1.5} />
          <p>لا توجد دورات مطابقة لهذا الفلتر حاليًا.</p>
        </Card>
      ) : (
        <div
          className={cn(
            "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:pb-0 lg:grid-cols-3",
          )}
        >
          {courses.data.map((course) => (
            <div
              key={course.id}
              className="min-w-[78%] shrink-0 snap-start sm:min-w-0 sm:shrink sm:snap-align-none"
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
