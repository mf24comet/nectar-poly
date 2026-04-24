import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import {
  mockDeviceListResponse,
  mockDeviceDetails,
  mockDevices,
} from "@/lib/mock-data";
import type { Device, DeviceDetail } from "@/types/device";
import type { PaginatedResponse } from "@/types/api";

export interface DeviceFilters {
  page?: number;
  per_page?: number;
  tenant_id?: string;
  site_id?: string;
  room_id?: string;
  status?: string;
  sort?: string;
  order?: string;
  search?: string;
}

export function useDevices(filters: DeviceFilters = {}) {
  const { page = 1, per_page = 25, ...rest } = filters;
  return useQuery<PaginatedResponse<Device>>({
    queryKey: ["devices", filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({ page: String(page), per_page: String(per_page) });
        Object.entries(rest).forEach(([k, v]) => v && params.set(k, String(v)));
        const result = await apiFetch<PaginatedResponse<Device>>(`/v1/devices?${params}`);
        if (result.data.length === 0) return applyClientFilters(mockDeviceListResponse(page, per_page), rest);
        return result;
      } catch {
        return applyClientFilters(mockDeviceListResponse(page, per_page), rest);
      }
    },
  });
}

function applyClientFilters(
  base: PaginatedResponse<Device>,
  filters: Omit<DeviceFilters, "page" | "per_page">,
): PaginatedResponse<Device> {
  let data = [...mockDevices];
  if (filters.status) data = data.filter((d) => d.status === filters.status);
  if (filters.site_id) data = data.filter((d) => d.site_id === filters.site_id);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    data = data.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q) ||
        d.serial_number.toLowerCase().includes(q),
    );
  }
  const page = base.page;
  const per_page = base.per_page;
  const start = (page - 1) * per_page;
  return { data: data.slice(start, start + per_page), total: data.length, page, per_page };
}

export function useDevice(id: string) {
  return useQuery<DeviceDetail>({
    queryKey: ["device", id],
    queryFn: async () => {
      try {
        const result = await apiFetch<DeviceDetail>(`/v1/devices/${id}`);
        return result;
      } catch {
        const detail = mockDeviceDetails[id];
        if (detail) return detail;
        const device = mockDevices.find((d) => d.id === id);
        if (!device) throw new Error("Device not found");
        return { device, tags: [], recent_alerts: [], software_versions: [] };
      }
    },
    enabled: !!id,
  });
}
