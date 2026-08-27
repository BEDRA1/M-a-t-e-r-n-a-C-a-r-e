import { Droplet, Baby as BabyIcon, BadgeCheck, Tag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FeatureCard } from "@/components/dashboard/coming-soon/FeatureCard";
import { StoreBagIllustration } from "@/components/dashboard/illustrations/StoreBagIllustration";
import { ProductCatalogSection } from "./ProductCatalogSection";
import { MyProductOrdersSection } from "./MyProductOrdersSection";

const categories = [
  {
    icon: Droplet,
    title: "عناية الأم",
    text: "منتجات مخصصة لمرحلتي الحمل والنفاس: العناية بالبشرة، الدعم الجسدي، وأساسيات الراحة اليومية.",
  },
  {
    icon: BabyIcon,
    title: "مستلزمات الطفل",
    text: "من الحفاضات إلى أدوات الرضاعة والملابس الأساسية، كل ما يحتاجه طفلك في بداياته الأولى.",
  },
  {
    icon: BadgeCheck,
    title: "اختيار ومراجعة متخصصة",
    text: "كل منتج يمر بمراجعة فريقنا المتخصص قبل إضافته، لضمان جودته وملاءمته الفعلية لاحتياجاتك.",
  },
  {
    icon: Tag,
    title: "أسعار تناسب السوق الجزائري",
    text: "منتجات بأسعار مدروسة ومناسبة، بعيدًا عن المبالغة أو الوسطاء غير الضروريين.",
  },
];

export function StoreContent() {
  return (
    <div>
      <section className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-start">
        <StoreBagIllustration className="size-32 shrink-0 sm:size-36" />
        <div>
          <Badge tone="primary" className="mx-auto sm:mx-0">
            منتجات مختارة بعناية
          </Badge>
          <h1 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">
            المتجر
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            من مستلزمات الحمل إلى احتياجات الرضاعة والعناية اليومية، نجمع لكِ
            ولطفلك منتجات مختارة بعناية في مكان واحد موثوق.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          ماذا نقدم
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <Card key={category.title}>
              <FeatureCard {...category} />
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10 text-center">
        <div className="mx-auto h-px w-16 bg-primary-100" />
        <h2 className="mt-6 text-lg font-bold text-foreground sm:text-xl">
          الفائدة
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          بدل التنقل بين متاجر متعددة أو البحث المشتت على الإنترنت، تحصلين
          على مصدر واحد موثوق لمنتجات رُوجعت فعليًا لتناسب احتياجاتك
          واحتياجات طفلك في كل مرحلة.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">تصفّحي المنتجات</h2>
        <div className="mt-5">
          <ProductCatalogSection />
        </div>
      </section>

      <MyProductOrdersSection />
    </div>
  );
}
