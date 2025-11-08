"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { conversationApi } from "@/lib/api/conversations";
import { conversationKeys } from "@/lib/hooks/queries/useConversationQueries";
import { useSocketEmit } from "@/lib/hooks/useWebSocket";
import type { Message } from "@/lib/types/api";

/**
 * Send a message to a conversation
 * POST /conversations/:conversationId/messages
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const socketEmit = useSocketEmit();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => conversationApi.sendMessage(conversationId, content),

    onSuccess: (message, variables) => {
      console.log("✅ [useSendMessage] Message sent successfully");
      console.log("📝 Message:", message);

      // Validar que el mensaje devuelto es válido
      if (!message?.id || !message?.content) {
        console.error(
          "❌ [useSendMessage] Backend devolvió mensaje inválido:",
          message,
        );
        toast.error("Error: Mensaje inválido del servidor");
        return;
      }

      // Emit via WebSocket for real-time delivery to other user
      socketEmit.sendMessage(variables.conversationId, message.content);

      // Update React Query cache with the new message
      queryClient.setQueryData(
        conversationKeys.messages(variables.conversationId),
        (old: Message[] | undefined) => {
          // Si no hay data previa, devolver array con el nuevo mensaje
          if (!old || !Array.isArray(old)) return [message];

          // Prevent duplicates (same message ID)
          const isDuplicate = old.some((msg) => msg?.id === message.id);
          if (isDuplicate) return old;

          return [...old, message];
        },
      );

      console.log("✅ [useSendMessage] Cache updated with new message");
    },

    onError: (error) => {
      console.error("❌ [useSendMessage] Failed to send message:", error);
      toast.error("Error al enviar mensaje. Intenta de nuevo.");
    },
  });
}

/**
 * Notify that user is typing (for typing indicator in other user's chat)
 * Note: This is emitted via WebSocket, not HTTP
 */
export function useNotifyTyping() {
  const socketEmit = useSocketEmit();

  return {
    notifyTyping: (conversationId: string) => {
      socketEmit.notifyTyping(conversationId);
    },

    notifyStopTyping: (conversationId: string) => {
      socketEmit.notifyStopTyping(conversationId);
    },
  };
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
