import type { Metadata } from "next";
import { AdminMealsContent } from "@/components/admin/content/AdminMealsContent";

export const metadata: Metadata = { title: "قائمة الوجبات" };

export default function AdminMealsPage() {
  return <AdminMealsContent />;
}
