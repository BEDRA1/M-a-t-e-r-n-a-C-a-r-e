"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Apple,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  GraduationCap,
  Heart,
  HeartHandshake,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { cn } from "@/lib/cn";
import { formatDzd } from "@/lib/format";
import { filterVisibleSpecialists, isTrackCode, specialistPhotoSrc, TRACKS, type TrackCode } from "@/lib/tracks";
import { useServicePricing } from "@/lib/hooks/useServicePricing";
import { useSpecialists } from "@/lib/hooks/useSpecialists";
import { ApiError } from "@/lib/api-client";

/** نقاط "لماذا التغذية مهمة" — نص ثابت خاص بمسار التغذية فقط، بلا حاجة لبيانات من الخادم */
const NUTRITION_WHY_POINTS: { icon: typeof Apple; text: string }[] = [
  { icon: Apple, text: "التغذية السليمة في الألف يوم الأولى تبني أساس صحة طفلك مدى الحياة" },
  { icon: HeartHandshake, text: "احتياجاتك الغذائية تتغيّر مع كل مرحلة من الحمل والرضاعة" },
  { icon: ShieldCheck, text: "برنامج مخصص يقلل مخاطر نقص الفيتامينات والمعادن الأساسية" },
];

function findPrice(
  pricing: { serviceKind: string; consultationType: string; price: number }[] | undefined,
  serviceKind: "consultation" | "course",
  consultationType: "in_person" | "remote",
) {
  return pricing?.find((p) => p.serviceKind === serviceKind && p.consultationType === consultationType)?.price;
}

export function TrackDetailContent({ trackParam }: { trackParam: string }) {
  if (!isTrackCode(trackParam)) {
    notFound();
  }

  return <TrackDetailInner track={trackParam} />;
}

function TrackDetailInner({ track: trackCode }: { track: TrackCode }) {
  const track = TRACKS[trackCode];
  const pricing = useServicePricing();
  const specialists = useSpecialists({ track: trackCode });
  const visibleSpecialists = filterVisibleSpecialists(trackCode, specialists.data ?? []);
  const Icon = track.icon;
  const isNutrition = trackCode === "nutrition";
  const isPsychological = trackCode === "psychological";
  const featuredSpecialist = visibleSpecialists[0];

  const inPersonConsultationPrice = findPrice(pricing.data, "consultation", "in_person");
  const remoteConsultationPrice = findPrice(pricing.data, "consultation", "remote");
  const inPersonCoursePrice = findPrice(pricing.data, "course", "in_person");
  const remoteCoursePrice = findPrice(pricing.data, "course", "remote");

  return (
    <div className="flex flex-col gap-8">
      {isNutrition ? (
        <section className="flex items-center gap-4 rounded-[var(--radius-card)] bg-gradient-to-l from-emerald-500 to-teal-600 p-6 text-white shadow-[var(--shadow-soft)]">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white">
            <Icon className="size-8" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{track.name}</h1>
            <p className="mt-1 text-sm font-semibold text-white/90">{track.specialistTitle}</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">{track.description}</p>
          </div>
        </section>
      ) : (
        <section className={cn("flex items-center gap-4 rounded-[var(--radius-card)] p-6", track.colors.bg)}>
          <span className={cn("flex size-16 shrink-0 items-center justify-center rounded-2xl text-white", track.colors.solid)}>
            <Icon className="size-8" strokeWidth={2} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{track.name}</h1>
            <p className={cn("mt-1 text-sm font-semibold", track.colors.text)}>{track.specialistTitle}</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{track.description}</p>
          </div>
        </section>
      )}

      {isNutrition && (
        <section>
          <h2 className="text-lg font-bold text-foreground">لماذا التغذية مهمة خلال الألف يوم؟</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NUTRITION_WHY_POINTS.map(({ icon: PointIcon, text }) => (
              <div
                key={text}
                className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-emerald-100 bg-emerald-50/50 p-5"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <PointIcon className="size-5" strokeWidth={2} />
                </span>
                <p className="text-sm leading-relaxed text-foreground/80">{text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className={cn("flex flex-col border-2", track.colors.border)}>
          <div className="flex items-center gap-2">
            <MessageCircleHeart className={cn("size-5", track.colors.text)} strokeWidth={2} />
            <h2 className="font-extrabold text-foreground">استشارة فردية</h2>
          </div>

          {pricing.isLoading ? (
            <Skeleton className="mt-3 h-8 w-40" />
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {remoteConsultationPrice !== undefined && (
                <span className={cn("rounded-full px-3 py-1.5 text-sm font-bold", track.colors.bg, track.colors.text)}>
                  عن بُعد: {formatDzd(remoteConsultationPrice)}
                </span>
              )}
              {inPersonConsultationPrice !== undefined && (
                <span className={cn("rounded-full px-3 py-1.5 text-sm font-bold", track.colors.bg, track.colors.text)}>
                  حضوري: {formatDzd(inPersonConsultationPrice)}
                </span>
              )}
            </div>
          )}

          <ul className="mt-4 flex flex-1 flex-col gap-2">
            {track.consultationIncludes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                <Check className={cn("mt-0.5 size-4 shrink-0", track.colors.text)} strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href={`/dashboard/consultations/book?track=${track.code}`}
            className={cn(
              "mt-5 flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-[background-color,transform] active:scale-[0.98]",
              track.colors.solid,
            )}
          >
            احجزي استشارة
          </Link>
        </Card>

        <Card className={cn("flex flex-col border-2", track.colors.border)}>
          <div className="flex items-center gap-2">
            <GraduationCap className={cn("size-5", track.colors.text)} strokeWidth={2} />
            <h2 className="font-extrabold text-foreground">دورة تكوينية</h2>
          </div>

          {pricing.isLoading ? (
            <Skeleton className="mt-3 h-8 w-40" />
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {remoteCoursePrice !== undefined && (
                <span className={cn("rounded-full px-3 py-1.5 text-sm font-bold", track.colors.bg, track.colors.text)}>
                  عن بُعد: {formatDzd(remoteCoursePrice)}
                </span>
              )}
              {inPersonCoursePrice !== undefined && (
                <span className={cn("rounded-full px-3 py-1.5 text-sm font-bold", track.colors.bg, track.colors.text)}>
                  حضوري: {formatDzd(inPersonCoursePrice)}
                </span>
              )}
            </div>
          )}

          <ul className="mt-4 flex flex-1 flex-col gap-2">
            {track.courseFeatures.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                <Check className={cn("mt-0.5 size-4 shrink-0", track.colors.text)} strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>

          <Link href={`/dashboard/consultations/courses?track=${track.code}`} className="mt-5">
            <Button variant="outline" className="w-full justify-center">
              <Calendar className="size-4" strokeWidth={2} />
              تصفّحي دورات هذا المسار
            </Button>
          </Link>
        </Card>
      </div>

      {isNutrition && (
        <section>
          <h2 className="text-lg font-bold text-foreground">ماذا تشمل جلسة التغذية؟</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {track.consultationIncludes.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4"
              >
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600" strokeWidth={2} />
                <p className="text-sm font-medium text-foreground/80">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {isNutrition && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card className="flex flex-col items-center justify-center gap-1 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 py-8 text-center">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Sparkles className="size-5" strokeWidth={2} />
            </span>
            {pricing.isLoading ? (
              <Skeleton className="mt-3 h-12 w-32" />
            ) : (
              <p className="mt-3 font-black text-5xl text-emerald-700">
                {remoteConsultationPrice !== undefined ? formatDzd(remoteConsultationPrice) : "—"}
              </p>
            )}
            <p className="text-sm font-medium text-muted">للجلسة الواحدة (عن بُعد)</p>
            <Link href={`/dashboard/consultations/book?track=${track.code}`} className="mt-4 w-full sm:max-w-[220px]">
              <Button
                variant="ghost"
                className="w-full rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 hover:brightness-105"
              >
                احجزي جلستك الآن
              </Button>
            </Link>
          </Card>

          {specialists.isLoading ? (
            <Skeleton className="h-full min-h-40 w-full rounded-[var(--radius-card)]" />
          ) : featuredSpecialist ? (
            <Card className="flex flex-col items-center gap-3 border-2 border-emerald-200 py-8 text-center">
              <span className="size-20 shrink-0 overflow-hidden rounded-full ring-4 ring-emerald-100">
                <ImageWithFallback
                  src={specialistPhotoSrc(featuredSpecialist)}
                  alt={featuredSpecialist.fullName}
                  icon={UserRound}
                  className="size-full"
                />
              </span>
              <div className="min-w-0 w-full max-w-full px-2">
                <p className="line-clamp-1 break-words font-extrabold text-foreground">{featuredSpecialist.fullName}</p>
                <p className="mt-0.5 line-clamp-1 break-words text-sm text-muted">
                  {featuredSpecialist.specialty}
                  {featuredSpecialist.yearsExperience ? ` · ${featuredSpecialist.yearsExperience} سنوات خبرة` : ""}
                </p>
              </div>
              <Link
                href={`/dashboard/consultations/book?track=${track.code}&specialistId=${featuredSpecialist.id}`}
                className="mt-1 w-full sm:max-w-[220px]"
              >
                <Button variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  احجزي معها الآن
                </Button>
              </Link>
            </Card>
          ) : null}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Users className="size-5 text-muted" strokeWidth={2} />
            {track.specialistTitlePlural} هذا المسار
          </h2>
          <Link
            href={`/dashboard/consultations/specialists?track=${track.code}`}
            className={cn("text-sm font-semibold hover:underline", track.colors.text)}
          >
            عرض الكل
          </Link>
        </div>

        <div className="mt-4">
          {specialists.isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : specialists.isError ? (
            <Alert tone="error">
              {specialists.error instanceof ApiError ? specialists.error.message : "تعذّر تحميل قائمة الأخصائيات"}
            </Alert>
          ) : visibleSpecialists.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 py-8 text-center text-muted">
              <Users className="size-8 text-primary-300" strokeWidth={1.5} />
              <p>لا يوجد أخصائيون معتمدون في هذا المسار حاليًا.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleSpecialists.map((specialist) => (
                <Link
                  key={specialist.id}
                  href={`/dashboard/consultations/specialists/${specialist.id}`}
                  className="flex w-full max-w-full items-center gap-3 overflow-hidden rounded-2xl border border-black/5 bg-surface p-4 transition-all hover:border-black/10 active:scale-[0.99]"
                >
                  <span className="size-12 shrink-0 overflow-hidden rounded-full">
                    <ImageWithFallback src={specialistPhotoSrc(specialist)} alt={specialist.fullName} icon={Users} className="size-full" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{specialist.fullName}</p>
                    <p className="truncate text-xs text-muted">{specialist.specialty}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {isPsychological && (
        <section>
          <h2 className="text-lg font-bold text-foreground">الاختبارات النفسية والتقييمات</h2>
          <p className="mt-1 text-sm text-muted">اختبارات معتمدة علمياً للكشف المبكر عن حالتكِ النفسية</p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex w-full max-w-full flex-col gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Brain className="size-5" strokeWidth={2} />
              </span>
              <div>
                <p className="font-bold text-foreground">مقياس القلق العام GAD-7</p>
                <p className="mt-1 break-words text-sm leading-relaxed text-muted">
                  يقيس مستوى القلق خلال الأسبوعين الماضيين — 7 أسئلة فقط
                </p>
                <p className="mt-2 text-xs font-semibold text-violet-700">المدة: 2-3 دقائق</p>
              </div>
              <Link href="/dashboard/assessments" className="mt-auto">
                <Button className="w-full">ابدئي الاختبار</Button>
              </Link>
            </div>

            <div className="flex w-full max-w-full flex-col gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                <Heart className="size-5" strokeWidth={2} />
              </span>
              <div>
                <p className="font-bold text-foreground">مقياس إدنبرة EPDS</p>
                <p className="mt-1 break-words text-sm leading-relaxed text-muted">
                  يكشف مبكراً عن اكتئاب ما بعد الولادة — 10 أسئلة
                </p>
                <p className="mt-2 text-xs font-semibold text-violet-700">المدة: 3-5 دقائق</p>
              </div>
              <Link href="/dashboard/assessments" className="mt-auto">
                <Button className="w-full">ابدئي الاختبار</Button>
              </Link>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-muted">
            هذه المقاييس للفحص الأولي فقط ولا تُغني عن الاستشارة المتخصصة
          </p>
        </section>
      )}
    </div>
  );
}
