import type { Metadata } from "next";
import { AdminFaqContent } from "@/components/admin/content/AdminFaqContent";

export const metadata: Metadata = { title: "أسئلة الدولا" };

export default function AdminFaqPage() {
  return <AdminFaqContent />;
}
