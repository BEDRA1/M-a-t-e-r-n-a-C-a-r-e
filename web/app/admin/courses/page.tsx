import type { Metadata } from "next";
import { AdminCoursesContent } from "@/components/admin/content/AdminCoursesContent";

export const metadata: Metadata = { title: "الدورات" };

export default function AdminCoursesPage() {
  return <AdminCoursesContent />;
}
