"use client";

import { motion } from "framer-motion";
import { viewportOnce } from "@/lib/motion";

const PETAL_COUNT = 5;

/**
 * بديل عن رسمة Lottie "لوتس يتفتح" — بتلات SVG بسيطة (خمس بيضاويات) تتوزع
 * شعاعيًا حول المركز وتتفتح بحركة scale متتابعة عند الدخول إلى نطاق الرؤية.
 */
export function LotusBloom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="زهرة لوتس تتفتح">
      <defs>
        <linearGradient id="petalGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary-300)" />
          <stop offset="100%" stopColor="var(--color-accent-300)" />
        </linearGradient>
      </defs>
      <g transform="translate(50,58)">
        {Array.from({ length: PETAL_COUNT }).map((_, i) => (
          <motion.ellipse
            key={i}
            cx={0}
            cy={-16}
            rx={9}
            ry={19}
            fill="url(#petalGradient)"
            opacity={0.92}
            transform={`rotate(${(360 / PETAL_COUNT) * i})`}
            style={{ transformOrigin: "0px 0px" }}
            initial={{ scale: 0.25, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.92 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
          />
        ))}
        <motion.circle
          cx={0}
          cy={0}
          r={6}
          fill="var(--color-primary-500)"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.4, delay: PETAL_COUNT * 0.12, ease: "easeOut" }}
        />
      </g>
    </svg>
  );
}
