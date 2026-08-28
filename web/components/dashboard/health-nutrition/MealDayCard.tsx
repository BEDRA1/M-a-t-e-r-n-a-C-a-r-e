"use client";

import { Minus, Moon, Plus, ShoppingBasket, UtensilsCrossed } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import type { WeeklyMeal } from "@/lib/types";
import { mealTypeLabel } from "@/lib/format";

const MEAL_TYPE_STYLES = {
  lunch: { header: "bg-emerald-50 text-emerald-700", icon: UtensilsCrossed },
  dinner: { header: "bg-blue-50 text-blue-700", icon: Moon },
} as const;

export function MealDayCard({
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
  const { header, icon: Icon } = MEAL_TYPE_STYLES[meal.mealType];
  // اسم الوجبة مُخزَّن كسلسلة "الطبق الرئيسي + مكوّن + مكوّن..." — نفصلها لعرض الطبق
  // الرئيسي عنوانًا بارزًا وبقية المكوّنات كقائمة نقطية، بدل سطر نص واحد متقطع
  const [mainDish, ...sides] = meal.name.split(/\s*\+\s*/).filter(Boolean);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <ImageWithFallback
        src={meal.imageUrl}
        alt={mainDish}
        icon={UtensilsCrossed}
        className="h-40 w-full"
        iconClassName="size-9"
      />

      <div className={`flex items-center gap-2 px-4 py-3 ${header}`}>
        <Icon className="size-4" strokeWidth={2} />
        <span className="text-sm font-bold">{mealTypeLabel(meal.mealType)}</span>
      </div>

      <div className="flex flex-col p-4">
        <p className="text-right text-base font-bold leading-snug text-foreground">{mainDish}</p>

        {sides.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1 text-right text-sm text-gray-600">
            {sides.map((side) => (
              <li key={side}>• {side}</li>
            ))}
          </ul>
        )}

        {quantity === 0 ? (
          <button
            type="button"
            onClick={onIncrement}
            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-600"
          >
            <ShoppingBasket className="size-4" strokeWidth={2} />
            أضيفي للسلة
          </button>
        ) : (
          <div className="mt-4 flex items-center justify-between rounded-full bg-primary-50 p-1">
            <button
              type="button"
              onClick={onDecrement}
              className="flex size-8 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-colors hover:bg-primary-100"
              aria-label="إنقاص الكمية"
            >
              <Minus className="size-3.5" strokeWidth={2.5} />
            </button>
            <span className="text-sm font-bold text-primary-700">{quantity} في السلة</span>
            <button
              type="button"
              onClick={onIncrement}
              className="flex size-8 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600"
              aria-label="زيادة الكمية"
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
