"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "../api-client";
import type { Notification } from "../types";

export function useNotifications(isRead?: boolean) {
  return useQuery({
    queryKey: ["notifications", isRead ?? "all"],
    queryFn: () =>
      apiGet<Notification[]>(
        isRead === undefined ? "notifications" : `notifications?isRead=${isRead}`,
      ),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPatch<Notification>(`notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPatch<{ updated: number }>("notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// الإشعارات الست الثابتة (StaticNotifications) لا تُخزَّن في قاعدة البيانات ولا تملك حالة
// قراءة حقيقية — تُحتسَب كـ"غير مقروءة" افتراضيًا (6) حتى تزور المستخدمة صفحة الإشعارات
// مرة واحدة، عندها تُعتبر "مقروءة" دائمًا عبر localStorage. تُستخدَم queryClient كطبقة بث
// حيّة بين المكوّنات (الهيدر + الشريط السفلي مثلاً) بدل الاعتماد فقط على قراءة localStorage
// عند mount كل مكوّن على حدة، التي لا تتحدّث تلقائيًا لبقية المكوّنات المُركَّبة أصلًا
export const STATIC_NOTIFICATIONS_COUNT = 6;
const STATIC_SEEN_STORAGE_KEY = "materna_static_notifications_seen";
const STATIC_SEEN_QUERY_KEY = ["static-notifications-seen"];

function readStaticNotificationsSeen(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STATIC_SEEN_STORAGE_KEY) === "true";
}

function useStaticNotificationsSeen() {
  return useQuery({
    queryKey: STATIC_SEEN_QUERY_KEY,
    queryFn: readStaticNotificationsSeen,
  });
}

/** إجمالي غير المقروء المعروض على شارة أيقونة الجرس في كل مكان (الهيدر، الشريط السفلي):
 * إشعارات حقيقية غير مقروءة من الـAPI + 6 الثابتة إن لم تُزَر صفحة الإشعارات بعد */
export function useUnreadNotificationsCount(): number {
  const notifications = useNotifications();
  const staticSeen = useStaticNotificationsSeen();
  const realUnread = notifications.data?.filter((n) => !n.isRead).length ?? 0;
  const staticUnread = staticSeen.data ? 0 : STATIC_NOTIFICATIONS_COUNT;
  return realUnread + staticUnread;
}

export function useMarkStaticNotificationsSeen() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    localStorage.setItem(STATIC_SEEN_STORAGE_KEY, "true");
    queryClient.setQueryData(STATIC_SEEN_QUERY_KEY, true);
  }, [queryClient]);
}
