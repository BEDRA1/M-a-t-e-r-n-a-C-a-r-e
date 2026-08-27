"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Apple, Baby, HeartPulse, Milk, Moon, Sparkles, HelpCircle, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFaqCategories } from "@/lib/hooks/useFaq";
import { fadeUp, staggerContainer } from "@/lib/motion";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  HeartPulse,
  Apple,
  Sparkles,
  Moon,
  Milk,
  Baby,
};

export function CategoryButtons({ onSelect }: { onSelect: (categoryId: string) => void }) {
  const categories = useFaqCategories();
  const shouldReduceMotion = useReducedMotion();

  if (categories.isLoading) {
    return (
      <div className="flex justify-end gap-2">
        <Skeleton className="h-24 w-full max-w-[75%] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <motion.div
        initial={shouldReduceMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainer(0.05)}
        className="grid max-w-[85%] grid-cols-2 gap-2 sm:max-w-[75%]"
      >
        {(categories.data ?? []).map((category) => {
          const Icon = CATEGORY_ICONS[category.iconName] ?? HelpCircle;
          return (
            <motion.button
              key={category.id}
              type="button"
              variants={shouldReduceMotion ? undefined : fadeUp(0, 10)}
              onClick={() => onSelect(category.id)}
              className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-doula-200 bg-surface px-3 py-4 text-center shadow-[var(--shadow-soft)] transition-colors active:scale-[0.98] hover:bg-doula-500"
            >
              <span className="flex size-10 items-center justify-center rounded-2xl bg-doula-50 text-doula-600 transition-colors group-hover:bg-white/20 group-hover:text-white">
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-white">
                {category.nameAr}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
