"use client";

import Link from "next/link";
import { BookOpen, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArticleCard } from "@/components/dashboard/articles/ArticleCard";
import { useArticles } from "@/lib/hooks/useArticles";

export function ArticlesPreviewSection() {
  const articles = useArticles({ limit: 3 });

  if (!articles.isLoading && (!articles.data || articles.data.items.length === 0)) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-bold text-foreground">
          <BookOpen className="size-5 text-primary-500" strokeWidth={2} />
          المقالات
        </span>
        <Link href="/dashboard/articles" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
          عرض الكل
          <ChevronLeft className="size-4" strokeWidth={2.5} />
        </Link>
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:overflow-visible">
        {articles.isLoading
          ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-[78%] shrink-0 rounded-2xl sm:w-full" />)
          : articles.data!.items.map((article) => (
              <ArticleCard key={article.id} article={article} className="w-[78%] shrink-0 sm:w-full" />
            ))}
      </div>
    </section>
  );
}
