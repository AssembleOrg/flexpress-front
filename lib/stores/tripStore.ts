import { create } from "zustand";
import type { Trip, TripState } from "@/lib/types/trip";

interface TripActions {
  setCurrentTrip: (trip: Trip | null) => void;
  setAvailableTrips: (trips: Trip[]) => void;
  addAvailableTrip: (trip: Trip) => void;
  removeAvailableTrip: (tripId: string) => void;
  setMyTrips: (trips: Trip[]) => void;
  addMyTrip: (trip: Trip) => void;
  updateTripStatus: (tripId: string, status: Trip["status"]) => void;
  setTripHistory: (trips: Trip[]) => void;
  setLoading: (loading: boolean) => void;
  clearTrips: () => void;
}

export const useTripStore = create<TripState & TripActions>()((set) => ({
  // Estado inicial
  currentTrip: null,
  availableTrips: [],
  myTrips: [],
  tripHistory: [],
  isLoading: false,

  // Acciones
  setCurrentTrip: (trip: Trip | null) => set({ currentTrip: trip }),

  setAvailableTrips: (trips: Trip[]) => set({ availableTrips: trips }),

  addAvailableTrip: (trip: Trip) =>
    set((state) => ({
      availableTrips: [...state.availableTrips, trip],
    })),

  removeAvailableTrip: (tripId: string) =>
    set((state) => ({
      availableTrips: state.availableTrips.filter((trip) => trip.id !== tripId),
    })),

  setMyTrips: (trips: Trip[]) => set({ myTrips: trips }),

  addMyTrip: (trip: Trip) =>
    set((state) => ({
      myTrips: [...state.myTrips, trip],
    })),

  updateTripStatus: (tripId: string, status: Trip["status"]) =>
    set((state) => ({
      currentTrip:
        state.currentTrip?.id === tripId
          ? { ...state.currentTrip, status }
          : state.currentTrip,
      myTrips: state.myTrips.map((trip) =>
        trip.id === tripId ? { ...trip, status } : trip,
      ),
      availableTrips: state.availableTrips.map((trip) =>
        trip.id === tripId ? { ...trip, status } : trip,
      ),
    })),

  setTripHistory: (trips: Trip[]) => set({ tripHistory: trips }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  clearTrips: () =>
    set({
      currentTrip: null,
      availableTrips: [],
      myTrips: [],
      tripHistory: [],
    }),
}));
