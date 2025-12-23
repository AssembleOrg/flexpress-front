'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tripsApi } from '@/lib/api/trips';
import { queryKeys } from '@/lib/hooks/queries/queryFactory';
import { useAuthStore } from '@/lib/stores/authStore';

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

    onSuccess: async (_result, tripId) => {
      // Refetch all trips (force immediate update)
      await queryClient.refetchQueries({
        queryKey: queryKeys.trips.all,
      });

      toast.success('¡Viaje aceptado!');
    },

    onError: () => {
      toast.error('Error al aceptar viaje');
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

    onSuccess: async (_result, { tripId }) => {
      // Refetch all trips (force immediate update)
      await queryClient.refetchQueries({
        queryKey: queryKeys.trips.all,
      });

      toast.success('¡Viaje confirmado!');
    },

    onError: () => {
      toast.error('Error al confirmar viaje');
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

    onSuccess: async (_result, { tripId }) => {
      // Refetch all trips (force immediate update)
      await queryClient.refetchQueries({
        queryKey: queryKeys.trips.all,
      });

      toast.success('Viaje cancelado');
    },

    onError: () => {
      toast.error('Error al cancelar viaje');
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

    onSuccess: async (_result, tripId) => {
      // Refetch all trips (force immediate update)
      await queryClient.refetchQueries({
        queryKey: queryKeys.trips.all,
      });

      // Refetch matches to update tripId reference
      await queryClient.refetchQueries({
        queryKey: queryKeys.matches.all,
      });

      toast.success('¡Viaje completado!');
    },

    onError: () => {
      toast.error('Error al completar viaje');
    },
  });
}

/**
 * Charter completes their work (marks trip as charter_completed)
 * PUT /trips/:tripId/charter-complete
 */
export function useCharterCompleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripId: string) => tripsApi.charterComplete(tripId),

    onSuccess: async (_result, tripId) => {
      // Refetch all trips (force immediate update)
      await queryClient.refetchQueries({
        queryKey: queryKeys.trips.all,
      });

      // Refetch matches to update trip status (client needs to see change)
      await queryClient.refetchQueries({
        queryKey: queryKeys.matches.all,
      });

      // Toast movido al componente para evitar duplicación
    },

    onError: () => {
      toast.error('Error al finalizar viaje');
    },
  });
}

/**
 * Client confirms reception of work (marks trip as completed)
 * PUT /trips/:tripId/client-confirm
 */
export function useClientConfirmCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripId: string) => tripsApi.clientConfirm(tripId),

    onSuccess: async (_result, tripId) => {
      // Refetch all trips (force immediate update)
      await queryClient.refetchQueries({
        queryKey: queryKeys.trips.all,
      });

      // Refetch matches to update trip status (both dashboards need instant update)
      await queryClient.refetchQueries({
        queryKey: queryKeys.matches.all,
      });

      toast.success('Viaje completado. ¡Gracias por usar FlexPress!');
    },

    onError: () => {
      toast.error('Error al confirmar finalización');
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
        queryKey: queryKeys.feedback.my(user?.id || ''),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.feedback.all,
      });

      toast.success('¡Gracias por tu reseña!');
    },

    onError: () => {
      toast.error('Error al enviar reseña');
    },
  });
}
