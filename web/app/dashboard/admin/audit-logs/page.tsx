import type { Metadata } from "next";
import { AuditLogContent } from "@/components/dashboard/admin/AuditLogContent";

export const metadata: Metadata = { title: "سجل النشاط الإداري", robots: { index: false, follow: false } };

export default function AdminAuditLogsPage() {
  return <AuditLogContent />;
}
