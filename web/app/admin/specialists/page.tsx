import type { Metadata } from "next";
import { AdminSpecialistsContent } from "@/components/admin/AdminSpecialistsContent";

export const metadata: Metadata = { title: "الأخصائيات" };

export default function AdminSpecialistsPage() {
  return <AdminSpecialistsContent />;
}
