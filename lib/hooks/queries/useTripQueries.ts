"use client";

import { useQuery } from "@tanstack/react-query";
import { tripsApi } from "@/lib/api/trips";
import { useAuthStore } from "@/lib/stores/authStore";
import { queryKeys } from "./queryFactory";

/**
 * Trip Query Hooks
 *
 * Handles fetching trips for users and charters.
 * Caching strategy:
 * - myTrips: 5min stale, 10min cache (moderate changes)
 * - availableTrips: 30s stale, 2min cache + 30s refresh (frequent changes)
 * - tripHistory: 10min stale, 30min cache (rarely changes)
 * - trip detail: 1min stale, 5min cache (status updates via WebSocket)
 */

/**
 * Get my trips (user or charter perspective)
 * Used by: User/Charter dashboard
 */
export function useMyTrips() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.trips.my(user?.id || ""),
    queryFn: () => tripsApi.getMy(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!user?.id,
  });
}

/**
 * Get available trips for charters to accept
 * Only visible to charter users
 */
export function useAvailableTrips() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.trips.available(),
    queryFn: () => tripsApi.getAvailable(),
    staleTime: 30 * 1000, // 30 seconds - trips available change frequently
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: user?.role === "charter", // Only for charters
  });
}

/**
 * Get trip history for a user or charter
 * Used by: History page
 */
export function useTripHistory() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.trips.history(user?.id || ""),
    queryFn: () => tripsApi.getHistory(),
    staleTime: 10 * 60 * 1000, // 10 minutes - history rarely changes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    enabled: !!user?.id,
  });
}

/**
 * Get a single trip by ID
 * Used by: Trip detail page
 *
 * 🔧 FIX: Added polling fallback in case WebSocket fails
 */
export function useTrip(tripId: string) {
  return useQuery({
    queryKey: queryKeys.trips.detail(tripId),
    queryFn: () => tripsApi.getById(tripId),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 15 * 1000, // 🔧 Poll every 15s as fallback (WebSocket is primary)
    enabled: !!tripId,
  });
}
