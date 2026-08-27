"use client";

import { useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { useSpecialists } from "@/lib/hooks/useSpecialists";
import { filterVisibleSpecialists, isTrackCode, TRACKS } from "@/lib/tracks";
import { SpecialistCard } from "./SpecialistCard";
import { ApiError } from "@/lib/api-client";

export function SpecialistsListContent() {
  const searchParams = useSearchParams();
  const trackParam = searchParams.get("track");
  const track = trackParam && isTrackCode(trackParam) ? trackParam : undefined;
  const specialists = useSpecialists({ track });
  const visibleSpecialists = filterVisibleSpecialists(track, specialists.data ?? []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">
          {track ? `${TRACKS[track].specialistTitle}ات معتمدات` : "قائمة الأخصائيين"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {track
            ? `اختاري إحدى ${TRACKS[track].specialistTitle}ات مسار "${TRACKS[track].name}" واطّلعي على نبذتها قبل حجز استشارتك.`
            : "اختاري أخصائيًا معتمدًا واطّلعي على نبذته قبل حجز استشارتك."}
        </p>
      </div>

      {specialists.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : specialists.isError ? (
        <Alert tone="error">
          {specialists.error instanceof ApiError
            ? specialists.error.message
            : "تعذّر تحميل قائمة الأخصائيين"}
        </Alert>
      ) : visibleSpecialists.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <Users className="size-8 text-primary-300" strokeWidth={1.5} />
          <p>لا يوجد أخصائيون معتمدون متاحون حاليًا.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSpecialists.map((specialist) => (
            <SpecialistCard key={specialist.id} specialist={specialist} />
          ))}
        </div>
      )}
    </div>
  );
}
