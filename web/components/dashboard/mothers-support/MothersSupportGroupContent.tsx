"use client";

import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";

const GROUP_TITLES: Record<string, string> = {
  pregnancy: "أمهات الحمل",
  postpartum: "أمهات النفاس",
  "after-birth": "أمهات ما بعد الولادة",
};

export function MothersSupportGroupContent({ group }: { group: string }) {
  const title = GROUP_TITLES[group] ?? "مجموعة دعم الأمهات";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <Link href="/dashboard/subscriptions" className="flex w-fit items-center gap-1 text-sm font-semibold text-primary-600">
        <ChevronRight className="size-4" strokeWidth={2.5} />
        رجوع
      </Link>

      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <Clock className="size-6" strokeWidth={2} />
        </span>
        <h1 className="text-lg font-extrabold text-foreground">{title}</h1>
        <p className="max-w-xs text-sm leading-relaxed text-muted">
          هذه الميزة قيد التطوير — ستتمكنين من التواصل مع الأمهات الأخريات قريباً
        </p>
      </Card>
    </div>
  );
}
