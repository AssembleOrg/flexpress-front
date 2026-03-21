"use client";

import { useQuery } from "@tanstack/react-query";
import { feedbackApi } from "@/lib/api/feedback";
import { useAuthStore } from "@/lib/stores/authStore";
import { queryKeys } from "./queryFactory";

/**
 * Feedback Query Hooks
 *
 * Handles fetching feedback/ratings for users and trip feedback.
 * Caching strategy:
 * - userFeedback: 5min stale, 30min cache (ratings change slowly)
 * - myFeedback: 10min stale, 30min cache (user's feedback history)
 * - canGiveFeedback: 30s stale, 2min cache (checks if eligible)
 */

/**
 * Get feedback/ratings for a specific user (charter or user)
 * Used by: Charter profile, user profile, matching page
 */
export function useUserFeedback(
  userId: string,
  options?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: queryKeys.feedback.user(userId),
    queryFn: () => feedbackApi.getUserFeedback(userId),
    staleTime: 60 * 1000, // 1 minute (was 5 min — ensures refetch after feedback invalidation)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!userId,
    ...options,
  });
}

/**
 * Get all feedback I've given
 * Used by: My feedback page, profile
 */
export function useMyFeedback() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.feedback.my(user?.id || ""),
    queryFn: () => feedbackApi.getMyFeedback(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    enabled: !!user?.id,
  });
}

/**
 * Check if user can give feedback for a specific trip
 * Used by: Trip completion, feedback eligibility check
 * Supports optional React Query options (e.g., enabled)
 */
export function useCanGiveFeedback(
  tripId: string,
  options?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: [...queryKeys.feedback.all, "can-give", tripId],
    queryFn: () => feedbackApi.canGiveFeedback(tripId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!tripId,
    ...options,
  });
}

