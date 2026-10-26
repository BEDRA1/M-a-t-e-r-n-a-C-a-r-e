import type { Metadata } from "next";
import { AdminArticlesContent } from "@/components/admin/content/AdminArticlesContent";

export const metadata: Metadata = { title: "المقالات" };

export default function AdminArticlesPage() {
  return <AdminArticlesContent />;
}
