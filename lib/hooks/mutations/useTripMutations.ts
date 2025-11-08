"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { tripsApi } from "@/lib/api/trips";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * Trip Mutation Hooks
 *
 * Handles trip lifecycle operations: accept, confirm, cancel, complete, rate.
 * Invalidates related queries on success for automatic cache updates.
 */

/**
 * Accept a trip (charter accepts an available trip)
 * POST /trips/:tripId/accept
 */
export function useAcceptTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripId: string) => tripsApi.accept(tripId),

    onSuccess: (_result, tripId) => {
      // Invalidate all trips (invalidar por raíz)
      queryClient.invalidateQueries({
        queryKey: queryKeys.trips.all,
      });

      // Invalidate specific trip detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.trips.detail(tripId),
      });

      toast.success("¡Viaje aceptado!");
    },

    onError: () => {
      toast.error("Error al aceptar viaje");
    },
  });
}

/**
 * Confirm a trip (finalize details like price)
 * POST /trips/:tripId/confirm
 */
export function useConfirmTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tripId,
      finalPrice,
    }: {
      tripId: string;
      finalPrice?: number;
    }) => tripsApi.confirm(tripId, finalPrice),

    onSuccess: (_result, { tripId }) => {
      // Invalidate all trips (invalidar por raíz)
      queryClient.invalidateQueries({
        queryKey: queryKeys.trips.all,
      });

      // Invalidate specific trip detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.trips.detail(tripId),
      });

      toast.success("¡Viaje confirmado!");
    },

    onError: () => {
      toast.error("Error al confirmar viaje");
    },
  });
}

/**
 * Cancel a trip
 * POST /trips/:tripId/cancel
 */
export function useCancelTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, reason }: { tripId: string; reason?: string }) =>
      tripsApi.cancel(tripId, reason),

    onSuccess: (_result, { tripId }) => {
      // Invalidate all trips (invalidar por raíz)
      queryClient.invalidateQueries({
        queryKey: queryKeys.trips.all,
      });

      // Invalidate specific trip detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.trips.detail(tripId),
      });

      toast.success("Viaje cancelado");
    },

    onError: () => {
      toast.error("Error al cancelar viaje");
    },
  });
}

/**
 * Complete a trip
 * POST /trips/:tripId/complete
 */
export function useCompleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripId: string) => tripsApi.complete(tripId),

    onSuccess: (_result, tripId) => {
      // Invalidate all trips (invalidar por raíz)
      queryClient.invalidateQueries({
        queryKey: queryKeys.trips.all,
      });

      // Invalidate specific trip detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.trips.detail(tripId),
      });

      toast.success("¡Viaje completado!");
    },

    onError: () => {
      toast.error("Error al completar viaje");
    },
  });
}

/**
 * Rate a completed trip
 * POST /trips/:tripId/rate
 */
export function useRateTrip() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      tripId,
      rating,
      comment,
    }: {
      tripId: string;
      rating: number;
      comment?: string;
    }) => tripsApi.rate(tripId, rating, comment),

    onSuccess: (result, { tripId }) => {
      queryClient.setQueryData(queryKeys.trips.detail(tripId), result);

      // Invalidate feedback related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.my(user?.id || ""),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.all,
      });

      toast.success("¡Gracias por tu reseña!");
    },

    onError: () => {
      toast.error("Error al enviar reseña");
    },
  });
}
