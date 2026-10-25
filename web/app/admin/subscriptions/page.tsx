import type { Metadata } from "next";
import { AdminSubscriptionsContent } from "@/components/admin/AdminSubscriptionsContent";

export const metadata: Metadata = { title: "الاشتراكات" };

export default function AdminSubscriptionsPage() {
  return <AdminSubscriptionsContent />;
}
