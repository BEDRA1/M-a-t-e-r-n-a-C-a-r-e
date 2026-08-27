"use client";

import Link from "next/link";
import { Calendar, CheckCircle, MapPin, Users, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  consultationTypeLabel,
  formatArabicDate,
  formatDzd,
  getSeatsStatus,
  seatsStatusBadgeTone,
  seatsStatusLabel,
} from "@/lib/format";
import { useEnrollCourse, useMyCourseEnrollments } from "@/lib/hooks/useCourses";
import { ApiError } from "@/lib/api-client";
import { courseCoverImage, TRACKS } from "@/lib/tracks";
import type { Course } from "@/lib/types";

export function CourseCard({ course }: { course: Course }) {
  const enroll = useEnrollCourse();
  // السبب الجذري الحقيقي لشكوى "مسجّلة بالفعل ولم أسجل": الضغط الأول كان ينجح فعليًا (201)
  // لكن الزر لا يتغيّر إطلاقًا بعده — فيبدو للمستخدمة أن شيئًا لم يحدث، وضغطة ثانية طبيعية
  // تصطدم بـ409 الصحيح فعليًا لكنه يبدو خطأً كاذبًا بلا سياق. هذا التحقق من enrollments/mine
  // يغطي الحالتين معًا: تسجيل ناجح للتو في هذه الجلسة، أو تسجيل سابق من زيارة سابقة للقائمة
  const myEnrollments = useMyCourseEnrollments();
  const alreadyEnrolled =
    (enroll.isSuccess && enroll.variables === course.id) ||
    Boolean(myEnrollments.data?.some((e) => e.courseId === course.id));
  const seatsStatus =
    course.type === "in_person" && course.capacity !== null
      ? getSeatsStatus(course.capacity, course.enrolledCount)
      : null;
  const isFull = seatsStatus === "full";
  const track = course.specialist?.track;
  const trackColors = TRACKS[track ?? "psychological"].colors;

  return (
    <Card className="flex flex-col overflow-hidden !p-0">
      <div className="relative aspect-[4/3] w-full sm:aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={courseCoverImage(track)}
          alt={course.title}
          className="size-full rounded-t-xl object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <span
          className={cn(
            "absolute end-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm",
            trackColors.solid,
          )}
        >
          {TRACKS[track ?? "psychological"].name}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Badge tone="neutral">{consultationTypeLabel(course.type)}</Badge>
          {seatsStatus && <Badge tone={seatsStatusBadgeTone(seatsStatus)}>{seatsStatusLabel(seatsStatus)}</Badge>}
        </div>

        <Link href={`/dashboard/consultations/courses/${course.id}`} className="mt-3">
          <p className="font-bold text-foreground hover:text-primary-700">{course.title}</p>
        </Link>
        {course.specialist && <p className="mt-0.5 text-sm text-muted">{course.specialist.fullName}</p>}

        <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" strokeWidth={2} />
            {formatArabicDate(course.startDate)} · {course.durationText}
          </span>
          {course.type === "in_person" ? (
            <>
              {course.wilaya && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" strokeWidth={2} />
                  {course.wilaya}
                </span>
              )}
              {course.capacity !== null && (
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5" strokeWidth={2} />
                  {Math.max(course.capacity - course.enrolledCount, 0)} مقعد متبقٍ من {course.capacity}
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <Video className="size-3.5" strokeWidth={2} />
              عن بُعد
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-bold text-foreground">{formatDzd(course.price)}</span>
          {alreadyEnrolled ? (
            <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
              <CheckCircle className="size-4" strokeWidth={2} />
              مسجّلة
            </span>
          ) : (
            <Button
              size="sm"
              disabled={isFull}
              loading={enroll.isPending && enroll.variables === course.id}
              onClick={() => enroll.mutate(course.id)}
            >
              {isFull ? "اكتملت السعة" : "سجّلي الآن"}
            </Button>
          )}
        </div>

        {enroll.isError && enroll.variables === course.id && !alreadyEnrolled && (
          <p className="mt-2 text-xs text-red-600">
            {enroll.error instanceof ApiError ? enroll.error.message : "تعذّر التسجيل في الدورة"}
          </p>
        )}
      </div>
    </Card>
  );
}
