"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { scaleIn, viewportOnce } from "@/lib/motion";
import { LotusBloom } from "@/components/landing/illustrations/LotusBloom";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={scaleIn(0)}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-primary-500 to-accent-500 px-6 py-16 text-center sm:px-16 lg:py-20"
      >
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          ابدئي رحلتك مع Materna Care اليوم
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/90">
          حساب مجاني، بياناتك آمنة، ودعم كامل للغة العربية — كل ما تحتاجينه لمرافقة حملك بثقة.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/register">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full bg-white text-primary-700 shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-primary-50 active:scale-100"
            >
              إنشاء حساب مجاني
            </Button>
          </Link>
          <span className="flex size-14 items-center justify-center rounded-full bg-white/90 p-1.5 shadow-lg">
            <LotusBloom className="size-full" />
          </span>
        </div>
      </motion.div>
    </section>
  );
}
