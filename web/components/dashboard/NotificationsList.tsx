"use client";

import { useEffect } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMarkStaticNotificationsSeen,
  useNotifications,
} from "@/lib/hooks/useNotifications";
import { formatArabicDateTime, notificationTypeLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import { StaticNotifications } from "./StaticNotifications";

export function NotificationsList() {
  const notifications = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const markStaticSeen = useMarkStaticNotificationsSeen();

  // زيارة صفحة الإشعارات تُعلّم الإشعارات الست الثابتة كـ"مقروءة" فورًا (تُحدَّث شارة الجرس
  // في الهيدر/الشريط السفلي مباشرة عبر queryClient، لا تنتظر إعادة تحميل الصفحة)
  useEffect(() => {
    markStaticSeen();
  }, [markStaticSeen]);

  const unreadCount = notifications.data?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold text-foreground">الإشعارات</h1>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            loading={markAllAsRead.isPending}
          >
            تعليم الكل كمقروء
          </Button>
        )}
      </div>

      <StaticNotifications />

      {notifications.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !notifications.data || notifications.data.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <Bell className="size-8" strokeWidth={1.75} />
          <p className="text-sm">لا توجد إشعارات حتى الآن.</p>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {notifications.data.map((notification) => (
            <li key={notification.id}>
              <Card
                className={cn(
                  "flex h-full items-start justify-between gap-3",
                  notification.isRead && "opacity-60",
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{notification.title}</p>
                    {!notification.isRead && <Badge tone="primary">جديد</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted">{notification.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Badge tone="accent">{notificationTypeLabel(notification.type)}</Badge>
                    <span>{formatArabicDateTime(notification.createdAt)}</span>
                  </div>
                </div>

                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead.mutate(notification.id)}
                    loading={markAsRead.isPending && markAsRead.variables === notification.id}
                    aria-label="تعليم كمقروء"
                    className="size-11 shrink-0 justify-center"
                  >
                    <CheckCircle2 className="size-4" />
                  </Button>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
