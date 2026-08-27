import type { ArticleCategory } from "./types";

export interface ArticleCategoryConfig {
  code: ArticleCategory;
  label: string;
  badgeClass: string;
}

export const ARTICLE_CATEGORIES: Record<ArticleCategory, ArticleCategoryConfig> = {
  pregnancy: {
    code: "pregnancy",
    label: "الحمل",
    badgeClass: "bg-primary-100 text-primary-700",
  },
  birth: {
    code: "birth",
    label: "الولادة",
    badgeClass: "bg-doula-100 text-doula-700",
  },
  postpartum: {
    code: "postpartum",
    label: "النفاس",
    badgeClass: "bg-green-100 text-green-700",
  },
  baby_health: {
    code: "baby_health",
    label: "صحة الطفل",
    badgeClass: "bg-sky-100 text-sky-700",
  },
  nutrition: {
    code: "nutrition",
    label: "التغذية",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  mental_health: {
    code: "mental_health",
    label: "الصحة النفسية",
    badgeClass: "bg-orange-100 text-orange-700",
  },
};

export const ARTICLE_CATEGORY_LIST: ArticleCategoryConfig[] = Object.values(ARTICLE_CATEGORIES);
