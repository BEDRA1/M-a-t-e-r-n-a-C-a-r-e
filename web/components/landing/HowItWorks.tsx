"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const steps = [
  {
    number: "١",
    title: "أنشئي حسابك",
    description: "سجّلي برقم هاتفك في أقل من دقيقة، واختاري دورك: أم أو زوج مرافق.",
  },
  {
    number: "٢",
    title: "احسبي عمر حملك",
    description: "أدخلي تاريخ آخر دورة أو نتيجة السونار، واحصلي فورًا على تاريخ ولادتك المتوقع.",
  },
  {
    number: "٣",
    title: "تابعي وشاركي",
    description: "سجّلي متابعتك الأسبوعية، فعّلي التذكيرات، وادعي زوجك للمتابعة معك.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-primary-50/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp(0)}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            كيف تعمل المنصة؟
          </h2>
          <p className="mt-4 text-muted">ثلاث خطوات بسيطة تفصلكِ عن رحلة أمومة أكثر تنظيمًا.</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.15, 0.1)}
          className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:gap-12"
        >
          {steps.map((step) => (
            <motion.div key={step.number} variants={fadeUp(0)} className="text-center">
              <motion.div
                whileHover={{ scale: 1.12, rotate: 6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mx-auto flex size-14 cursor-default items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-xl font-bold text-white"
              >
                {step.number}
              </motion.div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
