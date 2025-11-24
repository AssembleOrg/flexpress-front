"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { reportsApi } from "@/lib/api/reports";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";

/**
 * Report Mutation Hooks
 *
 * Handles creating and managing abuse/harassment reports.
 */

/**
 * Create a report for a user/conversation
 * POST /api/v1/reports
 *
 * Features:
 * - Shows toast confirmation on success
 * - Invalidates admin reports query (prepares for future admin dashboard)
 * - Handles errors gracefully
 */
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof reportsApi.create>[0]) =>
      reportsApi.create(data),

    onSuccess: () => {
      // Show success toast
      toast.success(
        "Tu reporte ha sido enviado. Un administrador lo revisará pronto.",
      );

      // Invalidate admin reports query (prepares for future admin moderation dashboard)
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.reports.all(),
      });
    },

    onError: (error) => {
      // Show error toast with helpful message
      const errorMessage =
        error instanceof Error ? error.message : "Error al enviar el reporte";
      toast.error(`No se pudo enviar el reporte: ${errorMessage}`);
    },
  });
}

/**
 * Get reports for a specific conversation
 * (Optional - for future moderation features)
 */
export function useGetConversationReports(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reportsApi.getByConversation(conversationId),

    onSuccess: () => {
      // Refresh reports cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.reports.all(),
      });
    },
  });
}
