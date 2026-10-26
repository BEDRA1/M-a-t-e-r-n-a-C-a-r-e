import type { Metadata } from "next";
import { AdminDailyTipsContent } from "@/components/admin/content/AdminDailyTipsContent";

export const metadata: Metadata = { title: "النصائح اليومية" };

export default function AdminDailyTipsPage() {
  return <AdminDailyTipsContent />;
}
