import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { mockComplianceSummaries } from "@/lib/mock-data";
import type { ComplianceSummary } from "@/types/software";
import type { PaginatedResponse } from "@/types/api";

export function useSoftwareCompliance(page = 1, per_page = 25) {
  return useQuery<PaginatedResponse<ComplianceSummary>>({
    queryKey: ["software", page, per_page],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({ page: String(page), per_page: String(per_page) });
        const result = await apiFetch<PaginatedResponse<ComplianceSummary>>(`/v1/software?${params}`);
        if (result.data.length === 0)
          return { data: mockComplianceSummaries, total: mockComplianceSummaries.length, page, per_page };
        return result;
      } catch {
        return { data: mockComplianceSummaries, total: mockComplianceSummaries.length, page, per_page };
      }
    },
  });
}
