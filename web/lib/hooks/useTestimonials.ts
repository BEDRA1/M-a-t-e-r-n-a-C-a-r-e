"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api-client";
import type { Testimonial } from "../types";

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: () => apiGet<Testimonial[]>("testimonials"),
  });
}

export interface CreateTestimonialInput {
  content: string;
  rating: number;
  displayName?: string;
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTestimonialInput) => apiPost<Testimonial>("testimonials", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
}
