"use client";

import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { mealTypeLabel } from "@/lib/format";
import type { WeeklyMeal } from "@/lib/types";

export function MealItemRow({
  meal,
  quantity,
  onIncrement,
  onDecrement,
}: {
  meal: WeeklyMeal;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/5 p-3">
      <div className="size-14 shrink-0 overflow-hidden rounded-lg">
        <ImageWithFallback src={meal.imageUrl} alt={meal.name} icon={UtensilsCrossed} className="size-full" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-primary-600">{mealTypeLabel(meal.mealType)}</p>
        <p className="truncate text-sm font-bold text-foreground">{meal.name}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          disabled={quantity === 0}
          className="flex size-11 items-center justify-center rounded-full border border-black/10 text-foreground transition-colors hover:bg-primary-50 disabled:opacity-40"
          aria-label="إنقاص الكمية"
        >
          <Minus className="size-3.5" strokeWidth={2.5} />
        </button>
        <span className="w-4 text-center text-sm font-bold text-foreground">{quantity}</span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex size-11 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600"
          aria-label="زيادة الكمية"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
