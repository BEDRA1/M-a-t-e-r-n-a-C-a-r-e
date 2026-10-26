import type { Metadata } from "next";
import { AdminBroadcastContent } from "@/components/admin/AdminBroadcastContent";

export const metadata: Metadata = { title: "إشعار جماعي" };

export default function AdminBroadcastPage() {
  return <AdminBroadcastContent />;
}
