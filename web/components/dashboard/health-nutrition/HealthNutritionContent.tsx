"use client";

import { useState } from "react";
import { CalendarDays, Leaf, Stethoscope, Truck, HeartPulse, CalendarOff, ShoppingBasket } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { FeatureCard } from "@/components/dashboard/coming-soon/FeatureCard";
import { NutritionPlateIllustration } from "@/components/dashboard/illustrations/NutritionPlateIllustration";
import { formatDzd } from "@/lib/format";
import { useCurrentWeekMeals } from "@/lib/hooks/useNutrition";
import { ApiError } from "@/lib/api-client";
import type { WeeklyMeal } from "@/lib/types";
import { WeekMealsGrid } from "./WeekMealsGrid";
import { MealCartPanel } from "./MealCartPanel";
import { MyMealOrdersSection } from "./MyMealOrdersSection";

const features = [
  {
    icon: CalendarDays,
    title: "قوائم وجبات أسبوعية متوازنة",
    text: "خطة غداء وعشاء لكل أسبوع، مصمَّمة بإشراف أخصائية تغذية متخصصة في تغذية الحمل والرضاعة.",
  },
  {
    icon: Leaf,
    title: "مكونات طازجة وطبيعية",
    text: "وجبات مصنوعة من مكونات طازجة ومتوازنة غذائيًا، بدون مواد حافظة أو إضافات غير ضرورية.",
  },
  {
    icon: Stethoscope,
    title: "تخصيص حسب حالتك الصحية",
    text: "إمكانية تعديل الوجبات لتناسب حالات خاصة مثل سكري الحمل أو ارتفاع ضغط الدم، بمتابعة مختصة.",
  },
  {
    icon: Truck,
    title: "توصيل يومي لباب المنزل",
    text: "وجباتك تصلك طازجة كل يوم دون الحاجة للتسوق أو التحضير، في فترة تحتاجين فيها كل طاقتك لنفسك ولطفلك.",
  },
];

function WeeklyMealsSection() {
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
      <h2 className="text-lg font-bold text-foreground sm:text-xl">قائمة وجبات هذا الأسبوع</h2>

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
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
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

export function HealthNutritionContent() {
  return (
    <div>
      <section className="grid items-center gap-8 md:grid-cols-[1fr_1.3fr] md:gap-10">
        <NutritionPlateIllustration className="mx-auto size-40 sm:size-48" />
        <div>
          <Badge tone="primary">تغذية لكل مرحلة</Badge>
          <h1 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">
            الصحة والتغذية
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            ما تأكلينه خلال الحمل والرضاعة والنفاس يؤثر مباشرة عليك وعلى
            طفلك. نقدّم تغذية مدروسة تناسب كل مرحلة من رحلتك، دون أن تحتاجي
            للتخطيط بنفسك.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          ماذا نقدم
        </h2>
        <div className="mt-5 divide-y divide-black/5 rounded-[var(--radius-card)] border border-black/5 bg-surface shadow-[var(--shadow-soft)]">
          {features.map((feature) => (
            <div key={feature.title} className="p-5">
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 flex items-start gap-3.5 rounded-2xl bg-accent-50/60 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
          <HeartPulse className="size-5" strokeWidth={2} />
        </span>
        <div>
          <p className="font-bold text-foreground">الفائدة</p>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            التغذية السليمة ليست رفاهية في هذه المرحلة، بل عنصر أساسي في
            صحتك وصحة جنينك أو رضيعك. توفير وقت وجهد التخطيط اليومي للوجبات،
            في فترة مرهقة أصلًا، يمنحك مساحة أكبر للراحة والتركيز على ما يهم
            فعلًا.
          </p>
        </div>
      </section>

      <WeeklyMealsSection />
      <MyMealOrdersSection />
    </div>
  );
}
