"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { MobileHomeHeader } from "./MobileHomeHeader";
import { WelcomeBanner } from "./WelcomeBanner";
import { ThousandDaysJourneyBar } from "./ThousandDaysJourneyBar";
import { ServiceGridTile, type ServiceGridItem } from "./ServiceGridTile";
import { HomeDoulaCard } from "./HomeDoulaCard";
import { UrgentHelpCard } from "./UrgentHelpCard";

// صور محلية حقيقية من public/services/ — الامتداد الفعلي لكل ملف مختلف (تحققتُ منه مباشرة
// بعد إعادة التسمية: psychology.png/subscriptions.png، mood.webp، والباقي .jpg).
// ترتيب المصفوفة = ترتيب DOM = الترتيب المرئي من اليمين لليسار تحت RTL (العنصر الأول يظهر
// أقصى اليمين) — مطابق للترتيب المطلوب: نفسية/صحية/غذائية/منزلية ثم مزاج/طفل/متجر/اشتراكات
const SERVICE_GRID: ServiceGridItem[] = [
  { href: "/dashboard/consultations/psychological", image: "/services/psychology.png", title: "المرافقة النفسية" },
  { href: "/dashboard/consultations/health", image: "/services/health.jpg", title: "المرافقة الصحية" },
  { href: "/dashboard/consultations/nutrition", image: "/services/nutrition.jpg", title: "المرافقة الغذائية" },
  { href: "/dashboard/home-services", image: "/services/home.jpg", title: "الخدمات المنزلية" },
  { href: "/dashboard/mood", image: "/services/mood.webp", title: "تتبع المزاج" },
  { href: "/dashboard/baby", image: "/services/baby.jpg", title: "ملف الطفل" },
  { href: "/dashboard/store", image: "/services/store.jpg", title: "المتجر الإلكتروني" },
  { href: "/dashboard/subscriptions", image: "/services/subscriptions.png", title: "الخدمات الإضافية" },
];

export function MobileHomeContent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <MobileHomeHeader />

      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        variants={fadeUp(0, 16)}
      >
        <WelcomeBanner />
      </motion.div>

      {/* لا توجد "بطاقة مزاج" مستقلة فعليًا في هذه الصفحة (تتبع المزاج مجرد بلاطة واحدة ضمن
          شبكة "خدماتنا" أدناه) — أقرب موضع مطابق لروح الطلب ("بعد بطاقة تعريفية وقبل شبكة
          الخدمات") هو مباشرة بعد WelcomeBanner، فوُضع الشريط هنا */}
      <ThousandDaysJourneyBar />

      <h2 className="mx-4 mb-3 mt-6 font-bold text-foreground">خدماتنا</h2>
      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainer(0.04, 0.1)}
        className="mx-4 grid grid-cols-4 gap-3"
      >
        {SERVICE_GRID.map((item) => (
          <motion.div key={item.href} variants={shouldReduceMotion ? undefined : fadeUp(0, 10)}>
            <ServiceGridTile {...item} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        <HomeDoulaCard />
        <UrgentHelpCard />
      </div>
    </div>
  );
}
