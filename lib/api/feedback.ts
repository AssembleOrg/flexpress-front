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
  totalFeedbacks: number;
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
      // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
      return response.data.data!;
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      // Return default response if user has no feedback
      return {
        feedbacks: [],
        averageRating: 0,
        totalFeedbacks: 0,
      };
    }
  },

  /**
   * Create feedback for a completed trip
   */
  create: async (data: CreateFeedbackRequest): Promise<Feedback> => {
    const response = await api.post<ApiResponse<Feedback>>("/feedback", data);
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
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
        "/feedback/my-feedback",
      );
      // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
      return response.data.data!;
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
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Delete feedback
   */
  delete: async (feedbackId: string): Promise<void> => {
    await api.delete(`/feedback/${feedbackId}`);
  },
};
