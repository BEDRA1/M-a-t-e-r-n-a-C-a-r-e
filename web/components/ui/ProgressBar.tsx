"use client";

import { motion, useReducedMotion } from "framer-motion";

export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="h-3 w-full rounded-full bg-primary-100 overflow-hidden"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full bg-gradient-to-l from-primary-400 to-primary-600"
        initial={{ width: shouldReduceMotion ? `${clamped}%` : "0%" }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
