"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { TRACK_LIST } from "@/lib/tracks";
import { cn } from "@/lib/cn";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function TrackChooserContent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">الاستشارات</h1>
        <p className="mt-1 text-sm text-muted">اختاري نوع المرافقة التي تناسب احتياجك الآن.</p>
      </div>

      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainer(0.08)}
        className="grid grid-cols-1 gap-5 sm:grid-cols-3"
      >
        {TRACK_LIST.map((track) => {
          const Icon = track.icon;
          return (
            <motion.div key={track.code} variants={shouldReduceMotion ? undefined : fadeUp(0, 16)}>
              <Link
                href={`/dashboard/consultations/${track.code}`}
                className={cn(
                  "flex min-h-28 flex-col gap-4 rounded-[var(--radius-card)] border-2 bg-surface p-6 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]",
                  track.colors.border,
                )}
              >
                <span
                  className={cn(
                    "flex size-14 items-center justify-center rounded-2xl text-white",
                    track.colors.solid,
                  )}
                >
                  <Icon className="size-7" strokeWidth={2} />
                </span>

                <div>
                  <p className="font-extrabold text-foreground">{track.name}</p>
                  <p className={cn("mt-0.5 text-sm font-semibold", track.colors.text)}>{track.specialistTitle}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{track.description}</p>
                </div>

                <span className={cn("mt-auto flex items-center gap-1 text-sm font-semibold", track.colors.text)}>
                  استكشفي هذا المسار
                  <ChevronLeft className="size-4" strokeWidth={2.5} />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
