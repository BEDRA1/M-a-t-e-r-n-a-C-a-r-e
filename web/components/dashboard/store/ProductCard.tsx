"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { getStockStatus, stockStatusBadgeTone, stockStatusLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  quantity,
  onIncrement,
  onDecrement,
}: {
  product: Product;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const stockStatus = getStockStatus(product.stockQuantity);
  const isOut = stockStatus === "out";
  const atStockLimit = quantity >= product.stockQuantity;

  return (
    <Card className="flex flex-col !p-3 sm:!p-4">
      <div className="aspect-square overflow-hidden rounded-xl">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          icon={ShoppingBag}
          className="size-full"
          iconClassName="size-10"
        />
      </div>

      <div className="mt-2.5 flex flex-1 flex-col sm:mt-3">
        <p className="line-clamp-2 break-words font-bold text-foreground">{product.name}</p>
        <Badge tone="neutral" className="mt-1.5 self-start">{product.category}</Badge>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{product.description}</p>

        <div className="mt-2.5 flex items-center justify-end">
          <Badge tone={stockStatusBadgeTone(stockStatus)}>{stockStatusLabel(stockStatus)}</Badge>
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onDecrement}
            disabled={quantity === 0}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-black/10 text-foreground transition-colors hover:bg-primary-50 disabled:opacity-40"
            aria-label="إنقاص الكمية"
          >
            <Minus className="size-3.5" strokeWidth={2.5} />
          </button>
          <span className="w-5 shrink-0 text-center text-sm font-bold text-foreground">{quantity}</span>
          <button
            type="button"
            onClick={onIncrement}
            disabled={isOut || atStockLimit}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:opacity-40"
            aria-label="زيادة الكمية"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </Card>
  );
}
