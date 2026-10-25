import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/get-current-user";
import { AdminHeader, AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "لوحة الإدارة", template: "%s | إدارة Materna Care" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }
  if (user.role === "specialist") {
    redirect("/specialist");
  }
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-1 bg-[#0F172A] text-slate-100">
      <AdminSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader user={user} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
