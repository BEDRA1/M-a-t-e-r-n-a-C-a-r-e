"use client";

import Link from "next/link";
import { Bell, Heart, User } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { BrandName } from "@/components/ui/BrandName";
import { useUnreadNotificationsCount } from "@/lib/hooks/useNotifications";
import { NotificationBadge } from "@/components/dashboard/NotificationBadge";

/** هيدر مخصّص للصفحة الرئيسية على الهاتف فقط — DashboardNav العام يُخفي صفّه المكافئ
 * هناك تحديدًا (pathname === "/dashboard") لتفادي هيدرين متراكبين */
export function MobileHomeHeader() {
  const unreadCount = useUnreadNotificationsCount();

  return (
    <div className="flex h-16 items-center justify-between bg-white px-4">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/notifications"
          className="relative flex items-center justify-center"
          aria-label="الإشعارات"
        >
          <Bell className="size-6 text-foreground/70" strokeWidth={2} />
          <NotificationBadge count={unreadCount} />
        </Link>
        <Heart className="size-4 fill-primary-500 text-primary-500" strokeWidth={0} />
      </div>

      <Link href="/dashboard" className="flex flex-col items-center">
        <span className="flex items-center gap-1.5">
          <BrandMark className="size-6" />
          <BrandName className="text-base" />
        </span>
        <span className="text-[10px] text-muted">منصة ترافقك خلال رحلة الألف يوم</span>
      </Link>

      <Link
        href="/dashboard/profile"
        className="flex size-9 items-center justify-center rounded-full bg-black/5 text-foreground/70"
        aria-label="ملفي الشخصي"
      >
        <User className="size-5" strokeWidth={2} />
      </Link>
    </div>
  );
}
