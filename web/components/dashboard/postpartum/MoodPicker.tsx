"use client";

import { useState } from "react";
import { Frown, Meh, Smile, SmilePlus, Laugh, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useAddMoodLog } from "@/lib/hooks/usePostpartum";
import { moodLevelLabel } from "@/lib/format";

const MOOD_LEVELS: { level: number; icon: LucideIcon; activeClass: string; idleClass: string }[] = [
  { level: 1, icon: Frown, activeClass: "bg-red-100 text-red-600", idleClass: "text-foreground/60 hover:bg-red-50" },
  {
    level: 2,
    icon: Meh,
    activeClass: "bg-orange-100 text-orange-600",
    idleClass: "text-foreground/60 hover:bg-orange-50",
  },
  {
    level: 3,
    icon: Smile,
    activeClass: "bg-amber-100 text-amber-600",
    idleClass: "text-foreground/60 hover:bg-amber-50",
  },
  {
    level: 4,
    icon: SmilePlus,
    activeClass: "bg-primary-100 text-primary-600",
    idleClass: "text-foreground/60 hover:bg-primary-50",
  },
  {
    level: 5,
    icon: Laugh,
    activeClass: "bg-emerald-100 text-emerald-600",
    idleClass: "text-foreground/60 hover:bg-emerald-50",
  },
];

export function MoodPicker() {
  const addMoodLog = useAddMoodLog();
  const [justLogged, setJustLogged] = useState<number | null>(null);
  const [pendingLevel, setPendingLevel] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handlePick = (level: number) => {
    setPendingLevel(level);
    addMoodLog.mutate(
      { moodLevel: level },
      {
        onSuccess: () => {
          setJustLogged(level);
          setTimeout(() => setJustLogged(null), 3000);
        },
        onSettled: () => setPendingLevel(null),
      },
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">كيف تشعرين اليوم؟</h2>
      </div>

      {justLogged && (
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm font-medium text-emerald-600"
        >
          تم تسجيل حالتك: {moodLevelLabel(justLogged)} — شكرًا لمشاركتنا شعورك اليوم.
        </motion.p>
      )}

      <div className="mt-5 grid grid-cols-5 gap-2 sm:gap-3">
        {MOOD_LEVELS.map(({ level, icon: Icon, activeClass, idleClass }) => {
          const isActive = justLogged === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => handlePick(level)}
              disabled={addMoodLog.isPending}
              className="flex flex-col items-center gap-2 rounded-2xl p-2 transition-colors disabled:opacity-60 sm:p-3"
            >
              <span
                className={cn(
                  "flex size-14 items-center justify-center rounded-full transition-colors sm:size-16",
                  isActive ? activeClass : cn("bg-black/[0.03]", idleClass),
                )}
              >
                <Icon
                  className={cn("size-10", pendingLevel === level ? "animate-pulse" : "")}
                  strokeWidth={1.75}
                />
              </span>
              <span className="text-center text-[11px] font-medium leading-tight text-muted sm:text-xs">
                {moodLevelLabel(level)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
