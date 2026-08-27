"use client";

import { useMemo, useState } from "react";
import { PackageSearch, ShoppingBasket } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { cn } from "@/lib/cn";
import { formatDzd } from "@/lib/format";
import { useProductsCatalog } from "@/lib/hooks/useStore";
import { ApiError } from "@/lib/api-client";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { StoreCartPanel } from "./StoreCartPanel";

const ALL_CATEGORIES = "الكل";

export function ProductCatalogSection() {
  const products = useProductsCatalog();
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartSheetOpen, setCartSheetOpen] = useState(false);

  const categories = useMemo(() => {
    if (!products.data) return [];
    return Array.from(new Set(products.data.map((product) => product.category)));
  }, [products.data]);

  const visibleProducts = useMemo(() => {
    if (!products.data) return [];
    if (activeCategory === ALL_CATEGORIES) return products.data;
    return products.data.filter((product) => product.category === activeCategory);
  }, [products.data, activeCategory]);

  const handleIncrement = (product: Product) => {
    setCart((prev) => {
      const current = prev[product.id] ?? 0;
      if (current >= product.stockQuantity) return prev;
      return { ...prev, [product.id]: current + 1 };
    });
  };

  const handleDecrement = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[productId] ?? 0;
      if (current <= 1) {
        delete next[productId];
      } else {
        next[productId] = current - 1;
      }
      return next;
    });
  };

  const handleClear = () => setCart({});

  const productsById = new Map((products.data ?? []).map((product) => [product.id, product]));
  const cartItemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = Object.entries(cart).reduce(
    (sum, [productId, quantity]) => sum + (productsById.get(productId)?.price ?? 0) * quantity,
    0,
  );

  if (products.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (products.isError) {
    return (
      <Alert tone="error">
        {products.error instanceof ApiError ? products.error.message : "تعذّر تحميل كتالوج المنتجات"}
      </Alert>
    );
  }

  if (!products.data || products.data.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
        <PackageSearch className="size-8 text-primary-300" strokeWidth={1.5} />
        <p>لا توجد منتجات متاحة حاليًا.</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[ALL_CATEGORIES, ...categories].map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === category
                ? "bg-primary-500 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px]">
        {visibleProducts.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
            <PackageSearch className="size-8 text-primary-300" strokeWidth={1.5} />
            <p>لا توجد منتجات في هذه الفئة.</p>
          </Card>
        ) : (
          <div
            className={cn(
              "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1",
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:pb-0 xl:grid-cols-3",
            )}
          >
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="min-w-[78%] shrink-0 snap-start sm:min-w-0 sm:shrink sm:snap-align-none"
              >
                <ProductCard
                  product={product}
                  quantity={cart[product.id] ?? 0}
                  onIncrement={() => handleIncrement(product)}
                  onDecrement={() => handleDecrement(product.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* الديسكتوب: السلة الجانبية الثابتة كما هي دون تغيير */}
        <div className="hidden lg:block">
          <StoreCartPanel products={products.data} cart={cart} onDecrement={handleDecrement} onClear={handleClear} />
        </div>
      </div>

      {/* الهاتف والتابلت: زر عائم يفتح السلة كـBottomSheet بدل تكديسها أسفل الشبكة */}
      {cartItemCount > 0 && (
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
      )}

      <BottomSheet open={cartSheetOpen} onClose={() => setCartSheetOpen(false)}>
        <StoreCartPanel
          products={products.data ?? []}
          cart={cart}
          onDecrement={handleDecrement}
          onClear={handleClear}
          variant="sheet"
        />
      </BottomSheet>
    </div>
  );
}
