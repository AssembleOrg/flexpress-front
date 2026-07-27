"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { tripsApi } from "@/lib/api/trips";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import { useAuthStore } from "@/lib/stores/authStore";
import { getApiErrorMessage, isConflict } from "@/lib/utils/apiError";

/**
 * Trip Mutation Hooks
 *
 * Cierre del viaje: el charter marca que terminó y el cliente lo confirma.
 * Invalida las queries relacionadas para que ambos tableros se actualicen.
 *
 * Las transiciones accept/confirm/cancel/complete/rate se quitaron: apuntaban a
 * rutas que el backend nunca expuso. Aceptar un viaje pasa por travel-matching
 * y calificar por /feedback.
 */

/**
 * Charter completes their work (marks trip as charter_completed)
 * PUT /trips/:tripId/charter-complete
 */
export function useCharterCompleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tripId: string) => tripsApi.charterComplete(tripId),

    onSuccess: async (_result, _tripId) => {
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

    // 409: el viaje ya estaba finalizado. El backend hace la transición con el
    // estado previo en el WHERE, así que un doble click no dispara dos veces
    // las notificaciones. Para el usuario la acción salió bien.
    onError: async (error) => {
      if (isConflict(error)) {
        await queryClient.refetchQueries({ queryKey: queryKeys.trips.all });
        await queryClient.refetchQueries({ queryKey: queryKeys.matches.all });
        return;
      }
      toast.error(getApiErrorMessage(error, "Error al finalizar viaje"));
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

    onSuccess: async (_result, _tripId) => {
      // Refetch all trips (force immediate update)
      await queryClient.refetchQueries({
        queryKey: queryKeys.trips.all,
      });

      // Refetch matches to update trip status (both dashboards need instant update)
      await queryClient.refetchQueries({
        queryKey: queryKeys.matches.all,
      });

      toast.success("Viaje completado. ¡Gracias por usar FlexPress!");
    },

    onError: async (error) => {
      if (isConflict(error)) {
        await queryClient.refetchQueries({ queryKey: queryKeys.trips.all });
        await queryClient.refetchQueries({ queryKey: queryKeys.matches.all });
        return;
      }
      toast.error(getApiErrorMessage(error, "Error al confirmar finalización"));
    },
  });
}

