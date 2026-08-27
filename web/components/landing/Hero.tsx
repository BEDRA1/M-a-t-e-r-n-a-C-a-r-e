"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Pill, Sprout } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/ui/BrandMark";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/motion";
import { MotherBabyGlow } from "@/components/landing/illustrations/MotherBabyGlow";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-24 -start-24 size-[28rem] rounded-full bg-primary-200/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-32 -end-32 size-[24rem] rounded-full bg-accent-200/40 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.15)}
            className="text-center lg:text-start"
          >
            <motion.span
              variants={fadeUp(0)}
              className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700"
            >
              <MapPin className="size-4" strokeWidth={2.25} />
              منصة جزائرية لمرافقة رحلة الأمومة
            </motion.span>

            <motion.h1
              variants={fadeUp(0)}
              className="mt-6 text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              سنرافقك خلال رحلة الألف يوم الأولى
              <span className="block bg-gradient-to-l from-primary-500 to-accent-500 bg-clip-text text-transparent">
                من بداية الحمل إلى غاية بلوغ الطفل سنتين
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp(0)}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted lg:mx-0"
            >
              Materna Care تجمع لكِ حاسبة حمل دقيقة، متابعة أسبوعية لتطور
              الجنين، تذكيرات صحية، وربطًا مباشرًا بزوجك ليعيش معك كل خطوة — في مكان
              واحد سهل وآمن.
            </motion.p>

            <motion.div
              variants={fadeUp(0)}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="transition-transform duration-200 hover:scale-105 hover:shadow-lg active:scale-100"
                >
                  ابدئي رحلتك مجانًا
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="transition-transform duration-200 hover:scale-105 active:scale-100"
                >
                  لديّ حساب بالفعل
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn(0.3)}
            className="relative mx-auto hidden w-full max-w-md lg:block"
          >
            <MotherBabyGlow className="pointer-events-none absolute -top-10 -end-10 size-28" />

            <div className="relative rounded-[2rem] border border-black/5 bg-surface p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">متابعة الحمل الأسبوعية</span>
                <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700">
                  مثال توضيحي
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-primary-700">الأسبوع ٢٤ + ٣ أيام</span>
                  <span className="text-muted">٦٠٪</span>
                </div>
                <div className="mt-2">
                  <ProgressBar percent={60} />
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-primary-50/70 p-4">
                <p className="text-xs font-medium text-primary-700">حجم الجنين تقريبًا</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
                  <Sprout className="size-4 text-primary-500" strokeWidth={2.25} />
                  بحجم كوز الذرة
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-accent-50/70 p-4">
                <Pill className="size-5 shrink-0 text-accent-600" strokeWidth={2.25} />
                <div>
                  <p className="text-sm font-medium text-foreground">تذكير: حمض الفوليك</p>
                  <p className="text-xs text-muted">اليوم الساعة ٨:٠٠ صباحًا</p>
                </div>
              </div>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={scaleIn(0.55)}
              className="absolute -bottom-6 -start-6 shadow-lg"
              aria-hidden
            >
              <BrandMark className="size-20 rounded-2xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
