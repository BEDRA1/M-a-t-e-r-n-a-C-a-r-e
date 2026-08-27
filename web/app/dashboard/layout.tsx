import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/get-current-user";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { FloatingPillNav } from "@/components/dashboard/FloatingPillNav";
import { DashboardBottomNav } from "@/components/dashboard/DashboardBottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav user={user} />
      {/* pb محسوبة يدويًا (لا pb-24 ثابتة) لتضمن عدم تغطية الشريط السفلي + زر النفاس البارز
          لأي محتوى على الهاتف (حتى مع safe-area-inset-bottom)، وlg:pb-32 تضمن عدم تغطية
          الكبسولة العائمة الجديدة (ارتفاعها 64px + bottom:24px + هامش أمان) على الديسكتوب،
          بعد أن كانت lg:py-10 وحدها كافية أيام الشريط الجانبي غير العائم */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-8 lg:px-10 lg:py-10 lg:pb-32">
        {children}
      </main>
      <FloatingPillNav user={user} />
      <DashboardBottomNav user={user} />
    </div>
  );
}
