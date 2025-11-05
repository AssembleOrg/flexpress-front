"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { travelMatchingApi } from "@/lib/api/travelMatching";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import { useAuthStore } from "@/lib/stores/authStore";
import { useTravelMatchStore } from "@/lib/stores/travelMatchStore";

/**
 * Travel Matching Mutation Hooks
 *
 * Handles creating, selecting, and responding to travel matches.
 * Uses optimistic updates where appropriate and auto-invalidates cache.
 */

/**
 * Create a new travel match (user searches for charters)
 * POST /travel-matching/matches
 */
export function useCreateMatch() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof travelMatchingApi.create>[0]) =>
      travelMatchingApi.create(data),

    onSuccess: (result) => {
      // Cache the new match
      queryClient.setQueryData(
        queryKeys.matches.detail(result.match.id),
        result.match,
      );

      // Invalidate user's matches list so it refetches
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.user(user?.id || ""),
      });

      // Clear search form state
      useTravelMatchStore.getState().clearSearchForm?.();

      toast.success(
        `¡${result.availableCharters.length} chóferes encontrados!`,
      );
    },

    onError: () => {
      toast.error("Error al crear búsqueda de viaje");
    },
  });
}

/**
 * Select a charter for a match (user chooses driver)
 * PUT /travel-matching/matches/:matchId/select-charter
 */
export function useSelectCharter() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      matchId,
      charterId,
    }: {
      matchId: string;
      charterId: string;
    }) => travelMatchingApi.selectCharter(matchId, charterId),

    onSuccess: (_result, { matchId }) => {
      // Invalidate user's matches list
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.user(user?.id || ""),
      });

      // Invalidate specific match detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(matchId),
      });

      toast.success("Chófer seleccionado. Esperando confirmación...");
    },

    onError: () => {
      toast.error("Error al seleccionar chófer");
    },
  });
}

/**
 * Charter responds to a match (accept or reject)
 * PUT /travel-matching/charter/matches/:matchId/respond
 */
export function useRespondToMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, accept }: { matchId: string; accept: boolean }) =>
      travelMatchingApi.respondToMatch(matchId, accept),

    onSuccess: (result, { matchId, accept }) => {
      // Update the match
      queryClient.setQueryData(queryKeys.matches.detail(matchId), result);

      // Invalidate all matches (invalidar por raíz)
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.all,
      });

      if (accept) {
        toast.success("¡Solicitud aceptada!");
      } else {
        toast.success("Solicitud rechazada");
      }
    },

    onError: () => {
      toast.error("Error al responder solicitud");
    },
  });
}

/**
 * Create a trip from an accepted match
 * POST /travel-matching/matches/:matchId/create-trip
 */
export function useCreateTripFromMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) =>
      travelMatchingApi.createTripFromMatch(matchId),

    onSuccess: () => {
      // Invalidate everything related to matches and trips
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.all,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.trips.all,
      });

      toast.success("¡Viaje confirmado!");
    },

    onError: () => {
      toast.error("Error al crear viaje");
    },
  });
}

/**
 * Toggle charter availability status
 * PUT /travel-matching/charter/availability
 */
export function useToggleAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isAvailable: boolean) =>
      travelMatchingApi.toggleAvailability(isAvailable),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.profile(),
      });

      toast.success("Disponibilidad actualizada");
    },

    onError: () => {
      toast.error("Error al actualizar disponibilidad");
    },
  });
}

/**
 * Update charter's origin location
 * PUT /travel-matching/charter/origin
 */
export function useUpdateCharterOrigin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      latitude,
      longitude,
      address,
    }: {
      latitude: string;
      longitude: string;
      address: string;
    }) => travelMatchingApi.updateCharterOrigin(latitude, longitude, address),

    onSuccess: () => {
      // Invalidate profile (may contain origin)
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.profile(),
      });

      toast.success("Ubicación actualizada");
    },

    onError: () => {
      toast.error("Error al actualizar ubicación");
    },
  });
}
