"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "../api-client";
import type { DataSharingSettings } from "../types";

export function useDataSharing(specialistId: string | undefined) {
  return useQuery({
    queryKey: ["data-sharing", specialistId],
    queryFn: () => apiGet<DataSharingSettings>(`data-sharing/${specialistId}`),
    enabled: Boolean(specialistId),
  });
}

export function useUpdateDataSharing(specialistId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Pick<DataSharingSettings, "shareMoodLogs" | "shareAssessments" | "sharePregnancyData" | "sharePostpartumData">>) =>
      apiPatch<DataSharingSettings>(`data-sharing/${specialistId}`, input),
    onSuccess: (data) => {
      queryClient.setQueryData(["data-sharing", specialistId], data);
    },
  });
}
