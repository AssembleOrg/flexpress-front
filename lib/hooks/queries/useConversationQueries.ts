"use client";

import { useQuery } from "@tanstack/react-query";
import { conversationApi } from "@/lib/api/conversations";
import { getSocketConnected } from "@/lib/hooks/useWebSocket";

/**
 * Query key factory for conversation-related queries
 */
export const conversationKeys = {
  all: ["conversations"] as const,
  messages: (conversationId: string) =>
    [...conversationKeys.all, "messages", conversationId] as const,
};

/**
 * Fetch all messages from a conversation.
 *
 * Patrón: socket-first, polling como circuit breaker.
 *
 * - Socket conectado → polling apagado. El cache se actualiza via setQueryData
 *   en useWebSocket cuando llega 'new-message'. 0 req al backend.
 * - Socket caído → polling adaptativo activa como fallback automático:
 *     < 1 min de inactividad  → 5s
 *     < 5 min                 → 10s
 *     > 5 min                 → 15s
 * - Error de backend → polling se detiene, se reanuda via refetchOnReconnect.
 *
 * Con 15 chats activos y socket estable: 0 req/min (antes: ~180-300 req/min).
 * Si el socket cae: recuperación transparente sin intervención del usuario.
 */
export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => conversationApi.getMessages(conversationId),
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: (query) => {
      // Socket activo → el cache ya recibe los mensajes en tiempo real. No polling.
      if (getSocketConnected()) return false;

      // Socket caído o ausente → activar polling adaptativo como fallback.
      if (query.state.status === 'error') return false;

      const data = query.state.data;
      if (!data || data.length === 0) return 5000;

      const lastMessage = data[data.length - 1];
      if (!lastMessage?.createdAt) return 5000;

      const timeSinceLastMessage = Date.now() - new Date(lastMessage.createdAt).getTime();
      if (timeSinceLastMessage < 60_000) return 5_000;
      if (timeSinceLastMessage < 300_000) return 10_000;
      return 15_000;
    },
    enabled: !!conversationId,
  });
}
