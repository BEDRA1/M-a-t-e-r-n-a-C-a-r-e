"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, CheckCircle, MapPin, Sparkles, Users, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";
import {
  DateTimePicker,
  dateTimeValueToIso,
  formatTimeLabel,
  type DateTimePickerValue,
} from "@/components/shared/DateTimePicker";
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
import { useMySubscriptions } from "@/lib/hooks/useSubscriptions";
import { useSimulatedPayment, type BaridimobPaymentData, type CardPaymentData, type PaymentMethodKind } from "@/lib/hooks/useSimulatedPayment";
import { ApiError } from "@/lib/api-client";
import { courseCoverImage, TRACKS } from "@/lib/tracks";
import { preferredTimeStorageKey } from "@/lib/coursePreferredTime";
import type { Course } from "@/lib/types";

export function CourseCard({ course }: { course: Course }) {
  const enroll = useEnrollCourse();
  const mySubscriptions = useMySubscriptions();
  const simulatedPayment = useSimulatedPayment();
  const [showPayment, setShowPayment] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [preferredTime, setPreferredTime] = useState<DateTimePickerValue | null>(null);
  // السبب الجذري الحقيقي لشكوى "مسجّلة بالفعل ولم أسجل": الضغط الأول كان ينجح فعليًا (201)
  // لكن الزر لا يتغيّر إطلاقًا بعده — فيبدو للمستخدمة أن شيئًا لم يحدث، وضغطة ثانية طبيعية
  // تصطدم بـ409 الصحيح فعليًا لكنه يبدو خطأً كاذبًا بلا سياق. هذا التحقق من enrollments/mine
  // يغطي الحالتين معًا: تسجيل ناجح للتو في هذه الجلسة، أو تسجيل سابق من زيارة سابقة للقائمة
  const myEnrollments = useMyCourseEnrollments();
  const alreadyEnrolled =
    (enroll.isSuccess && enroll.variables === course.id) ||
    Boolean(myEnrollments.data?.some((e) => e.courseId === course.id));
  // دورة برصيد اشتراك نشط تُسجَّل مباشرة بلا دفع — نفس قاعدة صفحة تفاصيل الدورة تمامًا،
  // لا تكرارًا عشوائيًا للمنطق
  const hasCourseCredit = Boolean(
    mySubscriptions.data?.some((s) => s.status === "active" && s.courseCreditsRemaining > 0),
  );
  const seatsStatus =
    course.type === "in_person" && course.capacity !== null
      ? getSeatsStatus(course.capacity, course.enrolledCount)
      : null;
  const isFull = seatsStatus === "full";
  const track = course.specialist?.track;
  const trackColors = TRACKS[track ?? "psychological"].colors;

  const handlePaymentSubmit = async (kind: PaymentMethodKind, paymentData: CardPaymentData | BaridimobPaymentData) => {
    const approved = await simulatedPayment.submit(kind, paymentData);
    if (approved) enroll.mutate(course.id);
  };

  const startEnroll = () => setShowTimePicker(true);

  const confirmPreferredTime = (value: DateTimePickerValue) => {
    setPreferredTime(value);
    try {
      window.localStorage.setItem(
        preferredTimeStorageKey(course.id),
        JSON.stringify({ ...value, iso: dateTimeValueToIso(value) }),
      );
    } catch {
      // localStorage قد يكون غير متاح (وضع تصفح خاص) — التذكير المحلي غير حرج، يُتجاهَل بصمت
    }
    setShowTimePicker(false);
    if (hasCourseCredit) {
      enroll.mutate(course.id);
    } else {
      setShowPayment(true);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden !p-0">
      <div className="relative aspect-video w-full">
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
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Badge tone="neutral">{consultationTypeLabel(course.type)}</Badge>
          {seatsStatus && <Badge tone={seatsStatusBadgeTone(seatsStatus)}>{seatsStatusLabel(seatsStatus)}</Badge>}
        </div>

        <Link href={`/dashboard/consultations/courses/${course.id}`} className="mt-3">
          <p className="line-clamp-2 break-words font-bold text-foreground hover:text-primary-700">{course.title}</p>
        </Link>
        {course.specialist && (
          <p className="line-clamp-1 break-words text-sm text-muted">{course.specialist.fullName}</p>
        )}

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

        {alreadyEnrolled ? (
          <div className="mt-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-foreground">{formatDzd(course.price)}</span>
              <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                <CheckCircle className="size-4" strokeWidth={2} />
                مسجّلة
              </span>
            </div>
            {preferredTime && (
              <p className="text-end text-xs text-muted">
                وقتك المفضّل: {formatArabicDate(preferredTime.date)} — {formatTimeLabel(preferredTime.time)}
              </p>
            )}
          </div>
        ) : showTimePicker ? (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-xs font-semibold text-foreground">
              اختاري الوقت المفضّل لحضورك (تذكير شخصي — موعد الدورة الفعلي ثابت كما هو معروض أعلاه)
            </p>
            <DateTimePicker value={preferredTime} onChange={(value) => setPreferredTime(value)} />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="flex-1"
                disabled={!preferredTime}
                onClick={() => preferredTime && confirmPreferredTime(preferredTime)}
              >
                متابعة التسجيل
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowTimePicker(false)} className="flex-1">
                رجوع
              </Button>
            </div>
          </div>
        ) : showPayment ? (
          <div className="mt-4 flex flex-col gap-2">
            {preferredTime && (
              <p className="text-xs text-muted">
                وقتك المفضّل: {formatArabicDate(preferredTime.date)} — {formatTimeLabel(preferredTime.time)}
              </p>
            )}
            <PaymentMethodSelector
              amount={course.price}
              submitting={simulatedPayment.isPending || enroll.isPending}
              errorMessage={simulatedPayment.error}
              onSubmit={handlePaymentSubmit}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPayment(false)} className="self-start">
              رجوع
            </Button>
          </div>
        ) : (
          <>
            {hasCourseCredit && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary-50 px-3 py-2">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary-600" strokeWidth={2} />
                <p className="text-xs font-semibold text-primary-700">سيُخصَم رصيد دورة من اشتراكك — بلا دفع</p>
              </div>
            )}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="whitespace-nowrap font-bold text-foreground">{formatDzd(course.price)}</span>
              <Button
                size="sm"
                className="w-full sm:w-auto"
                disabled={isFull}
                loading={enroll.isPending && enroll.variables === course.id}
                onClick={startEnroll}
              >
                {isFull ? "اكتملت السعة" : "سجّلي الآن"}
              </Button>
            </div>
          </>
        )}

        {enroll.isError && enroll.variables === course.id && !alreadyEnrolled && (
          <p className="mt-2 text-xs text-red-600">
            {enroll.error instanceof ApiError ? enroll.error.message : "تعذّر التسجيل في الدورة"}
          </p>
        )}
      </div>
    </Card>
  );
}
