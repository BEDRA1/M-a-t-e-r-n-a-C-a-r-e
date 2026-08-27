"use client";

import { useState } from "react";
import { Calendar, CheckCircle, ExternalLink, MapPin, Sparkles, Users, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PageSpinner } from "@/components/ui/Spinner";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";
import { cn } from "@/lib/cn";
import {
  consultationTypeLabel,
  formatArabicDate,
  formatDzd,
  getSeatsStatus,
  seatsStatusBadgeTone,
  seatsStatusLabel,
} from "@/lib/format";
import { useCourse, useEnrollCourse } from "@/lib/hooks/useCourses";
import { useMySubscriptions } from "@/lib/hooks/useSubscriptions";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useSimulatedPayment, type BaridimobPaymentData, type CardPaymentData, type PaymentMethodKind } from "@/lib/hooks/useSimulatedPayment";
import { ApiError } from "@/lib/api-client";
import { courseCoverImage, TRACKS } from "@/lib/tracks";

export function CourseDetailContent({ courseId }: { courseId: string }) {
  const course = useCourse(courseId);
  const currentUser = useCurrentUser();
  const mySubscriptions = useMySubscriptions();
  const enroll = useEnrollCourse();
  const simulatedPayment = useSimulatedPayment();
  const [showPayment, setShowPayment] = useState(false);

  if (course.isLoading) {
    return <PageSpinner />;
  }

  if (course.isError || !course.data) {
    return (
      <Alert tone="error">
        {course.error instanceof ApiError ? course.error.message : "تعذّر تحميل بيانات هذه الدورة"}
      </Alert>
    );
  }

  const data = course.data;
  const seatsStatus =
    data.type === "in_person" && data.capacity !== null ? getSeatsStatus(data.capacity, data.enrolledCount) : null;
  const isFull = seatsStatus === "full";
  const track = data.specialist?.track;
  const trackColors = TRACKS[track ?? "psychological"].colors;

  const canEnroll = currentUser.data?.role === "mother" || currentUser.data?.role === "spouse";
  const hasCourseCredit = Boolean(
    mySubscriptions.data?.some((s) => s.status === "active" && s.courseCreditsRemaining > 0),
  );

  const handlePaymentSubmit = async (kind: PaymentMethodKind, paymentData: CardPaymentData | BaridimobPaymentData) => {
    const approved = await simulatedPayment.submit(kind, paymentData);
    if (approved) enroll.mutate(data.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden !p-0">
        <div className="relative aspect-video w-full sm:aspect-[21/9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={courseCoverImage(track)}
            alt={data.title}
            className="size-full rounded-t-xl object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
          <span
            className={cn(
              "absolute end-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm",
              trackColors.solid,
            )}
          >
            {TRACKS[track ?? "psychological"].name}
          </span>
        </div>

        <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Badge tone="neutral">{consultationTypeLabel(data.type)}</Badge>
          {seatsStatus && <Badge tone={seatsStatusBadgeTone(seatsStatus)}>{seatsStatusLabel(seatsStatus)}</Badge>}
        </div>

        <h1 className="mt-3 text-xl font-extrabold text-foreground sm:text-2xl">{data.title}</h1>
        {data.specialist && <p className="mt-1 text-sm text-muted">{data.specialist.fullName} · {data.specialist.specialty}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" strokeWidth={2} />
            {formatArabicDate(data.startDate)} · {data.durationText}
          </span>
          {data.type === "in_person" ? (
            <>
              {data.wilaya && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" strokeWidth={2} />
                  {data.wilaya}
                </span>
              )}
              {data.capacity !== null && (
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" strokeWidth={2} />
                  {Math.max(data.capacity - data.enrolledCount, 0)} مقعد متبقٍ من {data.capacity}
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <Video className="size-4" strokeWidth={2} />
              عن بُعد
            </span>
          )}
          <span className="font-bold text-foreground">{formatDzd(data.price)}</span>
        </div>

        <div className="mt-5 border-t border-black/5 pt-5">
          <h2 className="text-sm font-bold text-foreground">وصف الدورة</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{data.description}</p>
        </div>

        {canEnroll && (
          <div className="mt-6 border-t border-black/5 pt-5">
            {enroll.isSuccess ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-emerald-50 p-5 text-center">
                <CheckCircle className="size-8 text-emerald-600" strokeWidth={2} />
                <p className="font-bold text-foreground">تم تسجيلك في الدورة بنجاح</p>
                {data.type === "remote" && data.contentUrl && (
                  <a
                    href={data.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
                  >
                    <ExternalLink className="size-4" strokeWidth={2} />
                    الانتقال إلى محتوى الدورة
                  </a>
                )}
              </div>
            ) : (
              <>
                {enroll.isError && (
                  <div className="mb-3">
                    <Alert tone="error">
                      {enroll.error instanceof ApiError ? enroll.error.message : "تعذّر التسجيل في الدورة"}
                    </Alert>
                  </div>
                )}

                {isFull ? (
                  <>
                    <Button className="w-full sm:w-auto" disabled>
                      اكتملت السعة
                    </Button>
                    <p className="mt-2 text-sm text-red-600">
                      اكتملت مقاعد هذه الدورة، يرجى تصفّح دورات أخرى متاحة.
                    </p>
                  </>
                ) : hasCourseCredit ? (
                  <>
                    <div className="mb-3 flex items-start gap-2.5 rounded-xl bg-primary-50 px-4 py-3">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-primary-600" strokeWidth={2} />
                      <p className="text-sm font-semibold text-primary-700">
                        سيُخصَم رصيد دورة واحدة من اشتراكك — تسجيل مباشر بلا دفع
                      </p>
                    </div>
                    <Button className="w-full sm:w-auto" loading={enroll.isPending} onClick={() => enroll.mutate(data.id)}>
                      سجّلي في الدورة
                    </Button>
                  </>
                ) : showPayment ? (
                  <div className="flex flex-col gap-3">
                    <PaymentMethodSelector
                      amount={data.price}
                      submitting={simulatedPayment.isPending || enroll.isPending}
                      errorMessage={simulatedPayment.error}
                      onSubmit={handlePaymentSubmit}
                    />
                    <Button type="button" variant="ghost" onClick={() => setShowPayment(false)} className="self-start">
                      رجوع
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full sm:w-auto" onClick={() => setShowPayment(true)}>
                    سجّلي في الدورة
                  </Button>
                )}
              </>
            )}
          </div>
        )}
        </div>
      </Card>
    </div>
  );
}
