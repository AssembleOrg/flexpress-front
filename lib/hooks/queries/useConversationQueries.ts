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
 * - staleTime: 30s (messages change rarely during chat)
 * - gcTime: 5min (keep in cache for quick navigation back)
 * - refetchOnWindowFocus: true (update if user switches tabs)
 */
export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => conversationApi.getMessages(conversationId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: !!conversationId, // Only fetch if conversationId is provided
  });
}
