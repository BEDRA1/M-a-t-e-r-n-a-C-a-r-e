"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Bell, CalendarDays, ChevronLeft, House, LogOut, Settings2, User, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { bottomNavExtraItems, isNavPathActive } from "./nav-links";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useLogout } from "@/lib/hooks/useAuth";
import type { User as UserType } from "@/lib/types";
import { useState } from "react";

interface AccountLink {
  href: string;
  label: string;
  icon: typeof User;
}

const ACCOUNT_LINKS: AccountLink[] = [
  { href: "/dashboard/profile", label: "ملفي الشخصي", icon: User },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings2 },
  { href: "/dashboard/family", label: "العائلة", icon: Users },
];

function AccountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    onClose();
    router.push("/");
    router.refresh();
  };

  const goTo = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="حسابي">
      <div className="flex flex-col gap-1">
        {ACCOUNT_LINKS.map((link) => (
          <button
            key={link.href}
            type="button"
            onClick={() => goTo(link.href)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-medium text-foreground/80 transition-colors hover:bg-primary-50"
          >
            <link.icon className="size-5 text-primary-500" strokeWidth={2} />
            <span className="flex-1">{link.label}</span>
            <ChevronLeft className="size-4 text-foreground/40" strokeWidth={2.5} />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={logout.isPending}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
      >
        <LogOut className="size-4.5" strokeWidth={2} />
        {logout.isPending ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
      </button>
    </BottomSheet>
  );
}

/** شريط تنقل سفلي يظهر فقط على شاشات الهاتف (أقل من md) — 4 عناصر: الرئيسية/المواعيد/الإشعارات/حسابي.
 * "حسابي" يفتح BottomSheet مبسّطة (الملف الشخصي/الإعدادات/العائلة/تسجيل الخروج) بدل قائمة
 * التنقل الكاملة سابقًا — الوصول لبقية الأقسام (المفضلة، الدولا، الحمل، النفاس...) صار فقط
 * عبر شبكة الخدمات في الصفحة الرئيسية، لا يوجد بديل آخر على الهاتف بعد هذا التبسيط */
export function DashboardBottomNav({ user: _user }: { user: UserType }) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const notifications = useNotifications();
  const unreadCount = notifications.data?.filter((n) => !n.isRead).length ?? 0;

  const isActive = (href: string) => isNavPathActive(pathname, href);
  const homeActive = isActive("/dashboard");
  const appointmentsActive = isActive("/dashboard/consultations");
  const notificationsActive = isActive(bottomNavExtraItems.notifications.href);
  const accountActive =
    isActive("/dashboard/profile") || isActive("/dashboard/settings") || isActive("/dashboard/family");

  const tabClasses = (active: boolean) =>
    cn(
      "flex flex-col items-center gap-1 py-1.5 text-xs font-medium transition-colors",
      active ? "text-primary-500" : "text-gray-500",
    );

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center px-2">
          <Link href="/dashboard" className={tabClasses(homeActive)}>
            <House className={cn("size-6", homeActive && "fill-primary-500")} strokeWidth={2} />
            الرئيسية
          </Link>

          <Link href="/dashboard/consultations/my-bookings" className={tabClasses(appointmentsActive)}>
            <CalendarDays className="size-6" strokeWidth={2} />
            المواعيد
          </Link>

          <Link href={bottomNavExtraItems.notifications.href} className={tabClasses(notificationsActive)}>
            <span className="relative">
              <Bell className="size-6" strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -end-2 flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[16px] text-white">
                  {unreadCount}
                </span>
              )}
            </span>
            الإشعارات
          </Link>

          <button type="button" onClick={() => setAccountOpen(true)} className={tabClasses(accountActive)}>
            <User className={cn("size-6", accountActive && "fill-primary-500")} strokeWidth={2} />
            حسابي
          </button>
        </div>
      </nav>

      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}
