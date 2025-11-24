"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { travelMatchingApi } from "@/lib/api/travelMatching";
import { conversationApi } from "@/lib/api/conversations";
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
      // Clear any previous persisted match data before creating new one
      useTravelMatchStore.getState().clearPersistedMatch();

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
      console.log("🔄 [SELECT] Starting cache refetch");

      // Refetch all matches (force immediate update)
      await queryClient.refetchQueries({
        queryKey: queryKeys.matches.all,
      });
      console.log("✅ [SELECT] Matches refetched");

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
 * Creates conversation immediately when accepting to avoid race conditions.
 */
export function useRespondToMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, accept }: { matchId: string; accept: boolean }) =>
      travelMatchingApi.respondToMatch(matchId, accept),

    onSuccess: async (result, { matchId, accept }) => {
      // Update the match in cache (optimistic update)
      queryClient.setQueryData(queryKeys.matches.detail(matchId), result);

      // If accepted, create conversation immediately
      if (accept) {
        try {
          console.log("🔄 [RESPOND] Creating conversation for match:", matchId);
          await conversationApi.createFromMatch(matchId);
          console.log("✅ [RESPOND] Conversation created successfully");

          // 🔧 FIX: Wait for DB propagation (backend updates travelMatch.conversationId)
          console.log("⏳ [RESPOND] Waiting 300ms for DB propagation...");
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Invalidate specific match first (forces refetch)
          console.log("🔄 [RESPOND] Invalidating match cache...");
          await queryClient.invalidateQueries({
            queryKey: queryKeys.matches.detail(matchId),
          });
        } catch (error) {
          // Distinguir entre error esperado (409 - conversación ya existe) y errores reales
          if (axios.isAxiosError(error) && error.response?.status === 409) {
            console.log("ℹ️ [RESPOND] Conversation already exists (expected behavior)");
          } else {
            console.error("❌ [RESPOND] Failed to create conversation:", error);
          }
          // Don't fail the entire mutation - conversation can be created later
        }
      }

      // Refetch all matches to get fresh data with conversationId
      console.log("🔄 [RESPOND] Refetching all matches...");
      await queryClient.refetchQueries({
        queryKey: queryKeys.matches.all,
      });

      // Show appropriate toast
      if (accept) {
        toast.success("¡Solicitud aceptada!");
      } else {
        toast.success("Solicitud rechazada");
      }
    },

    onError: (error) => {
      console.error("❌ useRespondToMatch error:", error);
      toast.error("Error al responder solicitud");
    },
  });
}

/**
 * Cancel a match (before trip is created)
 * PUT /travel-matching/matches/:matchId/cancel
 */
export function useCancelMatch() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (matchId: string) => travelMatchingApi.cancelMatch(matchId),

    onSuccess: async (result, matchId) => {
      // Update the match in cache
      queryClient.setQueryData(queryKeys.matches.detail(matchId), result);

      // Refetch all matches
      await queryClient.refetchQueries({
        queryKey: queryKeys.matches.user(user?.id || ""),
      });

      await queryClient.refetchQueries({
        queryKey: queryKeys.matches.all,
      });

      toast.success("Viaje cancelado exitosamente");
    },

    onError: (error) => {
      console.error("❌ useCancelMatch error:", error);
      toast.error("Error al cancelar viaje");
    },
  });
}

/**
 * Create a trip from an accepted match
 * POST /travel-matching/matches/:matchId/create-trip
 *
 * 🔧 FIX: Added delay and invalidation to prevent race condition
 */
export function useCreateTripFromMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) =>
      travelMatchingApi.createTripFromMatch(matchId),

    onSuccess: async (result, matchId) => {
      // 🔧 FIX: Wait for DB propagation (backend updates travelMatch.tripId)
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Invalidate specific match first (forces refetch)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.matches.detail(matchId),
      });

      // Refetch everything related to matches and trips
      await queryClient.refetchQueries({
        queryKey: queryKeys.matches.all,
      });

      await queryClient.refetchQueries({
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
