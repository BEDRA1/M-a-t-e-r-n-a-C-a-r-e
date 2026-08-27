"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "../api-client";
import type { Reminder, ReminderType } from "../types";

export function useReminders() {
  return useQuery({
    queryKey: ["reminders"],
    queryFn: () => apiGet<Reminder[]>("reminders"),
  });
}

export interface CreateReminderInput {
  type: ReminderType;
  title: string;
  scheduledTime: string;
  recurrence?: string;
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReminderInput) => apiPost<Reminder>("reminders", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useToggleReminderDone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) =>
      apiPatch<Reminder>(`reminders/${id}`, { isDone }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<{ deleted: boolean }>(`reminders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}
