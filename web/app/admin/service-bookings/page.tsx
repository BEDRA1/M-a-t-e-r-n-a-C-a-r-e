import type { Metadata } from "next";
import { AdminServiceBookingsContent } from "@/components/admin/AdminServiceBookingsContent";

export const metadata: Metadata = { title: "حجوزات الخدمات المنزلية" };

export default function AdminServiceBookingsPage() {
  return <AdminServiceBookingsContent />;
}
