"use client";

import type { LucideIcon } from "lucide-react";
import { ListChecks, CalendarCheck, ShieldCheck, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { HomeServicesIllustration } from "@/components/dashboard/illustrations/HomeServicesIllustration";
import { ServiceCatalogGrid } from "./ServiceCatalogGrid";
import { HealthyMealsSection } from "./HealthyMealsSection";
import { MyServiceBookingsSection } from "./MyServiceBookingsSection";

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ListChecks,
    title: "اختاري الخدمة",
    text: "خدمات تنظيف منزلي احترافية مصمَّمة لتناسب احتياجات الأم الحامل أو في فترة النفاس.",
  },
  {
    icon: CalendarCheck,
    title: "احجزي بالموعد المناسب",
    text: "حجز مرن بالتاريخ والوقت الذي يناسبك، دون التزامات معقدة أو انتظار طويل.",
  },
  {
    icon: ShieldCheck,
    title: "طاقم موثوق ومُتحقَّق منه",
    text: "كل فرد من طاقم الخدمة المنزلية يمر بعملية تحقق دقيقة قبل انضمامه، لراحة بالك وأمان منزلك.",
  },
  {
    icon: CreditCard,
    title: "ادفعي بسهولة وأمان",
    text: "طرق دفع متعددة وآمنة، بدون تعقيد، لتحصلي على المساعدة التي تحتاجينها دون عناء إضافي.",
  },
];

export function HomeServicesContent() {
  return (
    <div>
      <section className="grid items-center gap-8 md:grid-cols-[1.3fr_1fr] md:gap-10">
        <div>
          <Badge tone="accent">مساعدة موثوقة بالمنزل</Badge>
          <h1 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">
            الخدمات المنزلية
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            خلال الحمل المتقدم أو فترة التعافي بعد الولادة، قد تكون أبسط
            المهام المنزلية عبئًا إضافيًا. نوفّر لك مساعدة موثوقة تصل إلى
            بابك بسهولة.
          </p>
        </div>
        <HomeServicesIllustration className="mx-auto size-40 sm:size-48" />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          كيف تعمل الخدمة
        </h2>
        <ol className="mt-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            return (
              <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
                {!isLast && (
                  <span className="absolute top-11 bottom-0 start-5 w-px bg-primary-100" />
                )}
                <span className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-extrabold text-primary-700">
                  {index + 1}
                </span>
                <div className="pt-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4.5 text-primary-600" strokeWidth={2} />
                    <p className="font-bold text-foreground">{step.title}</p>
                  </div>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
                    {step.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          الفائدة
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          تخفيف العبء الجسدي عن الأم خلال الحمل المتقدم أو فترة التعافي بعد
          الولادة ليس رفاهية، بل ضرورة تساعدك على التركيز على راحتك وعلى
          طفلك، بدل استنزاف طاقتك في مهام يمكن أن يتولاها آخرون بثقة.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">الخدمات المتاحة</h2>
        <div className="mt-5">
          <ServiceCatalogGrid />
        </div>
      </section>

      <HealthyMealsSection />

      <MyServiceBookingsSection />
    </div>
  );
}
