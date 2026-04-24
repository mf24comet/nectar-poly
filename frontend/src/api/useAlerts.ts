import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { mockAlertListResponse, mockAlerts } from "@/lib/mock-data";
import type { Alert } from "@/types/alert";
import type { PaginatedResponse } from "@/types/api";

export interface AlertFilters {
  page?: number;
  per_page?: number;
  severity?: string;
  resolved?: string;
  device_id?: string;
}

export function useAlerts(filters: AlertFilters = {}) {
  const { page = 1, per_page = 25, severity, resolved, device_id } = filters;
  return useQuery<PaginatedResponse<Alert>>({
    queryKey: ["alerts", filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({ page: String(page), per_page: String(per_page) });
        if (severity) params.set("severity", severity);
        if (resolved) params.set("resolved", resolved);
        if (device_id) params.set("device_id", device_id);
        const result = await apiFetch<PaginatedResponse<Alert>>(`/v1/alerts?${params}`);
        if (result.data.length === 0)
          return mockAlertListResponse(page, per_page, severity, resolved);
        return result;
      } catch {
        return mockAlertListResponse(page, per_page, severity, resolved);
      }
    },
  });
}

export function useAlert(id: string) {
  return useQuery<Alert>({
    queryKey: ["alert", id],
    queryFn: async () => {
      try {
        return await apiFetch<Alert>(`/v1/alerts/${id}`);
      } catch {
        const alert = mockAlerts.find((a) => a.id === id);
        if (!alert) throw new Error("Alert not found");
        return alert;
      }
    },
    enabled: !!id,
  });
}
