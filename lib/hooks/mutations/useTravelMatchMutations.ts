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

      // Update Zustand store with match and available charters
      // availableCharters is client state (temporary, not persisted in backend)
      // It's shown to the user to choose a charter, then cleared
      useTravelMatchStore.getState().setCurrentMatch(result.match);
      useTravelMatchStore
        .getState()
        .setAvailableCharters(result.availableCharters);

      // Clear search form state
      useTravelMatchStore.getState().clearSearchForm?.();

      toast.success(
        `¡${result.availableCharters.length} chóferes encontrados!`,
      );
    },

    onError: (error) => {
      console.error("❌ useCreateMatch error:", error);
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

    onSuccess: async (_result, { matchId }) => {
      console.log("🔄 [SELECT] Starting cache invalidation");

      // Invalidate user's matches list and WAIT for refetch
      await queryClient.invalidateQueries({
        queryKey: queryKeys.matches.user(user?.id || ""),
      });
      console.log("✅ [SELECT] User matches invalidated");

      // Invalidate specific match detail and WAIT for refetch
      await queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(matchId),
      });
      console.log("✅ [SELECT] Match detail invalidated");

      toast.success("Chófer seleccionado. Esperando confirmación...");
    },

    onError: (error) => {
      console.error("❌ useSelectCharter error:", error);
      toast.error("Error al seleccionar chófer");
    },
  });
}

/**
 * Charter responds to a match (accept or reject)
 * PUT /travel-matching/charter/matches/:matchId/respond
 *
 * Note: Conversation creation is handled by a reactive watcher in DriverDashboard
 * when it detects an accepted match without a conversation.
 */
export function useRespondToMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, accept }: { matchId: string; accept: boolean }) =>
      travelMatchingApi.respondToMatch(matchId, accept),

    onSuccess: (result, { matchId, accept }) => {
      // Update the match in cache
      queryClient.setQueryData(queryKeys.matches.detail(matchId), result);

      // Invalidate all matches to ensure fresh data from server
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.all,
      });

      // Show appropriate toast
      if (accept) {
        toast.success("¡Solicitud aceptada!");
      } else {
        toast.success("Solicitud rechazada");
      }

      // Note: Conversation creation will be triggered by the reactive watcher
      // in DriverDashboard when it detects status='accepted' without conversationId
    },

    onError: (error) => {
      console.error("❌ useRespondToMatch error:", error);
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

    onError: (error) => {
      console.error("❌ useCreateTripFromMatch error:", error);
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

    onError: (error) => {
      console.error("❌ useToggleAvailability error:", error);
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

    onError: (error) => {
      console.error("❌ useUpdateCharterOrigin error:", error);
      toast.error("Error al actualizar ubicación");
    },
  });
}
