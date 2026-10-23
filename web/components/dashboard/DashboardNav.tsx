"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/ui/BrandMark";
import { BrandName } from "@/components/ui/BrandName";
import { useLogout } from "@/lib/hooks/useAuth";
import { useUnreadNotificationsCount } from "@/lib/hooks/useNotifications";
import { getDashboardNavItems, isNavPathActive, type DashboardNavChild } from "./nav-links";
import { NotificationBadge } from "./NotificationBadge";
import type { User } from "@/lib/types";

// تبسيط القائمة إلى روابط مباشرة فقط للشريط الأفقي (لا معنى لعنصر أب قابل للطي هنا)
function buildFlatTabs(role: User["role"]): DashboardNavChild[] {
  return getDashboardNavItems(role).flatMap((item) =>
    item.children ? item.children : [{ href: item.href!, label: item.label, icon: item.icon }],
  );
}

/**
 * الشريط العلوي — يظهر على التابلت والهاتف معًا (لا يوجد sidebar تحتهما).
 * قائمة التبويبات الأفقية تظهر فقط على التابلت (md فما فوق دون lg)؛ الهاتف
 * يعتمد على الشريط السفلي (DashboardBottomNav) للتنقل الأساسي بدلًا منها.
 */
export function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const flatTabs = buildFlatTabs(user.role);
  const unreadCount = useUnreadNotificationsCount();

  const segments = pathname.split("/").filter(Boolean);
  const isNestedPage = segments.length > 2;

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/");
    router.refresh();
  };

  // الصفحة الرئيسية (/dashboard تحديدًا، لا صفحاتها الفرعية) لها هيدر هاتف مخصّص خاص بها
  // (MobileHomeHeader داخل MobileHomeContent) يطابق مرجعًا بصريًا محددًا — هذا الصف العام
  // يُخفى هناك حصرًا لتفادي هيدرين متراكبين، ويبقى كما هو لكل صفحة أخرى
  const isHomePage = pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-background/90 backdrop-blur-md lg:hidden">
      {/* صف الهاتف فقط: شعار أو زر رجوع + أيقونة إشعارات — التنقل الأساسي عبر الشريط السفلي.
          py-2.5 + أزرار size-11 (44px) = ارتفاع صف إجمالي 64px، ضمن نطاق 56-64px المطلوب */}
      <div className={cn("items-center justify-between px-3 py-2.5 md:hidden", isHomePage ? "hidden" : "flex")}>
        {isNestedPage ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-11 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-primary-50 active:bg-primary-100"
            aria-label="رجوع"
          >
            <ChevronRight className="size-5" strokeWidth={2.25} />
          </button>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2 px-2">
            <BrandMark className="size-8" />
            <BrandName />
          </Link>
        )}

        <Link
          href="/dashboard/notifications"
          className="relative flex size-11 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-primary-50 active:bg-primary-100"
          aria-label="الإشعارات"
        >
          <Bell className="size-5" strokeWidth={2} />
          <NotificationBadge count={unreadCount} />
        </Link>
      </div>

      {/* صف التابلت: شعار + بيانات المستخدم + خروج */}
      <div className="hidden items-center justify-between px-6 py-3 md:flex">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BrandMark className="size-8" />
          <BrandName />
        </Link>

        <div className="flex items-center gap-2 text-sm text-muted">
          <span>{user.phone}</span>
          <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
            {user.role === "mother"
              ? "أم"
              : user.role === "spouse"
                ? "زوج مرافق"
                : user.role === "specialist"
                  ? "أخصائي/ة"
                  : "مسؤول"}
          </span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout} loading={logout.isPending}>
          تسجيل الخروج
        </Button>
      </div>

      <nav className="hidden gap-1 overflow-x-auto px-4 pb-2 sm:px-6 md:flex">
        {flatTabs.map((tab) => {
          const active = isNavPathActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-500 text-white"
                  : "text-foreground/70 hover:bg-primary-50 hover:text-primary-700",
              )}
            >
              <tab.icon className="size-4" strokeWidth={2} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
