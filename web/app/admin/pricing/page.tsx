import type { Metadata } from "next";
import { AdminPricingContent } from "@/components/admin/AdminPricingContent";

export const metadata: Metadata = { title: "الأسعار" };

export default function AdminPricingPage() {
  return <AdminPricingContent />;
}
