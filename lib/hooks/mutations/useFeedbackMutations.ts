"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { feedbackApi } from "@/lib/api/feedback";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * Feedback Mutation Hooks
 *
 * Handles creating, updating, and deleting feedback/ratings.
 */

/**
 * Create feedback for a trip/user
 * POST /feedback
 *
 * Features:
 * - Optimistic update: immediately marks trip as feedback given
 * - Invalidates canGiveFeedback query so button disappears
 * - Invalidates user feedback so profile rating updates
 * - Handles errors gracefully
 */
export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof feedbackApi.create>[0]) =>
      feedbackApi.create(data),

    onMutate: async (newFeedback) => {
      // Cancel any ongoing queries for this trip's feedback eligibility
      await queryClient.cancelQueries({
        queryKey: [...queryKeys.feedback.all, "can-give", newFeedback.tripId],
      });

      // Snapshot previous state for potential rollback
      const previousCanGive = queryClient.getQueryData([
        ...queryKeys.feedback.all,
        "can-give",
        newFeedback.tripId,
      ]);

      // Optimistic update: mark that user can no longer give feedback
      queryClient.setQueryData(
        [...queryKeys.feedback.all, "can-give", newFeedback.tripId],
        false,
      );

      return { previousCanGive };
    },

    onSuccess: (_result, variables) => {
      // Invalidate ALL feedback data — covers any ID mismatch edge case
      // between result.toUserId and the charter.charterId used as query key
      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.all,
      });

      toast.success("¡Gracias por tu calificación!");
    },

    onError: (_error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousCanGive !== undefined) {
        queryClient.setQueryData(
          [...queryKeys.feedback.all, "can-give", variables.tripId],
          context.previousCanGive,
        );
      }

      toast.error("No se pudo enviar la calificación. Intenta de nuevo.");
    },
  });
}

/**
 * Update existing feedback
 * PUT /feedback/:feedbackId
 */
export function useUpdateFeedback() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      feedbackId,
      data,
    }: {
      feedbackId: string;
      data: Parameters<typeof feedbackApi.update>[1];
    }) => feedbackApi.update(feedbackId, data),

    onSuccess: (result) => {
      // Invalidate the recipient's feedback
      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.user(result.toUserId),
      });

      // Invalidate my feedback
      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.my(user?.id || ""),
      });

      // Invalidate specific feedback detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.detail(result.id),
      });

      toast.success("Reseña actualizada");
    },

    onError: () => {
      toast.error("Error al actualizar reseña");
    },
  });
}

/**
 * Delete feedback
 * DELETE /feedback/:feedbackId
 */
export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feedbackId,
      toUserId: _toUserId,
    }: {
      feedbackId: string;
      toUserId: string;
    }) => feedbackApi.delete(feedbackId),

    onSuccess: (_result, { toUserId }) => {
      // Invalidate all feedback (invalidar por raíz)
      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.all,
      });

      // Also invalidate specific user feedback
      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.user(toUserId),
      });

      toast.success("Reseña eliminada");
    },

    onError: () => {
      toast.error("Error al eliminar reseña");
    },
  });
}
