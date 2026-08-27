"use client";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * صف تمرير أفقي بلا شريط تمرير مرئي، لسلاسل بطاقات الهاتف (اختصارات، كاروسيل خدمات).
 * يعرض مؤشرًا بصريًا خافتًا عند وجود محتوى إضافي غير ظاهر حاليًا خارج حدود الحاوية.
 */
export function HorizontalScroller({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const updateHasMore = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setHasMore(maxScroll > 4 && Math.abs(el.scrollLeft) < maxScroll - 4);
    };

    updateHasMore();
    el.addEventListener("scroll", updateHasMore, { passive: true });
    const resizeObserver = new ResizeObserver(updateHasMore);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener("scroll", updateHasMore);
      resizeObserver.disconnect();
    };
  }, [children]);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className={cn(
          "flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className,
        )}
        {...props}
      >
        {children}
      </div>

      {hasMore && (
        <span className="pointer-events-none absolute inset-y-0 end-1 flex items-center" aria-hidden="true">
          <span className="flex size-7 items-center justify-center rounded-full bg-surface/90 text-foreground/50 shadow-[var(--shadow-soft)] backdrop-blur-sm">
            <ChevronLeft className="size-4" strokeWidth={2.5} />
          </span>
        </span>
      )}
    </div>
  );
}
