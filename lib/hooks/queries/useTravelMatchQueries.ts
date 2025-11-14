"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { travelMatchingApi } from "@/lib/api/travelMatching";
import { useAuthStore } from "@/lib/stores/authStore";
import { queryKeys } from "./queryFactory";

/**
 * Travel Matching Query Hooks
 *
 * Handles fetching travel matches for both users and charters.
 * Caching strategy:
 * - userMatches: 10s stale, 3min cache (user waiting for response)
 * - charterMatches: 5s stale, 2min cache + 10s refresh (real-time dashboard)
 * - match detail: 15s stale, 5min cache (status updates via WebSocket)
 */

/**
 * Get all matches for the authenticated user
 * Used by: Client dashboard, matching page
 */
export function useUserMatches() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.matches.user(user?.id || ""),
    queryFn: () => travelMatchingApi.getUserMatches(),
    staleTime: 10 * 1000, // 10 seconds - user waiting for charter response
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!user?.id, // Only fetch if logged in
  });
}

/**
 * Get all pending matches for the authenticated charter
 * Used by: Charter dashboard
 */
export function useCharterMatches() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.matches.charter(user?.id || ""),
    queryFn: () => travelMatchingApi.getCharterMatches(),
    staleTime: 5 * 1000, // 5 seconds - charters need near real-time updates
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 10 * 1000, // Auto-refresh every 10 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: user?.role === "charter", // Only fetch if charter
  });
}

/**
 * Get a single match by ID
 * Used by: Match detail page, matching page
 *
 * Includes polling fallback: polls every 5 seconds as a fallback in case
 * WebSocket updates are missed. Polling stops automatically when match
 * leaves "pending" state (via staleTime and refetchOnWindowFocus).
 */
export function useMatch(matchId: string) {
  return useQuery({
    queryKey: queryKeys.matches.detail(matchId),
    queryFn: () => travelMatchingApi.getMatch(matchId),
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 1000, // Poll every 5s as fallback (will stop refetching when match is no longer pending)
    enabled: !!matchId, // Only fetch if matchId provided
  });
}
