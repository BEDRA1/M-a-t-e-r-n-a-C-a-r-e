import type { Metadata } from "next";
import { AdminUrgentHelpContent } from "@/components/admin/AdminUrgentHelpContent";

export const metadata: Metadata = { title: "طلبات المساعدة العاجلة" };

export default function AdminUrgentHelpPage() {
  return <AdminUrgentHelpContent />;
}
