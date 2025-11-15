"use client";

import { useQuery } from "@tanstack/react-query";
import { conversationApi } from "@/lib/api/conversations";

/**
 * Query key factory for conversation-related queries
 */
export const conversationKeys = {
  all: ["conversations"] as const,
  messages: (conversationId: string) =>
    [...conversationKeys.all, "messages", conversationId] as const,
};

/**
 * Fetch all messages from a conversation
 * Used by: ChatWindow component
 *
 * Caching strategy:
 * - staleTime: 2h (sufficient for complete negotiation + transport cycle)
 * - gcTime: 2h (keep in cache for full duration of trip)
 * - refetchOnWindowFocus: true (update if user switches tabs)
 * - refetchOnReconnect: true (update when connection restored)
 *
 * Why 2 hours? Average time from match acceptance to trip completion.
 * - Negotiation: 15-30 min
 * - Transport: 60-90 min
 * - Buffer: 30+ min
 */
export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => conversationApi.getMessages(conversationId),
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!conversationId, // Only fetch if conversationId is provided
  });
}
