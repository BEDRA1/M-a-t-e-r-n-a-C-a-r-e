import type { Metadata } from "next";
import { AdminBookingsContent } from "@/components/admin/AdminBookingsContent";

export const metadata: Metadata = { title: "الحجوزات" };

export default function AdminBookingsPage() {
  return <AdminBookingsContent />;
}
