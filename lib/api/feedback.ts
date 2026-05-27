/**
 * Feedback API Service
 * Handles user feedback and ratings for trips
 */

import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types/api";

export interface Feedback {
  id: string;
  tripId: string;
  fromUserId: string;
  toUserId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackRequest {
  tripId: string;
  toUserId: string;
  rating: number; // 1-5
  comment?: string;
}

export interface UserFeedbackResponse {
  feedbacks: Feedback[];
  averageRating: number;
  totalCount: number;
  ratingDistribution?: Record<string, number>;
}

// El backend tiene un ResponseInterceptor global que envuelve toda respuesta
// en { data, message, success }. Los endpoints de feedback además devuelven
// su propio { success, data }, así que el payload llega doble-envuelto. Si
// detectamos ese wrapper interno, extraemos su .data; si no, devolvemos tal
// cual (compatibilidad si el backend deja de doble-envolver). Mismo patrón que
// lib/api/travelMatching.ts.
function unwrap<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const feedbackApi = {
  /**
   * Get feedback for a specific user
   */
  getUserFeedback: async (userId: string): Promise<UserFeedbackResponse> => {
    try {
      const response = await api.get<ApiResponse<UserFeedbackResponse>>(
        `/feedback/user/${userId}`,
      );
      return unwrap<UserFeedbackResponse>(response.data.data);
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      // Return default response if user has no feedback
      return {
        feedbacks: [],
        averageRating: 0,
        totalCount: 0,
      };
    }
  },

  /**
   * Get feedback left on a specific trip
   */
  getTripFeedback: async (tripId: string): Promise<Feedback[]> => {
    try {
      const response = await api.get<ApiResponse<Feedback[]>>(
        `/feedback/trip/${tripId}`,
      );
      return unwrap<Feedback[]>(response.data.data) ?? [];
    } catch (error) {
      console.error("Error fetching trip feedback:", error);
      return [];
    }
  },

  /**
   * Create feedback for a completed trip
   */
  create: async (data: CreateFeedbackRequest): Promise<Feedback> => {
    const response = await api.post<ApiResponse<Feedback>>("/feedback", data);
    return unwrap<Feedback>(response.data.data);
  },

  /**
   * Check if user can give feedback for a trip
   */
  canGiveFeedback: async (tripId: string): Promise<boolean> => {
    try {
      const response = await api.get<ApiResponse<{ canGive: boolean }>>(
        `/feedback/can-give/${tripId}`,
      );
      // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
      return response.data.data!.canGive;
    } catch (error) {
      console.error("Error checking feedback availability:", error);
      return false;
    }
  },

  /**
   * Get all feedback given by current user
   */
  getMyFeedback: async (): Promise<Feedback[]> => {
    try {
      const response = await api.get<ApiResponse<Feedback[]>>(
        "/feedback/my-feedbacks",
      );
      return unwrap<Feedback[]>(response.data.data) ?? [];
    } catch (error) {
      console.error("Error fetching my feedback:", error);
      return [];
    }
  },

  /**
   * Update feedback for a trip
   */
  update: async (
    feedbackId: string,
    data: Partial<CreateFeedbackRequest>,
  ): Promise<Feedback> => {
    const response = await api.put<ApiResponse<Feedback>>(
      `/feedback/${feedbackId}`,
      data,
    );
    return unwrap<Feedback>(response.data.data);
  },

  /**
   * Delete feedback
   */
  delete: async (feedbackId: string): Promise<void> => {
    await api.delete(`/feedback/${feedbackId}`);
  },
};
