"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { dayOfWeekLabel } from "@/lib/format";
import type { WeeklyMeal } from "@/lib/types";
import { MealItemRow } from "./MealItemRow";

export function WeekMealsGrid({
  meals,
  cart,
  onIncrement,
  onDecrement,
}: {
  meals: WeeklyMeal[];
  cart: Record<string, number>;
  onIncrement: (meal: WeeklyMeal) => void;
  onDecrement: (mealId: string) => void;
}) {
  const byDay = new Map<number, WeeklyMeal[]>();
  for (const meal of meals) {
    const list = byDay.get(meal.dayOfWeek) ?? [];
    list.push(meal);
    byDay.set(meal.dayOfWeek, list);
  }

  const days = Array.from({ length: 7 }, (_, day) => day).filter((day) => byDay.has(day));

  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:pb-0 xl:grid-cols-3",
      )}
    >
      {days.map((day) => (
        <Card
          key={day}
          className="flex min-w-[85%] shrink-0 snap-start flex-col gap-3 sm:min-w-0 sm:shrink sm:snap-align-none"
        >
          <p className="font-bold text-foreground">{dayOfWeekLabel(day)}</p>
          <div className="flex flex-col gap-2.5">
            {byDay.get(day)!.map((meal) => (
              <MealItemRow
                key={meal.id}
                meal={meal}
                quantity={cart[meal.id] ?? 0}
                onIncrement={() => onIncrement(meal)}
                onDecrement={() => onDecrement(meal.id)}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
