"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { conversationApi } from "@/lib/api/conversations";
import { conversationKeys } from "@/lib/hooks/queries/useConversationQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import type { Message } from "@/lib/types/api";

/**
 * Send a message to a conversation
 * POST /conversations/:conversationId/messages
 *
 * Adds message to cache immediately so sender sees their own message
 * WebSocket handles real-time updates for other user
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => conversationApi.sendMessage(conversationId, content),

    retry: (failureCount, error) => {
      // Only retry on network errors, not on HTTP errors like 400/401
      if (failureCount >= 2) return false;
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        // Retry on network errors
        return (
          errorMsg.includes("network") ||
          errorMsg.includes("econnrefused") ||
          errorMsg.includes("econnreset") ||
          errorMsg.includes("socket hang up")
        );
      }
      return false;
    },

    onSuccess: (message, variables) => {
      // Add message to cache immediately so sender sees it
      queryClient.setQueryData<Message[]>(
        conversationKeys.messages(variables.conversationId),
        (old = []) => {
          // Avoid duplicates (WebSocket might have added it already)
          if (old.some((msg) => msg.id === message.id)) {
            return old;
          }
          return [...old, message];
        },
      );
    },

    onError: (error) => {
      console.error("❌ Failed to send message:", error);
      toast.error("Error al enviar mensaje. Intenta de nuevo.");
    },
  });
}

/**
 * Create a conversation from a match
 * POST /conversations/match/:matchId
 *
 * Called when a charter accepts a match to initiate the conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId }: { matchId: string }) =>
      conversationApi.createFromMatch(matchId),

    onSuccess: (conversation) => {
      console.log(
        "✅ [useCreateConversation] Conversation created:",
        conversation.id,
      );

      // Cache the conversation messages
      queryClient.setQueryData(conversationKeys.messages(conversation.id), []);

      // Invalidate conversations list so it refetches
      queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });
    },

    onError: (error) => {
      console.error(
        "❌ [useCreateConversation] Failed to create conversation:",
        error instanceof Error ? error.message : error,
      );
    },
  });
}
