"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "../api-client";
import type { BookingReview } from "../types";

export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  comment?: string;
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => apiPost<BookingReview>("booking-reviews", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}
