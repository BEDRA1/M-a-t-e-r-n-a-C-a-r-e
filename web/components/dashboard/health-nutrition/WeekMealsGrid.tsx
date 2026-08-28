"use client";

import { useMemo, useState } from "react";
import { HorizontalScroller } from "@/components/ui/HorizontalScroller";
import { dayOfWeekLabel } from "@/lib/format";
import type { WeeklyMeal } from "@/lib/types";
import { MealDayCard } from "./MealDayCard";

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
  const byDay = useMemo(() => {
    const map = new Map<number, WeeklyMeal[]>();
    for (const meal of meals) {
      const list = map.get(meal.dayOfWeek) ?? [];
      list.push(meal);
      map.set(meal.dayOfWeek, list);
    }
    return map;
  }, [meals]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, day) => day).filter((day) => byDay.has(day)),
    [byDay],
  );

  const todayDayOfWeek = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(() =>
    days.includes(todayDayOfWeek) ? todayDayOfWeek : (days[0] ?? 0),
  );
  const activeDay = days.includes(selectedDay) ? selectedDay : (days[0] ?? 0);
  const dayMeals = byDay.get(activeDay) ?? [];

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-5">
      <HorizontalScroller>
        {days.map((day) => {
          const isActive = day === activeDay;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`shrink-0 snap-start rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                isActive ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {dayOfWeekLabel(day)}
            </button>
          );
        })}
      </HorizontalScroller>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {dayMeals.map((meal) => (
          <MealDayCard
            key={meal.id}
            meal={meal}
            quantity={cart[meal.id] ?? 0}
            onIncrement={() => onIncrement(meal)}
            onDecrement={() => onDecrement(meal.id)}
          />
        ))}
      </div>
    </div>
  );
}
