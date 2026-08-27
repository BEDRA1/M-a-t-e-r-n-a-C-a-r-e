import Link from "next/link";
import { ArrowLeft, Clock, Newspaper } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { ARTICLE_CATEGORIES } from "@/lib/articleCategories";
import { cn } from "@/lib/cn";
import type { Article } from "@/lib/types";

export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  const categoryConfig = ARTICLE_CATEGORIES[article.category];

  return (
    <Link
      href={`/dashboard/articles/${article.slug}`}
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-black/5 bg-surface shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]",
        className,
      )}
    >
      <div className="aspect-video w-full shrink-0">
        <ImageWithFallback
          src={article.coverImageUrl}
          alt={article.titleAr}
          icon={Newspaper}
          className="size-full"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-bold",
            categoryConfig.badgeClass,
          )}
        >
          {categoryConfig.label}
        </span>

        <h3 className="font-extrabold leading-snug text-foreground">{article.titleAr}</h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{article.excerptAr}</p>

        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
          {article.readTimeMinutes ? (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" strokeWidth={2} />
              {article.readTimeMinutes} دقائق قراءة
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 font-semibold text-primary-600">
            اقرئي المزيد
            <ArrowLeft className="size-3.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}
