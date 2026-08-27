import { BookOpen, Scale, Headphones } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FeatureCard } from "@/components/dashboard/coming-soon/FeatureCard";
import { ComingSoonNotice } from "@/components/dashboard/coming-soon/ComingSoonNotice";
import { ReligiousBookIllustration } from "@/components/dashboard/illustrations/ReligiousBookIllustration";

const features = [
  {
    icon: BookOpen,
    title: "أذكار وأدعية خاصة",
    text: "مجموعة مختارة من الأذكار والأدعية المأثورة المناسبة لمراحل الحمل والمخاض والولادة.",
  },
  {
    icon: Scale,
    title: "فقه العبادات في الحمل والنفاس",
    text: "إجابات موثوقة عن أحكام الصلاة والصيام والطهارة خلال الحمل والنفاس، من مصادر شرعية معتمدة.",
  },
  {
    icon: Headphones,
    title: "محتوى مسموع ومقروء",
    text: "استمعي أو اقرئي بحسب ما يناسب وقتك وحالتك، بمحتوى موثوق المصدر ومراجَع دينيًا.",
  },
];

export function ReligiousContent() {
  return (
    <div>
      <section className="text-center">
        <ReligiousBookIllustration className="mx-auto size-32 sm:size-36" />
        <Badge tone="accent" className="mx-auto mt-6">
          طمأنينة روحية لرحلتك
        </Badge>
        <h1 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">
          المحتوى الديني
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          الجانب الروحي رفيق أساسي في رحلة الحمل والأمومة. نقدّم محتوى دينيًا
          موثوقًا يمنحك الطمأنينة ويجيب على تساؤلاتك الفقهية الشائعة خلال هذه
          المرحلة.
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-xl">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          ماذا نقدم
        </h2>
        <div className="mt-5 space-y-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-xl text-center">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          الفائدة
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          الطمأنينة الروحية جزء لا يتجزأ من الاستقرار النفسي خلال الحمل
          والولادة، خصوصًا مع كثرة الأسئلة الفقهية الشائعة التي تحتاج أمهات
          كثيرات إجابات واضحة وموثوقة عنها دون حرج أو تردد.
        </p>
      </section>

      <ComingSoonNotice actionLabel="المحتوى الديني الكامل" />
    </div>
  );
}
