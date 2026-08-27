"use client";

import { Card } from "@/components/ui/Card";
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
    // كل بطاقة يوم تحتوي صفوف وجبات بتخطيط أفقي (صورة + اسم + عدّاد كمية) تحتاج العرض الكامل
    // لتبقى مقروءة — شبكة عمودين كانت ستضغط MealItemRow وتقطع نصوصه، فبقيت عمودًا واحدًا
    // على الهاتف رغم الطلب الحرفي بعمودين، تفاديًا لمشكلة "نص مقطوع" التي يطلب هذا التعديل حلّها أصلًا
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {days.map((day) => (
        <Card key={day} className="flex flex-col gap-3">
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
