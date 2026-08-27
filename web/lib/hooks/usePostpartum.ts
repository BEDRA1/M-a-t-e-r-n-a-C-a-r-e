"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api-client";
import type { PostpartumMoodLog, PostpartumPeriod } from "../types";

export function usePostpartumCurrent() {
  return useQuery({
    queryKey: ["postpartum", "current"],
    queryFn: () => apiGet<PostpartumPeriod>("postpartum/current"),
    retry: false,
  });
}

export interface AddMoodLogInput {
  moodLevel: number;
  notes?: string;
}

export function useAddMoodLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddMoodLogInput) => apiPost<PostpartumMoodLog>("postpartum/mood-logs", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postpartum", "mood-logs"] });
    },
  });
}

export function useMoodLogs(days: 7 | 14 | 30) {
  return useQuery({
    queryKey: ["postpartum", "mood-logs", days],
    queryFn: () => apiGet<PostpartumMoodLog[]>(`postpartum/mood-logs?days=${days}`),
  });
}
