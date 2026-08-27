import type { Metadata } from "next";
import { ArticlesContent } from "@/components/dashboard/articles/ArticlesContent";

export const metadata: Metadata = { title: "المقالات", robots: { index: false, follow: false } };

export default function ArticlesPage() {
  return <ArticlesContent />;
}
