"use client";

import { FileText, Syringe, Moon, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FeatureCard } from "@/components/dashboard/coming-soon/FeatureCard";
import { BabyGrowthIllustration } from "@/components/dashboard/illustrations/BabyGrowthIllustration";
import { AddBabyForm } from "./AddBabyForm";

const features = [
  {
    icon: FileText,
    title: "سجل بيانات الطفل",
    text: "وزن وطول طفلك عند الولادة، مع تسجيل قياسات دورية لمتابعة منحنى نموه مقارنة بالمعدلات الطبيعية لعمره.",
  },
  {
    icon: Syringe,
    title: "تذكيرات الفحوصات واللقاحات",
    text: "تنبيهات تلقائية بمواعيد الفحوصات الدورية وجدول التطعيمات الرسمي، حتى لا يفوتك موعد مهم وسط انشغالك.",
  },
  {
    icon: Moon,
    title: "متابعة أنماط النوم",
    text: "سجّلي أوقات نوم طفلك واستيقاظه وقيلولاته اليومية، لتفهمي إيقاعه الطبيعي وتتوقعي احتياجاته بشكل أفضل.",
  },
  {
    icon: BarChart3,
    title: "إحصائيات أسبوعية وشهرية",
    text: "ملخصات دورية سهلة القراءة عن نوم طفلك ونموه، تساعدك على ملاحظة الأنماط والتطورات مع الوقت.",
  },
];

export function BabyEmptyState() {
  return (
    <div>
      <section className="text-center">
        <Badge tone="accent" className="mx-auto">
          من الولادة حتى عامين
        </Badge>
        <h1 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">
          طفلي
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          من لحظة ولادته وحتى بلوغه عامين، يمر طفلك بمراحل نمو سريعة ومهمة.
          أنشئي له ملفًا واحدًا يجمع كل ما تحتاجين معرفته ومتابعته.
        </p>
        <BabyGrowthIllustration className="mx-auto mt-6 size-40 sm:size-44" />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          ماذا نقدم
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <FeatureCard {...feature} />
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="rounded-[var(--radius-card)] border border-primary-100 bg-primary-50/50 p-6 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            الفائدة
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            تنظيم مواعيد الفحوصات ومتابعة نوم الطفل من أكثر ما يُشغل بال كل
            أم جديدة، والنسيان في هذه المرحلة المرهقة وارد جدًا. سجل منظم
            وتذكيرات تلقائية يخفّفان هذا العبء الذهني، ويمنحانك ثقة أكبر في
            متابعة صحة طفلك يومًا بعد يوم.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <Card>
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            أضيفي طفلك
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            ابدئي بإضافة بيانات طفلك الأساسية لفتح ملفه ومتابعة فحوصاته.
          </p>
          <div className="mt-5">
            <AddBabyForm />
          </div>
        </Card>
      </section>
    </div>
  );
}
