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
   * Get reports made by the current user
   * GET /reports/my-reports
   */
  getMyReports: async (): Promise<Report[]> => {
    const response = await api.get<ApiResponse<Report[]>>(
      "/reports/my-reports",
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Get reports filed against the current user
   * GET /reports/against-me
   */
  getAgainstMe: async (): Promise<Report[]> => {
    const response = await api.get<ApiResponse<Report[]>>(
      "/reports/against-me",
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },
};
