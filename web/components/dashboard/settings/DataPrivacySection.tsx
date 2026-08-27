"use client";

import { useMemo } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { useMyBookings } from "@/lib/hooks/useBookings";
import { useDataSharing, useUpdateDataSharing } from "@/lib/hooks/useDataSharing";
import type { DataSharingSettings, Specialist } from "@/lib/types";

const SHARING_ROWS: { key: keyof Omit<DataSharingSettings, "id" | "userId" | "specialistId" | "createdAt" | "updatedAt">; label: string }[] = [
  { key: "shareMoodLogs", label: "المزاج" },
  { key: "shareAssessments", label: "التقييمات النفسية" },
  { key: "sharePregnancyData", label: "بيانات الحمل" },
  { key: "sharePostpartumData", label: "بيانات النفاس" },
];

function SpecialistSharingCard({ specialist }: { specialist: Specialist }) {
  const sharing = useDataSharing(specialist.id);
  const update = useUpdateDataSharing(specialist.id);

  const toggle = (key: (typeof SHARING_ROWS)[number]["key"]) => {
    const current = sharing.data?.[key] ?? false;
    update.mutate({ [key]: !current });
  };

  return (
    <div className="rounded-xl border border-black/5 bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-bold text-foreground">{specialist.fullName}</p>
          <p className="text-sm text-muted">{specialist.specialty}</p>
        </div>
        {update.isPending ? (
          <span className="text-xs text-muted">جارِ الحفظ...</span>
        ) : update.isSuccess ? (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <Check className="size-3.5" strokeWidth={2.5} />
            تم الحفظ
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {sharing.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          SHARING_ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between">
              <span className="text-sm text-foreground/80">{row.label}</span>
              <Switch
                checked={sharing.data?.[row.key] ?? false}
                onChange={() => toggle(row.key)}
                disabled={update.isPending}
                label={row.label}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function DataPrivacySection() {
  const bookings = useMyBookings();

  const specialists = useMemo(() => {
    const map = new Map<string, Specialist>();
    for (const booking of bookings.data ?? []) {
      if (booking.specialist) map.set(booking.specialist.id, booking.specialist);
    }
    return [...map.values()];
  }, [bookings.data]);

  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-soft)]">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <ShieldCheck className="size-5 text-primary-600" strokeWidth={2} />
        خصوصية البيانات
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        تحكّمي بما تشاركينه من بياناتك مع كل أخصائية حجزتِ معها. لا تُشارَك أي بيانات إضافية دون تفعيلك الصريح هنا.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {bookings.isLoading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : specialists.length === 0 ? (
          <p className="text-sm text-muted">لم تحجزي مع أي أخصائية بعد.</p>
        ) : (
          specialists.map((specialist) => <SpecialistSharingCard key={specialist.id} specialist={specialist} />)
        )}
      </div>
    </div>
  );
}
