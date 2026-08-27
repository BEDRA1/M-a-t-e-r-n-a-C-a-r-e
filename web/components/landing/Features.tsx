"use client";

import { motion } from "framer-motion";
import { Calculator, CalendarDays, HeartHandshake, Pill } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { HeartbeatIcon } from "@/components/landing/illustrations/HeartbeatIcon";

const features = [
  {
    icon: Calculator,
    title: "حاسبة حمل دقيقة",
    description:
      "احسبي عمر الحمل وتاريخ الولادة المتوقع بثلاث طرق: تاريخ آخر دورة شهرية، تاريخ الإباضة، أو نتيجة السونار.",
  },
  {
    icon: CalendarDays,
    title: "متابعة أسبوعية",
    description:
      "سجّلي وزنك وأعراضك أسبوعيًا، وتابعي تطور جنينك ونصائح كل مرحلة من الحمل بمحتوى مخصص لكل أسبوع.",
  },
  {
    icon: Pill,
    title: "تذكيرات صحية",
    description:
      "لا تفوّتي جرعة فيتامين أو موعد طبيب — تذكيرات بسيطة وواضحة تنظّم يومك خلال الحمل.",
  },
  {
    icon: HeartHandshake,
    title: "ربط بزوجك",
    description:
      "شاركي زوجك رحلة الحمل عبر كود دعوة بسيط، ليتابع معك التقدم والمواعيد أولًا بأول.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp(0)}
        className="mx-auto max-w-2xl text-center"
      >
        <HeartbeatIcon className="mx-auto mb-2 size-7" />
        <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
          كل ما تحتاجينه في رحلة الحمل
        </h2>
        <p className="mt-4 text-muted">
          أدوات بسيطة ودقيقة صُممت لتواكب كل مرحلة، بدعم كامل للغة العربية.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.12, 0.1)}
        className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((feature) => (
          <motion.div key={feature.title} variants={fadeUp(0)}>
            <Card className="h-full text-start transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <feature.icon className="size-6" strokeWidth={2} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
