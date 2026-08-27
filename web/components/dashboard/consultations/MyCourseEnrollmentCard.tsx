"use client";

import Link from "next/link";
import { Award, Calendar, ExternalLink, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { consultationTypeLabel, formatArabicDate, formatArabicDateTime } from "@/lib/format";
import type { CourseEnrollment } from "@/lib/types";

export function MyCourseEnrollmentCard({ enrollment }: { enrollment: CourseEnrollment }) {
  const course = enrollment.course;
  if (!course) return null;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/dashboard/consultations/courses/${course.id}`}>
            <p className="font-bold text-foreground hover:text-primary-700">{course.title}</p>
          </Link>
          {course.specialist && <p className="mt-0.5 text-sm text-muted">{course.specialist.fullName}</p>}
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
            <Calendar className="size-3.5" strokeWidth={2} />
            {formatArabicDate(course.startDate)} · {consultationTypeLabel(course.type)}
          </p>
        </div>
        {enrollment.isFree && (
          <span className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
            <Sparkles className="size-3" strokeWidth={2.5} />
            مجاني برصيد الاشتراك
          </span>
        )}
      </div>

      {course.type === "remote" && course.contentUrl && (
        <a
          href={course.contentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
        >
          <ExternalLink className="size-4" strokeWidth={2} />
          الانتقال إلى محتوى الدورة
        </a>
      )}

      <div className="mt-3 flex items-center gap-2 border-t border-black/5 pt-3">
        <Award className="size-4 text-primary-500" strokeWidth={2} />
        {enrollment.certificateIssued ? (
          <Badge tone="success">
            شهادة صادرة{enrollment.certificateIssuedAt ? ` · ${formatArabicDateTime(enrollment.certificateIssuedAt)}` : ""}
          </Badge>
        ) : (
          <Badge tone="neutral">لم تُصدَر الشهادة بعد</Badge>
        )}
      </div>
    </Card>
  );
}
