"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api-client";
import type { ConsultationReason } from "../types";

export function useConsultationReasons() {
  return useQuery({
    queryKey: ["consultation-reasons"],
    queryFn: () => apiGet<ConsultationReason[]>("consultation-reasons"),
  });
}
