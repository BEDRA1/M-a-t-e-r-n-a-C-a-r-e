"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api-client";
import type { MealOrder, WeeklyMeal } from "../types";

export function useCurrentWeekMeals() {
  return useQuery({
    queryKey: ["weekly-meals", "current-week"],
    queryFn: () => apiGet<WeeklyMeal[]>("weekly-meals/current-week"),
  });
}

export interface MealOrderItemInput {
  mealId: string;
  quantity: number;
}

export interface CreateMealOrderInput {
  items: MealOrderItemInput[];
  deliveryAddress: string;
  preferredTime: string;
}

export function useCreateMealOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMealOrderInput) => apiPost<MealOrder>("meal-orders", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-orders", "mine"] });
    },
  });
}

export function useMyMealOrders() {
  return useQuery({
    queryKey: ["meal-orders", "mine"],
    queryFn: () => apiGet<MealOrder[]>("meal-orders/mine"),
  });
}

export function useMealOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["meal-orders", id],
    queryFn: () => apiGet<MealOrder>(`meal-orders/${id}`),
    enabled: Boolean(id),
  });
}

export function useCancelMealOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost<MealOrder>(`meal-orders/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-orders", "mine"] });
    },
  });
}
