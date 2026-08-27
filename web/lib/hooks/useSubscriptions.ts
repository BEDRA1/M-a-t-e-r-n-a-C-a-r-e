"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api-client";
import type { SubscriptionPaymentMethod, SubscriptionPlan, UserSubscription } from "../types";

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscriptions", "plans"],
    queryFn: () => apiGet<SubscriptionPlan[]>("subscriptions/plans"),
  });
}

export function useMySubscriptions() {
  return useQuery({
    queryKey: ["subscriptions", "mine"],
    queryFn: () => apiGet<UserSubscription[]>("subscriptions/mine"),
  });
}

export interface SubscribeInput {
  planCode: string;
  paymentMethod: SubscriptionPaymentMethod;
  paymentData: Record<string, string>;
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubscribeInput) => apiPost<UserSubscription>("subscriptions/subscribe", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "mine"] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost<UserSubscription>(`subscriptions/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", "mine"] });
    },
  });
}
