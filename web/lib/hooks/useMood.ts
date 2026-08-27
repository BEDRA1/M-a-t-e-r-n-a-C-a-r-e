"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api-client";
import type { MoodLog } from "../types";

export interface AddMoodLogInput {
  moodLevel: number;
  notes?: string;
}

export function useAddMoodLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddMoodLogInput) => apiPost<MoodLog>("mood-logs", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mood-logs"] });
    },
  });
}

export function useMoodLogs(days: 7 | 14 | 30) {
  return useQuery({
    queryKey: ["mood-logs", days],
    queryFn: () => apiGet<MoodLog[]>(`mood-logs?days=${days}`),
  });
}
