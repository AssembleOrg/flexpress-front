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
export function useUserFeedback(userId: string) {
  return useQuery({
    queryKey: queryKeys.feedback.user(userId),
    queryFn: () => feedbackApi.getUserFeedback(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes - ratings change slowly
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    enabled: !!userId,
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

/**
 * Get ratings for a specific charter
 * Alias for useUserFeedback with more descriptive name
 * Used by: Charter cards showing average rating
 * Supports optional React Query options (e.g., enabled)
 */
export function useCharterRating(
  charterId: string,
  options?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: queryKeys.feedback.user(charterId),
    queryFn: () => feedbackApi.getUserFeedback(charterId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    enabled: !!charterId,
    ...options,
  });
}
