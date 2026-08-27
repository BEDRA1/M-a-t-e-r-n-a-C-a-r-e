"use client";

import Link from "next/link";
import { Heart, HeartHandshake, Users, ChevronLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { MotherBabyGlow } from "@/components/landing/illustrations/MotherBabyGlow";
import { PregnantWomanIcon } from "@/components/dashboard/home/icons/PregnantWomanIcon";

interface GroupDef {
  key: string;
  title: string;
  description: string;
  circleClass: string;
  titleClass: string;
  icon: LucideIcon | typeof PregnantWomanIcon;
}

// الألوان الثلاثة (وردي/بنفسجي/أخضر) تطابق عمدًا نفس عائلة ألوان مسارات الأخصائيات في
// lib/tracks.ts (primary/violet/emerald) — اتساق بصري مع بقية التطبيق بدل اختيار ألوان جديدة
const GROUPS: GroupDef[] = [
  {
    key: "pregnancy",
    title: "أمهات الحمل",
    description: "شاركي رحلتك مع أمهات أخريات يعشن نفس المرحلة، من الوحام حتى يوم الولادة.",
    circleClass: "bg-primary-100 text-primary-600",
    titleClass: "text-primary-600",
    icon: PregnantWomanIcon,
  },
  {
    key: "postpartum",
    title: "أمهات النفاس",
    description: "دعم نفسي وعملي من أمهات يمررن بنفس فترة التعافي والتأقلم مع المولود الجديد.",
    circleClass: "bg-violet-100 text-violet-600",
    titleClass: "text-violet-600",
    icon: MotherBabyGlow,
  },
  {
    key: "after-birth",
    title: "أمهات ما بعد الولادة",
    description: "تبادل الخبرات حول نمو الطفل وتحديات الأمومة في الأشهر والسنوات الأولى.",
    circleClass: "bg-emerald-100 text-emerald-600",
    titleClass: "text-emerald-600",
    icon: HeartHandshake,
  },
];

export function MothersSupportSection() {
  return (
    <section className="overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-4 bg-gradient-to-l from-violet-400 to-primary-400 p-5">
        <div className="min-w-0 flex-1 text-end">
          <p className="flex items-center justify-end gap-1.5 text-lg font-extrabold text-white">
            مجموعة دعم الأمهات
            <Heart className="size-4 shrink-0 fill-white text-white" strokeWidth={0} />
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/90">
            فضاء آمن لتبادل التجارب والدعم بين الأمهات في كل مراحل الأمومة
          </p>
        </div>
        <MotherBabyGlow className="size-16 shrink-0" />
      </div>

      <div className="bg-surface p-4">
        <p className="flex items-center justify-end gap-1.5 text-sm font-bold text-foreground">
          اختاري مجموعتك
          <Users className="size-4 text-primary-500" strokeWidth={2} />
        </p>

        <div className="mt-3 flex flex-col gap-2.5">
          {GROUPS.map((group) => {
            const GroupIcon = group.icon;
            return (
              <Link
                key={group.key}
                href={`/dashboard/mothers-support/${group.key}`}
                className="flex items-center gap-3 rounded-2xl border border-black/5 p-3 transition-colors active:scale-[0.99] hover:bg-black/[0.02]"
              >
                <ChevronLeft className="size-4 shrink-0 text-foreground/30" strokeWidth={2.5} />
                <div className="min-w-0 flex-1 text-end">
                  <p className={cn("font-bold", group.titleClass)}>{group.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{group.description}</p>
                </div>
                <span className={cn("flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full", group.circleClass)}>
                  <GroupIcon className="size-7" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
