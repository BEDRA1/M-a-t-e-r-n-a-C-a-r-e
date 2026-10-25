import type { Metadata } from "next";
import { AdminOverviewContent } from "@/components/admin/AdminOverviewContent";

export const metadata: Metadata = { title: "لوحة التحكم" };

export default function AdminHomePage() {
  return <AdminOverviewContent />;
}
