import { create } from "zustand";
import type { AvailableCharter, TravelMatch } from "@/lib/types/api";

export interface TravelMatchState {
  currentMatch: TravelMatch | null;
  availableCharters: AvailableCharter[];
  myMatches: TravelMatch[];
  isSearching: boolean;
  isLoading: boolean;
}

interface TravelMatchActions {
  setCurrentMatch: (match: TravelMatch | null) => void;
  setAvailableCharters: (charters: AvailableCharter[]) => void;
  setMyMatches: (matches: TravelMatch[]) => void;
  addMyMatch: (match: TravelMatch) => void;
  setSearching: (searching: boolean) => void;
  setLoading: (loading: boolean) => void;
  clearMatch: () => void;
}

export const useTravelMatchStore = create<
  TravelMatchState & TravelMatchActions
>()((set) => ({
  // Estado inicial
  currentMatch: null,
  availableCharters: [],
  myMatches: [],
  isSearching: false,
  isLoading: false,

  // Acciones
  setCurrentMatch: (match: TravelMatch | null) => set({ currentMatch: match }),

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
}));
