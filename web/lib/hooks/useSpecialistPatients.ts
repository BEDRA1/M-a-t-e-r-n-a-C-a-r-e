"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api-client";
import type { SpecialistPatientDetail, SpecialistPatientSummary } from "../types";

export function useSpecialistPatients() {
  return useQuery({
    queryKey: ["specialist-patients"],
    queryFn: () => apiGet<SpecialistPatientSummary[]>("specialist/patients"),
  });
}

export function useSpecialistPatientDetail(userId: string | undefined) {
  return useQuery({
    queryKey: ["specialist-patients", userId],
    queryFn: () => apiGet<SpecialistPatientDetail>(`specialist/patients/${userId}`),
    enabled: Boolean(userId),
  });
}
