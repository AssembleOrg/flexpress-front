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
    try {
      const response = await api.get<ApiResponse<Message[]>>(
        `/conversations/${conversationId}/messages`,
      );

      // 🔧 UNWRAP: Manejar doble wrapper del backend
      let messagesArray: Message[];

      if (response.data.data && typeof response.data.data === "object") {
        // Caso 1: Doble wrapper { success, data: { success, data: [...] } }
        if (
          "data" in response.data.data &&
          Array.isArray((response.data.data as { data: Message[] }).data)
        ) {
          messagesArray = (response.data.data as { data: Message[] }).data;
        }
        // Caso 2: Wrapper simple { success, data: [...] }
        else if (Array.isArray(response.data.data)) {
          messagesArray = response.data.data;
        }
        // Caso 3: Estructura inválida
        else {
          console.warn(
            "⚠️ [CONVERSATIONS] Estructura inesperada:",
            response.data.data,
          );
          return [];
        }
      } else {
        console.warn(
          "⚠️ [CONVERSATIONS] Backend devolvió data inválida o vacía:",
          response.data.data,
        );
        return [];
      }

      return messagesArray;
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
    try {
      const response = await api.post<ApiResponse<Message>>(
        `/conversations/${conversationId}/messages`,
        { content },
      );

      // Handle potential double-wrapper from backend
      // Backend may return: { success: true, data: { id, content, ... } }
      const responseData = response.data.data;

      let message: Message;
      if (
        responseData &&
        typeof responseData === "object" &&
        "data" in responseData &&
        !("id" in responseData)
      ) {
        // Double wrapper: response.data.data = { success, data }
        message = (responseData as { data: Message }).data;
      } else if (
        responseData &&
        typeof responseData === "object" &&
        "id" in responseData
      ) {
        // Direct message: response.data.data = { id, content, ... }
        message = responseData as Message;
      } else {
        throw new Error(
          "Backend no devolvió el mensaje creado con estructura válida",
        );
      }

      return message;
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
