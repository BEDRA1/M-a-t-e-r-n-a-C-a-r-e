"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api-client";
import type { Specialist, SpecialistTrack } from "../types";

export interface SpecialistFilters {
  specialty?: string;
  track?: SpecialistTrack;
}

export function useSpecialists(filters: SpecialistFilters = {}) {
  const params = new URLSearchParams();
  if (filters.specialty) params.set("specialty", filters.specialty);
  if (filters.track) params.set("track", filters.track);
  const query = params.toString();

  return useQuery({
    queryKey: ["specialists", filters.specialty ?? "all", filters.track ?? "all"],
    queryFn: () => apiGet<Specialist[]>(query ? `specialists?${query}` : "specialists"),
  });
}

export function useSpecialist(id: string | undefined) {
  return useQuery({
    queryKey: ["specialist", id],
    queryFn: () => apiGet<Specialist>(`specialists/${id}`),
    enabled: Boolean(id),
  });
}

export function useMySpecialistProfile(enabled: boolean) {
  return useQuery({
    queryKey: ["specialists", "me"],
    queryFn: () => apiGet<Specialist>("specialists/me"),
    enabled,
    retry: false,
  });
}
