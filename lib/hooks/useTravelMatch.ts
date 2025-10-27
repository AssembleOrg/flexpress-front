"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth";
import {
  type CreateMatchRequest,
  travelMatchingApi,
} from "@/lib/api/travelMatching";
import { useAuthStore } from "@/lib/stores/authStore";
import { useTravelMatchStore } from "@/lib/stores/travelMatchStore";

/**
 * Custom hook for Travel Matching business logic
 * Handles creating matches, selecting charters, and managing match state
 */
export function useTravelMatch() {
  const store = useTravelMatchStore();

  /**
   * Create a new travel match (user searches for available charters)
   */
  const createMatch = async () => {
    if (!store.pickupCoords || !store.destinationCoords) {
      toast.error("Por favor selecciona origen y destino");
      return null;
    }

    if (!store.pickupAddress || !store.destinationAddress) {
      toast.error("Por favor ingresa direcciones válidas");
      return null;
    }

    store.setLoading(true);
    store.setSearching(true);

    try {
      const matchRequest: CreateMatchRequest = {
        pickupAddress: store.pickupAddress,
        pickupLatitude: store.pickupCoords.lat.toString(),
        pickupLongitude: store.pickupCoords.lon.toString(),
        destinationAddress: store.destinationAddress,
        destinationLatitude: store.destinationCoords.lat.toString(),
        destinationLongitude: store.destinationCoords.lon.toString(),
        maxRadiusKm: 30,
        workersCount: store.workersCount,
        scheduledDate: store.scheduledDate || undefined,
      };

      const result = await travelMatchingApi.create(matchRequest);

      store.setCurrentMatch(result.match);
      store.setAvailableCharters(result.availableCharters);

      toast.success(
        `¡Se encontraron ${result.availableCharters.length} chóferes!`,
      );

      return result;
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("Error al crear búsqueda de viaje");
      return null;
    } finally {
      store.setLoading(false);
    }
  };

  /**
   * Select a charter from available options
   */
  const selectCharter = async (charterId: string) => {
    if (!store.currentMatch) {
      toast.error("No hay búsqueda activa");
      return null;
    }

    store.setLoading(true);

    try {
      const result = await travelMatchingApi.selectCharter(
        store.currentMatch.id,
        charterId,
      );

      store.setCurrentMatch(result);
      toast.success("Chófer seleccionado. Esperando confirmación...");

      return result;
    } catch (error) {
      console.error("Error selecting charter:", error);
      toast.error("Error al seleccionar chófer");
      return null;
    } finally {
      store.setLoading(false);
    }
  };

  /**
   * Get all matches for the current user
   */
  const loadUserMatches = async () => {
    store.setLoading(true);

    try {
      const matches = await travelMatchingApi.getUserMatches();
      store.setMyMatches(matches);
      return matches;
    } catch (error) {
      console.error("Error loading user matches:", error);
      toast.error("Error al cargar búsquedas");
      return [];
    } finally {
      store.setLoading(false);
    }
  };

  /**
   * Get all match requests for the current charter
   */
  const loadCharterMatches = async () => {
    store.setLoading(true);

    try {
      const matches = await travelMatchingApi.getCharterMatches();
      store.setMyMatches(matches);
      return matches;
    } catch (error) {
      console.error("Error loading charter matches:", error);
      toast.error("Error al cargar solicitudes");
      return [];
    } finally {
      store.setLoading(false);
    }
  };

  /**
   * Charter responds to a match request
   */
  const respondToMatch = async (matchId: string, accept: boolean) => {
    store.setLoading(true);

    try {
      const result = await travelMatchingApi.respondToMatch(matchId, accept);

      if (accept) {
        toast.success("¡Solicitud aceptada!");
      } else {
        toast.success("Solicitud rechazada");
      }

      // Remove from pending matches
      store.setMyMatches(
        store.myMatches.filter((match) => match.id !== matchId),
      );

      return result;
    } catch (error) {
      console.error("Error responding to match:", error);
      toast.error("Error al procesar respuesta");
      return null;
    } finally {
      store.setLoading(false);
    }
  };

  /**
   * Create a trip from an accepted match
   */
  const createTripFromMatch = async (matchId: string) => {
    store.setLoading(true);

    try {
      const result = await travelMatchingApi.createTripFromMatch(matchId);
      toast.success("¡Viaje creado exitosamente!");
      return result;
    } catch (error) {
      console.error("Error creating trip from match:", error);
      toast.error("Error al crear viaje");
      return null;
    } finally {
      store.setLoading(false);
    }
  };

  /**
   * Toggle charter availability
   */
  const toggleCharterAvailability = async (isAvailable: boolean) => {
    try {
      await travelMatchingApi.toggleAvailability(isAvailable);
      toast.success(
        isAvailable ? "Ahora estás disponible" : "Ya no estás disponible",
      );
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast.error("Error al actualizar disponibilidad");
    }
  };

  /**
   * Update charter origin location
   */
  const updateCharterOrigin = async (
    originAddress: string,
    originLatitude: number,
    originLongitude: number,
  ) => {
    try {
      const { user, updateUser } = useAuthStore.getState();
      if (!user) {
        toast.error("Usuario no autenticado");
        return;
      }

      const updatedUser = await authApi.updateUser(user.id, {
        originAddress,
        originLatitude: originLatitude.toString(),
        originLongitude: originLongitude.toString(),
      });

      updateUser(updatedUser);
      toast.success("Ubicación de base actualizada");
    } catch (error) {
      console.error("Error updating charter origin:", error);
      toast.error("Error al actualizar ubicación");
    }
  };

  /**
   * Set pickup location
   */
  const setPickupLocation = (address: string, lat: number, lon: number) => {
    store.setPickupLocation(address, { lat, lon });
  };

  /**
   * Set destination location
   */
  const setDestinationLocation = (
    address: string,
    lat: number,
    lon: number,
  ) => {
    store.setDestinationLocation(address, { lat, lon });
  };

  /**
   * Check if form is complete and ready to search
   */
  const isFormComplete = useMemo(
    () =>
      !!store.pickupAddress &&
      !!store.pickupCoords &&
      !!store.destinationAddress &&
      !!store.destinationCoords,
    [
      store.pickupAddress,
      store.pickupCoords,
      store.destinationAddress,
      store.destinationCoords,
    ],
  );

  return {
    // State
    currentMatch: store.currentMatch,
    availableCharters: store.availableCharters,
    myMatches: store.myMatches,
    isLoading: store.isLoading,
    isSearching: store.isSearching,
    isFormComplete,
    pickupAddress: store.pickupAddress,
    pickupCoords: store.pickupCoords,
    destinationAddress: store.destinationAddress,
    destinationCoords: store.destinationCoords,
    workersCount: store.workersCount,
    scheduledDate: store.scheduledDate,

    // Actions
    createMatch,
    selectCharter,
    loadUserMatches,
    loadCharterMatches,
    respondToMatch,
    createTripFromMatch,
    toggleCharterAvailability,
    updateCharterOrigin,
    setPickupLocation,
    setDestinationLocation,
    setWorkersCount: store.setWorkersCount,
    setScheduledDate: store.setScheduledDate,
    clearSearchForm: store.clearSearchForm,
  };
}
