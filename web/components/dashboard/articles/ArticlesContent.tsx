"use client";

import { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { HorizontalScroller } from "@/components/ui/HorizontalScroller";
import { useArticles } from "@/lib/hooks/useArticles";
import { ARTICLE_CATEGORY_LIST } from "@/lib/articleCategories";
import { cn } from "@/lib/cn";
import { ArticleCard } from "./ArticleCard";
import type { Article, ArticleCategory } from "@/lib/types";

const PAGE_SIZE = 9;

function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 snap-start rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "border-primary-400 bg-primary-500 text-white"
          : "border-black/10 bg-surface text-foreground/70 hover:border-primary-200",
      )}
    >
      {children}
    </button>
  );
}

export function ArticlesContent() {
  const [category, setCategory] = useState<ArticleCategory | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const [accumulated, setAccumulated] = useState<Article[]>([]);

  const articles = useArticles({ category, limit: PAGE_SIZE, offset });

  useEffect(() => {
    if (!articles.data) return;
    const page = articles.data;
    setAccumulated((prev) => {
      if (offset === 0) return page.items;
      // دمج بمعرّفات فريدة يتجنّب التكرار لو أعاد react-query جلب نفس الصفحة في الخلفية
      // (مثلًا عند التركيز على النافذة) أثناء وجود صفحات محمّلة مسبقًا عبر "تحميل المزيد"
      const existingIds = new Set(prev.map((a) => a.id));
      return [...prev, ...page.items.filter((a) => !existingIds.has(a.id))];
    });
  }, [articles.data, offset]);

  const handleCategoryChange = (next: ArticleCategory | undefined) => {
    if (next === category) return;
    setCategory(next);
    setOffset(0);
    setAccumulated([]);
  };

  const total = articles.data?.total ?? 0;
  const hasMore = accumulated.length < total;
  const isInitialLoading = accumulated.length === 0 && articles.isLoading;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">المقالات</h1>
        <p className="mt-1 text-sm text-muted">محتوى تثقيفي موثوق يرافقك في رحلتك من الحمل حتى ما بعد الولادة</p>
      </div>

      <HorizontalScroller className="-mx-4 px-4">
        <CategoryPill active={category === undefined} onClick={() => handleCategoryChange(undefined)}>
          الكل
        </CategoryPill>
        {ARTICLE_CATEGORY_LIST.map((c) => (
          <CategoryPill key={c.code} active={category === c.code} onClick={() => handleCategoryChange(c.code)}>
            {c.label}
          </CategoryPill>
        ))}
      </HorizontalScroller>

      {isInitialLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : accumulated.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <Newspaper className="size-8 text-primary-300" strokeWidth={1.5} />
          <p>لا توجد مقالات في هذه الفئة حاليًا.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {accumulated.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
                loading={articles.isFetching}
              >
                تحميل المزيد
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
