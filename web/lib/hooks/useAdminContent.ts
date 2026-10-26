"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "../api-client";
import type {
  Article,
  ArticleCategory,
  ConsultationType,
  Course,
  DailyTip,
  FaqCategory,
  FaqEntry,
  MealType,
  Product,
  ServicePricing,
  SubscriptionPlan,
  WeeklyMeal,
} from "../types";

// كل المسارات هنا للإدارة فقط (403 لغيرها) وكل تعديل يُسجَّل في سجل النشاط من الـBackend.
// لا حذف نهائي من الواجهة: الإخفاء عبر isActive/إلغاء النشر فقط

/** يبني hook قائمة + hooks إنشاء/تعديل تُبطل نفس المفتاح */
function contentResource<T extends { id: string }, CreateInput, UpdateInput>(key: string, path: string) {
  const queryKey = ["admin", "content", key];
  return {
    useList: () => useQuery({ queryKey, queryFn: () => apiGet<T[]>(path) }),
    useCreate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (input: CreateInput) => apiPost<T>(path, input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
      });
    },
    useUpdate: () => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, ...input }: UpdateInput & { id: string }) => apiPatch<T>(`${path}/${id}`, input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
      });
    },
  };
}

// ── المقالات
export interface ArticleInput {
  titleAr: string;
  slug: string;
  excerptAr: string;
  contentAr: string;
  coverImageUrl: string;
  category: ArticleCategory;
  authorName: string;
  readTimeMinutes?: number;
}
export const AdminArticles = contentResource<Article, ArticleInput, Partial<ArticleInput>>("articles", "admin/articles");

export function useSetArticlePublished() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      apiPatch<Article>(`admin/articles/${id}/${published ? "publish" : "unpublish"}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "content", "articles"] }),
  });
}

// ── أسئلة الدولا
export interface AdminFaqEntry extends FaqEntry {
  category?: { nameAr: string };
}
export interface FaqInput {
  categoryId: string;
  questionAr: string;
  answerAr: string;
  displayOrder?: number;
  isActive?: boolean;
}
export const AdminFaq = contentResource<AdminFaqEntry, FaqInput, Partial<FaqInput>>("faq", "admin/faq/entries");

export function useFaqCategories() {
  return useQuery({ queryKey: ["faq", "categories"], queryFn: () => apiGet<FaqCategory[]>("faq/categories") });
}

// ── الوجبات
export interface AdminWeeklyMeal extends WeeklyMeal {
  isActive: boolean;
}
export interface MealInput {
  dayOfWeek: number;
  mealType: MealType;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
}
export const AdminMeals = contentResource<AdminWeeklyMeal, MealInput, Partial<MealInput> & { isActive?: boolean }>(
  "meals",
  "admin/weekly-meals",
);

// ── المتجر
export interface AdminProduct extends Product {
  isActive: boolean;
}
export interface ProductInput {
  name: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
}
export const AdminProducts = contentResource<AdminProduct, ProductInput, Partial<ProductInput> & { isActive?: boolean }>(
  "products",
  "admin/products",
);

// ── النصائح اليومية
export interface AdminDailyTip extends DailyTip {
  isActive: boolean;
}
export const AdminDailyTips = contentResource<
  AdminDailyTip,
  { tipTextAr: string },
  { tipTextAr?: string; isActive?: boolean }
>("daily-tips", "admin/daily-tips");

// ── الدورات (لا إنشاء من الإدارة — تنشئها الأخصائيات)
export interface AdminCourse extends Course {
  imageUrl: string | null;
  specialist?: Course["specialist"];
}
export interface CourseInput {
  title?: string;
  description?: string;
  imageUrl?: string | null;
  capacity?: number;
  startDate?: string;
}
export const AdminCourses = contentResource<AdminCourse, never, CourseInput>("courses", "admin/courses");

// ── الأسعار
export interface AdminPricing {
  services: ServicePricing[];
  plans: Pick<SubscriptionPlan, "id" | "code" | "nameAr" | "price" | "currency" | "type">[];
}

export function useAdminPricing() {
  return useQuery({ queryKey: ["admin", "pricing"], queryFn: () => apiGet<AdminPricing>("admin/pricing") });
}

export function useUpdatePrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, id, price }: { kind: "services" | "plans"; id: string; price: number }) =>
      apiPatch(`admin/pricing/${kind}/${id}`, { price }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
      queryClient.invalidateQueries({ queryKey: ["service-pricing"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

export const SERVICE_KIND_LABELS: Record<ServicePricing["serviceKind"], string> = {
  consultation: "الاستشارة",
  course: "الدورة",
};
export const CONSULTATION_TYPE_LABELS: Record<ConsultationType, string> = {
  in_person: "حضوري",
  remote: "عن بُعد",
};

// ── الإشعار الجماعي
export type BroadcastAudience = "all" | "pregnant" | "postpartum" | "specialists";

export function useBroadcastRecipients(audience: BroadcastAudience) {
  return useQuery({
    queryKey: ["admin", "broadcast", "recipients", audience],
    queryFn: () => apiGet<{ audience: BroadcastAudience; recipients: number }>(`admin/broadcast/recipients?audience=${audience}`),
  });
}

export function useSendBroadcast() {
  return useMutation({
    mutationFn: (input: { audience: BroadcastAudience; title: string; body: string }) =>
      apiPost<{ audience: BroadcastAudience; recipients: number }>("admin/broadcast", input),
  });
}

// ── التصدير
export type ExportKind = "users" | "bookings" | "subscriptions" | "orders";

/** الملف يُبنى في الـBackend (الاقتطاع يُفرض هناك) ويصل كنص مع الـBOM — المتصفح يحفظه فقط */
export function useExportCsv() {
  return useMutation({
    mutationFn: async (kind: ExportKind) => {
      const file = await apiGet<{ filename: string; rows: number; content: string }>(`admin/exports/${kind}`);
      const url = URL.createObjectURL(new Blob([file.content], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return file.rows;
    },
  });
}
