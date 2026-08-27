"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "../api-client";
import type { Booking, BookingStatus, PaymentMethod } from "../types";

export interface CreateBookingInput {
  availabilitySlotId: string;
  reasonId: string;
  questionnaireAnswers?: Record<string, unknown>;
  paymentMethod?: PaymentMethod;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => apiPost<Booking>("bookings", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => apiGet<Booking[]>("bookings/mine"),
  });
}

export function useBookingsForSpecialist(status?: BookingStatus) {
  return useQuery({
    queryKey: ["specialist-bookings", status ?? "all"],
    queryFn: () => apiGet<Booking[]>(status ? `bookings/for-specialist?status=${status}` : "bookings/for-specialist"),
  });
}

export function useUpcomingBookingsForSpecialist() {
  return useQuery({
    queryKey: ["specialist-bookings", "upcoming"],
    queryFn: () => apiGet<Booking[]>("bookings/for-specialist/upcoming"),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost<Booking>(`bookings/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["specialist-bookings"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      apiPatch<Booking>(`bookings/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialist-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["specialist-patients"] });
    },
  });
}

export function useSetBookingVideoLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, videoLink }: { id: string; videoLink: string }) =>
      apiPatch<Booking>(`bookings/${id}/video-link`, { videoLink }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialist-bookings"] });
    },
  });
}
