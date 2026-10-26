import type { Metadata } from "next";
import { AdminUserDetailsContent } from "@/components/admin/AdminUserDetailsContent";

export const metadata: Metadata = { title: "تفاصيل المستخدم" };

export default async function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminUserDetailsContent userId={id} />;
}
