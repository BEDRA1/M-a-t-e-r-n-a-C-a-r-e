"use client";

import { CalendarDays, Leaf, Stethoscope, Truck, HeartPulse } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FeatureCard } from "@/components/dashboard/coming-soon/FeatureCard";
import { NutritionPlateIllustration } from "@/components/dashboard/illustrations/NutritionPlateIllustration";
import { MyMealOrdersSection } from "./MyMealOrdersSection";

const features = [
  {
    icon: CalendarDays,
    title: "قوائم وجبات أسبوعية متوازنة",
    text: "خطة غداء وعشاء لكل أسبوع، مصمَّمة بإشراف أخصائية تغذية متخصصة في تغذية الحمل والرضاعة.",
  },
  {
    icon: Leaf,
    title: "مكونات طازجة وطبيعية",
    text: "وجبات مصنوعة من مكونات طازجة ومتوازنة غذائيًا، بدون مواد حافظة أو إضافات غير ضرورية.",
  },
  {
    icon: Stethoscope,
    title: "تخصيص حسب حالتك الصحية",
    text: "إمكانية تعديل الوجبات لتناسب حالات خاصة مثل سكري الحمل أو ارتفاع ضغط الدم، بمتابعة مختصة.",
  },
  {
    icon: Truck,
    title: "توصيل يومي لباب المنزل",
    text: "وجباتك تصلك طازجة كل يوم دون الحاجة للتسوق أو التحضير، في فترة تحتاجين فيها كل طاقتك لنفسك ولطفلك.",
  },
];

export function HealthNutritionContent() {
  return (
    <div>
      <section className="grid items-center gap-8 md:grid-cols-[1fr_1.3fr] md:gap-10">
        <NutritionPlateIllustration className="mx-auto size-40 sm:size-48" />
        <div>
          <Badge tone="primary">تغذية لكل مرحلة</Badge>
          <h1 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">
            الصحة والتغذية
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            ما تأكلينه خلال الحمل والرضاعة والنفاس يؤثر مباشرة عليك وعلى
            طفلك. نقدّم تغذية مدروسة تناسب كل مرحلة من رحلتك، دون أن تحتاجي
            للتخطيط بنفسك.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          ماذا نقدم
        </h2>
        <div className="mt-5 divide-y divide-black/5 rounded-[var(--radius-card)] border border-black/5 bg-surface shadow-[var(--shadow-soft)]">
          {features.map((feature) => (
            <div key={feature.title} className="p-5">
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 flex items-start gap-3.5 rounded-2xl bg-accent-50/60 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
          <HeartPulse className="size-5" strokeWidth={2} />
        </span>
        <div>
          <p className="font-bold text-foreground">الفائدة</p>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            التغذية السليمة ليست رفاهية في هذه المرحلة، بل عنصر أساسي في
            صحتك وصحة جنينك أو رضيعك. توفير وقت وجهد التخطيط اليومي للوجبات،
            في فترة مرهقة أصلًا، يمنحك مساحة أكبر للراحة والتركيز على ما يهم
            فعلًا.
          </p>
        </div>
      </section>

      <MyMealOrdersSection />
    </div>
  );
}
