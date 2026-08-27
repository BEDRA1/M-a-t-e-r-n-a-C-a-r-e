import type { Metadata } from "next";
import { ArticleDetailContent } from "@/components/dashboard/articles/ArticleDetailContent";

export const metadata: Metadata = { title: "المقال", robots: { index: false, follow: false } };

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticleDetailContent slug={slug} />;
}
