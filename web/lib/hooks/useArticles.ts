"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api-client";
import type { Article, ArticleCategory, ArticlePage, ArticleWithRelated } from "../types";

export interface ArticlesFilters {
  category?: ArticleCategory;
  limit?: number;
  offset?: number;
}

export function useArticles(filters: ArticlesFilters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  const query = params.toString();

  return useQuery({
    queryKey: ["articles", filters.category ?? "all", filters.limit ?? null, filters.offset ?? 0],
    queryFn: () => apiGet<ArticlePage>(query ? `articles?${query}` : "articles"),
  });
}

export function useArticle(slug: string | undefined) {
  return useQuery({
    queryKey: ["articles", "slug", slug],
    queryFn: () => apiGet<ArticleWithRelated>(`articles/${slug}`),
    enabled: Boolean(slug),
  });
}

export type { Article };
