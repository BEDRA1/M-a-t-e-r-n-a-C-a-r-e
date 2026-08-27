"use client";

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
