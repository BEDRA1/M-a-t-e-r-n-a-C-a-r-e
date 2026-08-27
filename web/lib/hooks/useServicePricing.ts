"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api-client";
import type { ServicePricing } from "../types";

export function useServicePricing() {
  return useQuery({
    queryKey: ["service-pricing"],
    queryFn: () => apiGet<ServicePricing[]>("service-pricing"),
    staleTime: Infinity,
  });
}
