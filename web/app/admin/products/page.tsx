import type { Metadata } from "next";
import { AdminProductsContent } from "@/components/admin/content/AdminProductsContent";

export const metadata: Metadata = { title: "المتجر" };

export default function AdminProductsPage() {
  return <AdminProductsContent />;
}
