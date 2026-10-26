import type { Metadata } from "next";
import { AdminProductOrdersContent } from "@/components/admin/AdminProductOrdersContent";

export const metadata: Metadata = { title: "طلبات المتجر" };

export default function AdminProductOrdersPage() {
  return <AdminProductOrdersContent />;
}
