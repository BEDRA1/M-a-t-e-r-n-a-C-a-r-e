"use client";

import { useState } from "react";
import { CalendarOff, ShoppingBasket } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { formatDzd } from "@/lib/format";
import { useCurrentWeekMeals } from "@/lib/hooks/useNutrition";
import { ApiError } from "@/lib/api-client";
import type { WeeklyMeal } from "@/lib/types";
import { WeekMealsGrid } from "@/components/dashboard/health-nutrition/WeekMealsGrid";
import { MealCartPanel } from "@/components/dashboard/health-nutrition/MealCartPanel";

/** قسم "الأكل الصحي" — نُقل هنا من صفحة health-nutrition بطلب صريح ليكون الطلب مباشرة من
 * صفحة الخدمات المنزلية بدل بطاقة خدمة بوصف نصي ثابت + نموذج حجز عام. نفس التصميم والمنطق
 * بالضبط (تبويبات أيام + بطاقات وجبات + سلة)، فقط نُقل المكوّن من ملفه دون تكرار الكود */
export function HealthyMealsSection() {
  const weeklyMeals = useCurrentWeekMeals();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartSheetOpen, setCartSheetOpen] = useState(false);

  const handleIncrement = (meal: WeeklyMeal) => {
    setCart((prev) => ({ ...prev, [meal.id]: (prev[meal.id] ?? 0) + 1 }));
  };

  const handleDecrement = (mealId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[mealId] ?? 0;
      if (current <= 1) {
        delete next[mealId];
      } else {
        next[mealId] = current - 1;
      }
      return next;
    });
  };

  const handleClear = () => setCart({});

  const mealsById = new Map((weeklyMeals.data ?? []).map((meal) => [meal.id, meal]));
  const cartItemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = Object.entries(cart).reduce(
    (sum, [mealId, quantity]) => sum + (mealsById.get(mealId)?.price ?? 0) * quantity,
    0,
  );

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-foreground sm:text-xl">الأكل الصحي — قائمة وجبات هذا الأسبوع</h2>
      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
        اختاري وجباتك من قائمة هذا الأسبوع واطلبيها مباشرة، طازجة وصحية إلى بابك.
      </p>

      <div className="mt-5">
        {weeklyMeals.isLoading ? (
          <div className="flex flex-col gap-5">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : weeklyMeals.isError ? (
          <Alert tone="error">
            {weeklyMeals.error instanceof ApiError ? weeklyMeals.error.message : "تعذّر تحميل قائمة الوجبات"}
          </Alert>
        ) : !weeklyMeals.data || weeklyMeals.data.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
            <CalendarOff className="size-8 text-primary-300" strokeWidth={1.5} />
            <p>لم تُنشر قائمة وجبات لهذا الأسبوع بعد.</p>
          </Card>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
            <WeekMealsGrid
              meals={weeklyMeals.data}
              cart={cart}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
            {/* الديسكتوب: السلة الجانبية الثابتة كما هي دون تغيير */}
            <div className="hidden lg:block">
              <MealCartPanel meals={weeklyMeals.data} cart={cart} onDecrement={handleDecrement} onClear={handleClear} />
            </div>
          </div>
        )}
      </div>

      {/* الهاتف والتابلت: زر عائم يفتح السلة كـBottomSheet بدل تكديسها أسفل الشبكة —
          spacer بنفس ارتفاع الزر يمنع تغطيته لآخر بطاقة عند التمرير للأسفل */}
      {cartItemCount > 0 && (
        <>
          <div className="h-20 lg:hidden" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setCartSheetOpen(true)}
            className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-between gap-3 rounded-2xl bg-primary-500 px-5 py-4 text-white shadow-lg shadow-primary-500/30 md:bottom-6 lg:hidden"
          >
            <span className="flex items-center gap-2 font-bold">
              <ShoppingBasket className="size-5" strokeWidth={2} />
              عرض السلة ({cartItemCount})
            </span>
            <span className="font-extrabold">{formatDzd(cartTotal)}</span>
          </button>
        </>
      )}

      <BottomSheet open={cartSheetOpen} onClose={() => setCartSheetOpen(false)}>
        <MealCartPanel
          meals={weeklyMeals.data ?? []}
          cart={cart}
          onDecrement={handleDecrement}
          onClear={handleClear}
          variant="sheet"
        />
      </BottomSheet>
    </section>
  );
}
