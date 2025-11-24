import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AvailableCharter, TravelMatch } from "@/lib/types/api";

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface TravelMatchState {
  currentMatch: TravelMatch | null;
  availableCharters: AvailableCharter[];
  myMatches: TravelMatch[];
  isSearching: boolean;
  isLoading: boolean;
  pickupAddress: string | null;
  pickupCoords: Coordinates | null;
  destinationAddress: string | null;
  destinationCoords: Coordinates | null;
  workersCount: number;
  scheduledDate: string | null;
}

interface TravelMatchActions {
  setCurrentMatch: (match: TravelMatch | null) => void;
  setAvailableCharters: (charters: AvailableCharter[]) => void;
  setMyMatches: (matches: TravelMatch[]) => void;
  addMyMatch: (match: TravelMatch) => void;
  setSearching: (searching: boolean) => void;
  setLoading: (loading: boolean) => void;
  clearMatch: () => void;
  clearPersistedMatch: () => void;
  setPickupLocation: (address: string, coords: Coordinates) => void;
  setDestinationLocation: (address: string, coords: Coordinates) => void;
  setWorkersCount: (count: number) => void;
  setScheduledDate: (date: string | null) => void;
  clearSearchForm: () => void;
}

export const useTravelMatchStore = create<
  TravelMatchState & TravelMatchActions
>()(
  persist(
    (set) => ({
      // Estado inicial
      currentMatch: null,
      availableCharters: [],
      myMatches: [],
      isSearching: false,
      isLoading: false,
      pickupAddress: null,
      pickupCoords: null,
      destinationAddress: null,
      destinationCoords: null,
      workersCount: 0,
      scheduledDate: null,

      // Acciones
      setCurrentMatch: (match: TravelMatch | null) =>
        set({ currentMatch: match }),

      setAvailableCharters: (charters: AvailableCharter[]) =>
        set({ availableCharters: charters }),

      setMyMatches: (matches: TravelMatch[]) => set({ myMatches: matches }),

      addMyMatch: (match: TravelMatch) =>
        set((state) => ({
          myMatches: [...state.myMatches, match],
        })),

      setSearching: (searching: boolean) => set({ isSearching: searching }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      clearMatch: () =>
        set({
          currentMatch: null,
          availableCharters: [],
          isSearching: false,
        }),

      clearPersistedMatch: () =>
        set({
          currentMatch: null,
          availableCharters: [],
          pickupAddress: null,
          pickupCoords: null,
          destinationAddress: null,
          destinationCoords: null,
          isSearching: false,
        }),

      setPickupLocation: (address: string, coords: Coordinates) =>
        set({
          pickupAddress: address,
          pickupCoords: coords,
        }),

      setDestinationLocation: (address: string, coords: Coordinates) =>
        set({
          destinationAddress: address,
          destinationCoords: coords,
        }),

      setWorkersCount: (count: number) => set({ workersCount: count }),

      setScheduledDate: (date: string | null) => set({ scheduledDate: date }),

      clearSearchForm: () =>
        set({
          pickupAddress: null,
          pickupCoords: null,
          destinationAddress: null,
          destinationCoords: null,
          workersCount: 0,
          scheduledDate: null,
        }),
    }),
    {
      name: "flexpress-travel-match",
      skipHydration: true,
      partialize: (state) => ({
        currentMatch: state.currentMatch,
        availableCharters: state.availableCharters,
        pickupAddress: state.pickupAddress,
        pickupCoords: state.pickupCoords,
        destinationAddress: state.destinationAddress,
        destinationCoords: state.destinationCoords,
      }),
    },
  ),
);
