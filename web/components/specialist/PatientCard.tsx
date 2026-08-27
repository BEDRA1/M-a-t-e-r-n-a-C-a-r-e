import Link from "next/link";
import { Baby, Brain, Heart, Smile, UserRound } from "lucide-react";
import { formatArabicDate } from "@/lib/format";
import type { SpecialistPatientSummary } from "@/lib/types";

const SHARING_BADGES: { key: keyof SpecialistPatientSummary["sharing"]; label: string; icon: typeof Smile }[] = [
  { key: "moodLogs", label: "المزاج", icon: Smile },
  { key: "assessments", label: "التقييمات", icon: Brain },
  { key: "pregnancyData", label: "الحمل", icon: Heart },
  { key: "postpartumData", label: "النفاس", icon: Baby },
];

export function PatientCard({ patient }: { patient: SpecialistPatientSummary }) {
  const activeBadges = SHARING_BADGES.filter((b) => patient.sharing[b.key]);

  return (
    <Link
      href={`/specialist/patients/${patient.userId}`}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <UserRound className="size-5" strokeWidth={2} />
        </span>
        <div>
          <p className="font-bold text-slate-800">{patient.maskedPhone}</p>
          <p className="text-xs text-slate-500">{patient.sessionCount} جلسات</p>
        </div>
      </div>

      <p className="text-xs text-slate-500">آخر جلسة: {formatArabicDate(patient.lastBookingAt)}</p>

      {activeBadges.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {activeBadges.map((b) => (
            <span
              key={b.key}
              className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
            >
              <b.icon className="size-3" strokeWidth={2} />
              {b.label}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">لم تُفعّل مشاركة أي بيانات إضافية بعد</p>
      )}
    </Link>
  );
}
