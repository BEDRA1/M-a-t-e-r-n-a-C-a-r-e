import type { Metadata } from "next";
import { AdminAuditLogsContent } from "@/components/admin/AdminAuditLogsContent";

export const metadata: Metadata = { title: "سجل النشاط" };

export default function AdminAuditLogsPage() {
  return <AdminAuditLogsContent />;
}
