import { type UseQueryOptions, useQuery } from "@tanstack/react-query";

/**
 * Query Key Factory
 *
 * Centralized query key generation for consistent cache identification.
 * Query keys follow a hierarchical structure:
 *   - Top level: resource type (auth, matches, trips, feedback)
 *   - Middle levels: filters/identifiers (userId, role, status)
 *   - Leaf level: specific operation
 *
 * Benefits:
 * - Easy to invalidate related queries
 * - Type-safe query key generation
 * - Prevents key typos
 * - Consistent cache structure
 */

export const queryKeys = {
  // Auth
  auth: {
    all: ["auth"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },

  // Travel Matching
  matches: {
    all: ["matches"] as const,
    user: (userId: string) =>
      [...queryKeys.matches.all, "user", userId] as const,
    charter: (userId: string) =>
      [...queryKeys.matches.all, "charter", userId] as const,
    detail: (matchId: string) => [...queryKeys.matches.all, matchId] as const,
  },

  // Trips
  trips: {
    all: ["trips"] as const,
    my: (userId: string) => [...queryKeys.trips.all, "my", userId] as const,
    available: () => [...queryKeys.trips.all, "available"] as const,
    history: (userId: string) =>
      [...queryKeys.trips.all, "history", userId] as const,
    detail: (tripId: string) => [...queryKeys.trips.all, tripId] as const,
  },

  // Feedback / Ratings
  feedback: {
    all: ["feedback"] as const,
    user: (userId: string) =>
      [...queryKeys.feedback.all, "user", userId] as const,
    my: (userId: string) => [...queryKeys.feedback.all, "my", userId] as const,
    detail: (feedbackId: string) =>
      [...queryKeys.feedback.all, feedbackId] as const,
  },
};

/**
 * Default Query Options
 *
 * Provides sensible defaults for different query types.
 * Can be overridden per-query.
 */
export const defaultQueryOptions = {
  // High-frequency changes (matches, available trips)
  highFrequency: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },

  // Moderate changes (user's trips, feedback)
  moderate: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },

  // Low frequency changes (profile, user feedback)
  lowFrequency: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
};

/**
 * Custom useQuery hook wrapper
 *
 * Adds type safety and consistent error handling.
 * Usage: useTypedQuery<ReturnType>(queryKey, fetchFn, options)
 */
export function useTypedQuery<TData = unknown>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">,
) {
  return useQuery<TData>({
    queryKey,
    queryFn,
    ...options,
  });
}
