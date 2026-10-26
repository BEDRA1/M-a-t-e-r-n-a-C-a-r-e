import { redirect } from "next/navigation";

export default function LegacyAuditLogsPage() {
  redirect("/admin/audit-logs");
}
