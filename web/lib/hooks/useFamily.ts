"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost } from "../api-client";
import type { Family } from "../types";

export function useFamily() {
  return useQuery({
    queryKey: ["family", "me"],
    queryFn: () => apiGet<Family>("families/me"),
    retry: false,
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<Family>("families/invite"),
    onSuccess: (data) => {
      queryClient.setQueryData(["family", "me"], data);
    },
  });
}

export function useJoinFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) => apiPost<Family>("families/join", { inviteCode }),
    onSuccess: (data) => {
      queryClient.setQueryData(["family", "me"], data);
    },
  });
}

export function useUnlinkSpouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiDelete<Family>("families/link"),
    onSuccess: (data) => {
      queryClient.setQueryData(["family", "me"], data);
    },
  });
}
