"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api-client";
import type { FaqCategory, FaqEntry, FaqEntryWithRelated } from "../types";

export function useFaqCategories() {
  return useQuery({
    queryKey: ["faq", "categories"],
    queryFn: () => apiGet<FaqCategory[]>("faq/categories"),
    staleTime: Infinity,
  });
}

export function useFaqCategoryEntries(categoryId: string | null) {
  return useQuery({
    queryKey: ["faq", "categories", categoryId, "entries"],
    queryFn: () => apiGet<FaqEntry[]>(`faq/categories/${categoryId}/entries`),
    enabled: Boolean(categoryId),
    staleTime: Infinity,
  });
}

export function useFaqEntry(entryId: string | null) {
  return useQuery({
    queryKey: ["faq", "entries", entryId],
    queryFn: () => apiGet<FaqEntryWithRelated>(`faq/entries/${entryId}`),
    enabled: Boolean(entryId),
    staleTime: Infinity,
  });
}
