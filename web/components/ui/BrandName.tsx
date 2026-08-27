"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const BRAND_NAME = "Materna Care";
const LETTER_STAGGER = 0.03;

/** اسم العلامة الجديد بخط مائل وتدرج وردي داكن، يدخل بأنيميشن أحرف متتابع مرة واحدة عند أول تحميل */
export function BrandName({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span
      dir="ltr"
      className={cn(
        "inline-flex bg-gradient-to-l from-primary-500 to-primary-800 bg-clip-text font-black italic text-transparent",
        className,
      )}
    >
      {shouldReduceMotion
        ? BRAND_NAME
        : BRAND_NAME.split("").map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * LETTER_STAGGER, ease: "easeOut" }}
            >
              {char === " " ? " " : char}
            </motion.span>
          ))}
    </span>
  );
}
