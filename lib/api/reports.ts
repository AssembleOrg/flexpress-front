/**
 * Reports API Service
 * Handles reporting users/conversations for abuse, harassment, or inappropriate behavior
 */

import api from "@/lib/api";
import type { ApiResponse, Report } from "@/lib/types/api";

export interface CreateReportRequest {
  conversationId: string;
  reportedId: string;
  reason: string;
  description?: string;
}

export const reportsApi = {
  /**
   * Create a report for a user/conversation
   * POST /api/v1/reports
   */
  create: async (data: CreateReportRequest): Promise<Report> => {
    const response = await api.post<ApiResponse<Report>>("/reports", data);
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Get reports for a specific conversation
   * (Optional - for future moderation features)
   */
  getByConversation: async (conversationId: string): Promise<Report[]> => {
    try {
      const response = await api.get<ApiResponse<Report[]>>(
        `/reports/conversation/${conversationId}`,
      );
      // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
      return response.data.data!;
    } catch (error) {
      console.error("Error fetching reports for conversation:", error);
      return [];
    }
  },

  /**
   * Get reports by current user (reports they submitted)
   * (Optional - for future "My Reports" page)
   */
  getMyReports: async (): Promise<Report[]> => {
    try {
      const response = await api.get<ApiResponse<Report[]>>("/reports/my");
      // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
      return response.data.data!;
    } catch (error) {
      console.error("Error fetching my reports:", error);
      return [];
    }
  },
};
