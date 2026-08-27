"use client";

import Link from "next/link";
import { Briefcase, MapPin, UserRound } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PageSpinner } from "@/components/ui/Spinner";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { specialistPhotoSrc } from "@/lib/tracks";
import { useSpecialist } from "@/lib/hooks/useSpecialists";
import { ApiError } from "@/lib/api-client";

export function SpecialistDetailContent({ specialistId }: { specialistId: string }) {
  const specialist = useSpecialist(specialistId);

  if (specialist.isLoading) {
    return <PageSpinner />;
  }

  if (specialist.isError || !specialist.data) {
    return (
      <Alert tone="error">
        {specialist.error instanceof ApiError
          ? specialist.error.message
          : "تعذّر تحميل بيانات هذا الأخصائي"}
      </Alert>
    );
  }

  const data = specialist.data;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="size-20 shrink-0 overflow-hidden rounded-full">
            <ImageWithFallback
              src={specialistPhotoSrc(data)}
              alt={data.fullName}
              icon={UserRound}
              className="size-full"
              iconClassName="size-9"
            />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
              {data.fullName}
            </h1>
            <p className="mt-0.5 text-sm text-muted">{data.specialty}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-4" strokeWidth={2} />
                {data.yearsExperience} سنوات خبرة
              </span>
              {data.user?.wilaya && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" strokeWidth={2} />
                  {data.user.wilaya}
                </span>
              )}
            </div>
          </div>

          <Link href={`/dashboard/consultations/book?specialistId=${data.id}`} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">احجزي استشارة</Button>
          </Link>
        </div>

        <div className="mt-6 border-t border-black/5 pt-5">
          <h2 className="text-sm font-bold text-foreground">نبذة</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{data.bio}</p>
        </div>
      </Card>
    </div>
  );
}
