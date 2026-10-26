import type { Metadata } from "next";
import { AdminMealOrdersContent } from "@/components/admin/AdminMealOrdersContent";

export const metadata: Metadata = { title: "طلبات الوجبات" };

export default function AdminMealOrdersPage() {
  return <AdminMealOrdersContent />;
}
