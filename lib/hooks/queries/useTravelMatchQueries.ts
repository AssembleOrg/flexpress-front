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
 * - charterMatches: 5s stale, 2min cache + 30s refresh (WebSocket primary)
 * - match detail: 15s stale, 5min cache + 15s refresh (WebSocket primary)
 */

/**
 * Get all matches for the authenticated user
 * Used by: Client dashboard, matching page
 *
 * 🔧 FIX: Smart polling - only polls when there's an accepted match without conversationId
 * This ensures the navbar updates quickly after charter accepts, without constant polling.
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
    // 🔧 Smart polling: Only poll if there's an incomplete match
    refetchInterval: (query) => {
      const matches = query.state.data || [];
      // Check if any accepted match is missing conversationId (DB field)
      const hasIncompleteMatch = matches.some(
        (match) => match.status === "accepted" && !match.conversationId,
      );
      // Poll every 5s if incomplete, otherwise no polling
      return hasIncompleteMatch ? 5 * 1000 : false;
    },
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
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds (WebSocket handles real-time)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: user?.role === "charter", // Only fetch if charter
  });
}

/**
 * Get a single match by ID
 * Used by: Match detail page, matching page
 *
 * Includes polling fallback: polls every 15 seconds as a fallback in case
 * WebSocket updates are missed. WebSocket is the primary update mechanism.
 */
export function useMatch(matchId: string) {
  return useQuery({
    queryKey: queryKeys.matches.detail(matchId),
    queryFn: () => travelMatchingApi.getMatch(matchId),
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 15 * 1000, // Poll every 15s as fallback (WebSocket handles real-time)
    enabled: !!matchId, // Only fetch if matchId provided
  });
}
