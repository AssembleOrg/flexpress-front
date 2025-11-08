/**
 * Conversations API Service
 * Handles all chat-related API calls
 */

import api from "@/lib/api";
import type { ApiResponse, Conversation, Message } from "@/lib/types/api";

export interface CreateMessageRequest {
  content: string;
}

export const conversationApi = {
  /**
   * Create a new conversation from an accepted match
   * POST /conversations/match/:matchId
   *
   * Called automatically when a charter accepts a match.
   * Returns the created conversation or existing one if already created.
   */
  createFromMatch: async (matchId: string): Promise<Conversation> => {
    console.log("📝 [CONVERSATIONS] Creating conversation for match:", matchId);

    try {
      const response = await api.post<ApiResponse<Conversation>>(
        `/conversations/match/${matchId}`,
        {},
      );

      // Validar respuesta del backend
      if (!response.data.data || !response.data.data.id) {
        console.error(
          "❌ [CONVERSATIONS] Backend devolvió conversación inválida:",
          response.data.data,
        );
        throw new Error(
          "Backend devolvió una conversación sin estructura válida",
        );
      }

      console.log(
        "✅ [CONVERSATIONS] Conversation created/retrieved:",
        response.data.data.id,
      );

      return response.data.data;
    } catch (error) {
      console.error("❌ [CONVERSATIONS] Failed to create conversation:", error);
      throw error;
    }
  },

  /**
   * Get all messages from a conversation (chat history)
   * GET /conversations/:conversationId/messages
   */
  getMessages: async (conversationId: string): Promise<Message[]> => {
    console.log("🔍 [CONVERSATIONS] Fetching messages for:", conversationId);

    try {
      const response = await api.get<ApiResponse<Message[]>>(
        `/conversations/${conversationId}/messages`,
      );

      // Validar que la respuesta contiene datos
      if (!response.data.data || !Array.isArray(response.data.data)) {
        console.warn(
          "⚠️ [CONVERSATIONS] Backend devolvió data inválida o vacía:",
          response.data.data,
        );
        return [];
      }

      console.log(
        "✅ [CONVERSATIONS] Messages fetched:",
        response.data.data.length,
      );

      return response.data.data;
    } catch (error) {
      console.error("❌ [CONVERSATIONS] Failed to fetch messages:", error);
      throw error;
    }
  },

  /**
   * Send a new message to a conversation
   * POST /conversations/:conversationId/messages
   */
  sendMessage: async (
    conversationId: string,
    content: string,
  ): Promise<Message> => {
    console.log("💬 [CONVERSATIONS] Sending message to:", conversationId);
    console.log("📝 Content:", content);

    try {
      const response = await api.post<ApiResponse<Message>>(
        `/conversations/${conversationId}/messages`,
        { content },
      );

      // Validar que el backend devolvió el mensaje creado
      if (!response.data.data || !response.data.data.id) {
        throw new Error(
          "Backend no devolvió el mensaje creado con estructura válida",
        );
      }

      console.log("✅ [CONVERSATIONS] Message sent successfully");
      console.log("📊 Message ID:", response.data.data.id);

      return response.data.data;
    } catch (error) {
      console.error("❌ [CONVERSATIONS] Failed to send message:", error);

      // Extract error details
      if (error instanceof Error && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: {
              message?: string;
              error?: string;
            };
          };
        };

        console.error(
          "Status:",
          axiosError.response?.status,
          "Message:",
          axiosError.response?.data?.message ||
            axiosError.response?.data?.error,
        );
      }

      throw error;
    }
  },
};
