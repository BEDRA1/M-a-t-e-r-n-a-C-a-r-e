"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api-client";
import type { ConsultationType, SpecialistAvailabilitySlot } from "../types";

export function useAvailableSlots(filters: {
  specialistId?: string;
  consultationType?: ConsultationType;
}) {
  const params = new URLSearchParams();
  if (filters.specialistId) params.set("specialistId", filters.specialistId);
  if (filters.consultationType) params.set("consultationType", filters.consultationType);
  const query = params.toString();

  return useQuery({
    queryKey: ["available-slots", filters.specialistId ?? "any", filters.consultationType ?? "any"],
    queryFn: () =>
      apiGet<SpecialistAvailabilitySlot[]>(
        `specialist-availability/available${query ? `?${query}` : ""}`,
      ),
    enabled: Boolean(filters.specialistId),
  });
}
