"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports";
import { useAuthStore } from "@/lib/stores/authStore";
import type { Report } from "@/lib/types/api";
import { queryKeys } from "./queryFactory";

/**
 * Report Query Hooks (user side)
 *
 * Reports the current user made and reports filed against them.
 * Reports can change after admin resolution, so cache is kept short.
 */

/**
 * Reports the current user has made.
 * GET /reports/my-reports
 */
export function useMyReports() {
  const { user } = useAuthStore();

  return useQuery<Report[]>({
    queryKey: queryKeys.reports.mine(),
    queryFn: () => reportsApi.getMyReports(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!user?.id,
  });
}

/**
 * Reports filed against the current user.
 * GET /reports/against-me
 */
export function useReportsAgainstMe() {
  const { user } = useAuthStore();

  return useQuery<Report[]>({
    queryKey: queryKeys.reports.againstMe(),
    queryFn: () => reportsApi.getAgainstMe(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!user?.id,
  });
}
