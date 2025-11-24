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
 * Adaptive polling strategy (React Query as source of truth):
 * - Adjusts polling frequency based on chat activity
 * - Active chat (< 1 min idle) → 5 seconds
 * - Moderate idle (< 5 min) → 10 seconds
 * - Long idle (> 5 min) → 15 seconds
 *
 * Why this approach:
 * - Simple and reliable (no WebSocket race conditions)
 * - Chat works even if WebSocket fails
 * - Intelligent resource usage (saves 50-70% requests on idle chats)
 * - Single source of truth (React Query cache)
 * - Proven to work (original working approach)
 *
 * Mobile-friendly: Reduces data consumption while maintaining good UX
 */
export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => conversationApi.getMessages(conversationId),
    staleTime: 0, // Always stale - always allows refetch
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache while navigating
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when connection restored
    refetchInterval: (query) => {
      // Adaptive polling based on activity
      const data = query.state.data;
      if (!data || data.length === 0) return 5000; // Empty chat → 5s

      const lastMessage = data[data.length - 1];
      if (!lastMessage?.createdAt) return 5000; // Defensive: invalid message → 5s

      const timeSinceLastMessage =
        Date.now() - new Date(lastMessage.createdAt).getTime();

      // Recent activity → fast polling (5s)
      if (timeSinceLastMessage < 60000) return 5000; // < 1 minute

      // Moderate idle → medium polling (10s)
      if (timeSinceLastMessage < 300000) return 10000; // < 5 minutes

      // Long idle → slow polling (15s)
      return 15000; // > 5 minutes
    },
    enabled: !!conversationId, // Only fetch if conversationId is provided
  });
}
