"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fadeUp, staggerContainer } from "@/lib/motion";

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
        <div className="flex justify-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.15)}
            className="max-w-3xl text-center"
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

            <motion.p variants={fadeUp(0)} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              Materna Care تجمع لكِ حاسبة حمل دقيقة، متابعة أسبوعية لتطور
              الجنين، تذكيرات صحية، وربطًا مباشرًا بزوجك ليعيش معك كل خطوة — في مكان
              واحد سهل وآمن.
            </motion.p>

            <motion.div
              variants={fadeUp(0)}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
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
        </div>
      </div>
    </section>
  );
}
