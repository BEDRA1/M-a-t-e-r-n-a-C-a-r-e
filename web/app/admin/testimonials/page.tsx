import type { Metadata } from "next";
import { AdminTestimonialsContent } from "@/components/admin/AdminTestimonialsContent";

export const metadata: Metadata = { title: "آراء المستخدمات" };

export default function AdminTestimonialsPage() {
  return <AdminTestimonialsContent />;
}
