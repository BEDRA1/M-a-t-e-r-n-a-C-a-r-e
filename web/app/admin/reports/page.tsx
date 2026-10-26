import type { Metadata } from "next";
import { AdminReportsContent } from "@/components/admin/AdminReportsContent";

export const metadata: Metadata = { title: "التقارير" };

export default function AdminReportsPage() {
  return <AdminReportsContent />;
}
