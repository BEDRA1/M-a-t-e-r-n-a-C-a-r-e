"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api-client";
import type { HomeService, ServiceBooking } from "../types";

export function useHomeServicesCatalog(category?: string) {
  return useQuery({
    queryKey: ["home-services", "catalog", category ?? null],
    queryFn: () =>
      apiGet<HomeService[]>(category ? `home-services?category=${encodeURIComponent(category)}` : "home-services"),
  });
}

export interface CreateServiceBookingInput {
  serviceId: string;
  scheduledTime: string;
  address: string;
  notes?: string;
}

export function useCreateServiceBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceBookingInput) => apiPost<ServiceBooking>("service-bookings", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-bookings", "mine"] });
    },
  });
}

export function useMyServiceBookings() {
  return useQuery({
    queryKey: ["service-bookings", "mine"],
    queryFn: () => apiGet<ServiceBooking[]>("service-bookings/mine"),
  });
}

export function useServiceBooking(id: string | undefined) {
  return useQuery({
    queryKey: ["service-bookings", id],
    queryFn: () => apiGet<ServiceBooking>(`service-bookings/${id}`),
    enabled: Boolean(id),
  });
}

export function useCancelServiceBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost<ServiceBooking>(`service-bookings/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-bookings", "mine"] });
    },
  });
}
