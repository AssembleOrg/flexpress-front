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
    const raw = response.data.data;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && "data" in raw) {
      const inner = (raw as { data: unknown }).data;
      if (Array.isArray(inner)) return inner as Report[];
    }
    return [];
  },

  /**
   * Get reports filed against the current user
   * GET /reports/against-me
   */
  getAgainstMe: async (): Promise<Report[]> => {
    const response = await api.get<ApiResponse<Report[]>>(
      "/reports/against-me",
    );
    const raw = response.data.data;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && "data" in raw) {
      const inner = (raw as { data: unknown }).data;
      if (Array.isArray(inner)) return inner as Report[];
    }
    return [];
  },
};
