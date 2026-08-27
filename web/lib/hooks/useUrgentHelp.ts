"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "../api-client";
import type { UrgentHelpRequest, UrgentHelpStatus } from "../types";

export function useCreateManualUrgentHelp() {
  return useMutation({
    mutationFn: (notes?: string) => apiPost<UrgentHelpRequest>("urgent-help-requests", { notes }),
  });
}

export function useUrgentHelpRequests() {
  return useQuery({
    queryKey: ["urgent-help-requests"],
    queryFn: () => apiGet<UrgentHelpRequest[]>("urgent-help-requests"),
  });
}

export function useUpdateUrgentHelpStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: UrgentHelpStatus; notes?: string }) =>
      apiPatch<UrgentHelpRequest>(`urgent-help-requests/${id}/status`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urgent-help-requests"] });
    },
  });
}
