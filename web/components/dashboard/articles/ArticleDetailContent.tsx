"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Newspaper, UserRound } from "lucide-react";
import { PageSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { useArticle } from "@/lib/hooks/useArticles";
import { ARTICLE_CATEGORIES } from "@/lib/articleCategories";
import { ApiError } from "@/lib/api-client";
import { ArticleCard } from "./ArticleCard";

export function ArticleDetailContent({ slug }: { slug: string }) {
  const article = useArticle(slug);

  if (article.isLoading) {
    return <PageSpinner />;
  }

  if (article.isError) {
    if (article.error instanceof ApiError && article.error.status === 404) {
      notFound();
    }
    return (
      <Alert tone="error">
        {article.error instanceof ApiError ? article.error.message : "تعذّر تحميل المقال"}
      </Alert>
    );
  }

  if (!article.data) {
    return null;
  }

  const data = article.data;
  const categoryConfig = ARTICLE_CATEGORIES[data.category];

  return (
    <div className="flex flex-col gap-8">
      <div className="h-[240px] w-full overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]">
        <ImageWithFallback src={data.coverImageUrl} alt={data.titleAr} icon={Newspaper} className="size-full" />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${categoryConfig.badgeClass}`}
            >
              {categoryConfig.label}
            </span>
            {data.readTimeMinutes && (
              <span className="flex items-center gap-1 text-sm text-muted">
                <Clock className="size-4" strokeWidth={2} />
                {data.readTimeMinutes} دقائق قراءة
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-muted">
              <UserRound className="size-4" strokeWidth={2} />
              {data.authorName}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold leading-snug text-foreground sm:text-3xl">{data.titleAr}</h1>
        </div>

        <div className="whitespace-pre-line text-[17px] leading-[2] text-foreground/90">{data.contentAr}</div>

        {data.relatedArticles.length > 0 && (
          <div className="mt-4 border-t border-black/5 pt-6">
            <h2 className="text-lg font-bold text-foreground">مقالات ذات صلة</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.relatedArticles.map((related) => (
                <ArticleCard key={related.id} article={related} />
              ))}
            </div>
          </div>
        )}

        <Link href="/dashboard/articles" className="text-sm font-medium text-primary-600 hover:underline">
          الرجوع إلى كل المقالات
        </Link>
      </div>
    </div>
  );
}
