import Link from "next/link";
import { Briefcase, MapPin, UserRound } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { specialistPhotoSrc } from "@/lib/tracks";
import type { Specialist } from "@/lib/types";

export function SpecialistCard({ specialist }: { specialist: Specialist }) {
  return (
    <Link href={`/dashboard/consultations/specialists/${specialist.id}`}>
      <Card className="flex h-full flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]">
        <div className="flex items-start gap-3">
          <span className="size-14 shrink-0 overflow-hidden rounded-full">
            <ImageWithFallback src={specialistPhotoSrc(specialist)} alt={specialist.fullName} icon={UserRound} className="size-full" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 break-words font-bold text-foreground">{specialist.fullName}</p>
            <p className="line-clamp-1 break-words text-sm text-muted">{specialist.specialty}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Briefcase className="size-3.5" strokeWidth={2} />
                {specialist.yearsExperience} سنوات خبرة
              </span>
              {specialist.user?.wilaya && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" strokeWidth={2} />
                  {specialist.user.wilaya}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{specialist.bio}</p>
      </Card>
    </Link>
  );
}
