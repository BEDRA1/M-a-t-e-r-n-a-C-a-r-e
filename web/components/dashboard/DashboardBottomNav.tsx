"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CalendarDays, House, User, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { getDashboardNavItems, isNavPathActive, bottomNavExtraItems, type DashboardNavItem } from "./nav-links";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useLogout } from "@/lib/hooks/useAuth";
import type { User as UserType } from "@/lib/types";

const roleLabel: Record<UserType["role"], string> = {
  mother: "أم",
  spouse: "زوج مرافق",
  admin: "مسؤول",
  specialist: "أخصائي/ة",
};

function MoreSheet({ user, onClose }: { user: UserType; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  // "المفضلة" ليست جزءًا من dashboardNavItems أصلًا (كانت مقصورة على الشريط السفلي فقط)،
  // فبعد إزاحتها من التبويبات الأساسية تُضاف هنا يدويًا كي لا تُعزَل عن أي مسار وصول
  const favoritesNavItem: DashboardNavItem = {
    href: bottomNavExtraItems.favorites.href,
    label: bottomNavExtraItems.favorites.label,
    icon: bottomNavExtraItems.favorites.icon,
  };
  const navItems = [favoritesNavItem, ...getDashboardNavItems(user.role)];

  const handleLogout = async () => {
    await logout.mutateAsync();
    onClose();
    router.push("/");
    router.refresh();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 md:hidden"
        onClick={onClose}
      />
      <motion.div
        key="sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-3xl bg-surface p-5 pb-8 shadow-2xl md:hidden"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/10" />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">حسابي</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-black/5 text-foreground/70"
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        </div>

        <Link
          href="/dashboard/profile"
          onClick={onClose}
          className="mt-4 flex items-center gap-3 rounded-xl bg-primary-50 px-3 py-2.5 text-sm font-bold text-primary-700"
        >
          <User className="size-4.5" strokeWidth={2} />
          الملف الشخصي
        </Link>

        <div className="mt-3 flex flex-col gap-1">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label} className="mb-1">
                <p className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-foreground/60">
                  <item.icon className="size-4" strokeWidth={2} />
                  {item.label}
                </p>
                <div className="ms-4 flex flex-col gap-1 border-e border-black/10 pe-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isNavPathActive(pathname, child.href)
                          ? "bg-primary-500 text-white"
                          : "text-foreground/70 hover:bg-primary-50",
                      )}
                    >
                      <child.icon className="size-4" strokeWidth={2} />
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isNavPathActive(pathname, item.href!)
                    ? "bg-primary-500 text-white"
                    : "text-foreground/70 hover:bg-primary-50",
                )}
              >
                <item.icon className="size-4.5" strokeWidth={2} />
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="mt-4 border-t border-black/5 pt-4">
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user.phone}</p>
              <span className="mt-0.5 inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                {roleLabel[user.role]}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            loading={logout.isPending}
            className="mt-3 w-full justify-center"
          >
            تسجيل الخروج
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/** شريط تنقل سفلي يظهر فقط على شاشات الهاتف (أقل من md) — 4 عناصر: الرئيسية/المواعيد/الإشعارات/حسابي.
 * "حسابي" يفتح نفس ورقة "المزيد" الشاملة السابقة (كل الخدمات + الملف الشخصي + الخروج)
 * كي لا يفقد أي مسار وصول كان متاحًا سابقًا رغم تقليص التبويبات الظاهرة من 5 إلى 4 */
export function DashboardBottomNav({ user }: { user: UserType }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const notifications = useNotifications();
  const unreadCount = notifications.data?.filter((n) => !n.isRead).length ?? 0;

  const isActive = (href: string) => isNavPathActive(pathname, href);
  const homeActive = isActive("/dashboard");
  const appointmentsActive = isActive("/dashboard/consultations");
  const notificationsActive = isActive(bottomNavExtraItems.notifications.href);

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

          <button type="button" onClick={() => setMoreOpen(true)} className={tabClasses(false)}>
            <User className="size-6" strokeWidth={2} />
            حسابي
          </button>
        </div>
      </nav>

      {moreOpen && <MoreSheet user={user} onClose={() => setMoreOpen(false)} />}
    </>
  );
}
