"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFaqCategoryEntries } from "@/lib/hooks/useFaq";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function QuestionButtons({
  categoryId,
  onSelect,
}: {
  categoryId: string;
  onSelect: (entryId: string, questionAr: string) => void;
}) {
  const entries = useFaqCategoryEntries(categoryId);
  const shouldReduceMotion = useReducedMotion();

  if (entries.isLoading) {
    return (
      <div className="flex justify-end gap-2">
        <Skeleton className="h-32 w-full max-w-[75%] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainer(0.05)}
        className="flex max-w-[85%] flex-col gap-2 sm:max-w-[75%]"
      >
        {(entries.data ?? []).map((entry) => (
          <motion.button
            key={entry.id}
            type="button"
            variants={shouldReduceMotion ? undefined : fadeUp(0, 10)}
            onClick={() => onSelect(entry.id, entry.questionAr)}
            className="rounded-2xl border-2 border-doula-200 bg-surface px-4 py-3 text-start text-sm font-medium text-foreground shadow-[var(--shadow-soft)] transition-colors active:scale-[0.98] hover:border-doula-500 hover:bg-doula-500 hover:text-white"
          >
            {entry.questionAr}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
