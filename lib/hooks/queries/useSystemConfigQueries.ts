"use client";

import { useQuery } from "@tanstack/react-query";
import { systemConfigApi } from "@/lib/api/systemConfig";
import { queryKeys } from "./queryFactory";

/**
 * System Configuration Query Hooks
 *
 * Handles fetching public pricing configuration.
 * Caching strategy:
 * - publicPricing: 10min stale, 30min cache (pricing config changes rarely)
 */

/**
 * Get public pricing configuration (no auth required)
 * Returns creditsPerKm, minimumCharge, and creditPrice
 * Used by: Credit purchase modal to display rates and calculate dynamic packages
 */
export function usePublicPricing() {
  return useQuery({
    queryKey: queryKeys.systemConfig.publicPricing(),
    queryFn: () => systemConfigApi.getPublicPricing(),
    staleTime: 10 * 60 * 1000, // 10 minutes - pricing config changes rarely
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}
