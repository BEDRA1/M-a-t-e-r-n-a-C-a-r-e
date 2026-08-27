"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../api-client";
import type { AdminAuditLogPage } from "../types";

export interface AuditLogFilters {
  adminUserId?: string;
  action?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

export function useAuditLogs(filters: AuditLogFilters) {
  const params = new URLSearchParams();
  if (filters.adminUserId) params.set("adminUserId", filters.adminUserId);
  if (filters.action) params.set("action", filters.action);
  if (filters.entityType) params.set("entityType", filters.entityType);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));

  return useQuery({
    queryKey: ["admin", "audit-logs", filters],
    queryFn: () => apiGet<AdminAuditLogPage>(`admin/audit-logs?${params.toString()}`),
  });
}
