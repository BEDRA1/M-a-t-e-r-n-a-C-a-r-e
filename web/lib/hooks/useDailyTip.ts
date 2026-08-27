"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api-client";
import type { DailyTip } from "../types";

export function useDailyTip() {
  return useQuery({
    queryKey: ["daily-tips", "today"],
    queryFn: () => apiGet<DailyTip>("daily-tips/today"),
    retry: false,
  });
}
