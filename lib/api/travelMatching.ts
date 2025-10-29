/**
 * Travel Matching API Service
 * Handles all Travel Matching operations between users and charters
 */

import api from "@/lib/api";
import type {
  ApiResponse,
  AvailableCharter,
  TravelMatch,
} from "@/lib/types/api";

export interface CreateMatchRequest {
  pickupAddress: string;
  pickupLatitude: string;
  pickupLongitude: string;
  destinationAddress: string;
  destinationLatitude: string;
  destinationLongitude: string;
  maxRadiusKm?: number;
  workersCount?: number;
  scheduledDate?: string;
}

export interface CreateMatchResponse {
  match: TravelMatch;
  availableCharters: AvailableCharter[];
}

export interface SelectCharterRequest {
  matchId: string;
  charterId: string;
}

export interface RespondToMatchRequest {
  accept: boolean;
}

export const travelMatchingApi = {
  /**
   * Create a new travel match (user searches for charters)
   */
  create: async (data: CreateMatchRequest): Promise<CreateMatchResponse> => {
    const response = await api.post<ApiResponse<CreateMatchResponse>>(
      "/travel-matching/create",
      data,
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Select a charter from available options
   */
  selectCharter: async (
    matchId: string,
    charterId: string,
  ): Promise<TravelMatch> => {
    const response = await api.post<ApiResponse<TravelMatch>>(
      "/travel-matching/select-charter",
      { matchId, charterId },
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Get all matches for current user
   */
  getUserMatches: async (): Promise<TravelMatch[]> => {
    const response = await api.get<ApiResponse<TravelMatch[]>>(
      "/travel-matching/user/matches",
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Get all match requests for current charter
   */
  getCharterMatches: async (): Promise<TravelMatch[]> => {
    const response = await api.get<ApiResponse<TravelMatch[]>>(
      "/travel-matching/charter/matches",
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Charter responds to a match (accept or reject)
   */
  respondToMatch: async (
    matchId: string,
    accept: boolean,
  ): Promise<TravelMatch> => {
    const response = await api.put<ApiResponse<TravelMatch>>(
      `/travel-matching/charter/matches/${matchId}/respond`,
      null,
      {
        params: { accept },
      },
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Get single match by ID
   */
  getMatch: async (matchId: string): Promise<TravelMatch> => {
    const response = await api.get<ApiResponse<TravelMatch>>(
      `/travel-matching/${matchId}`,
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Create a trip from an accepted match
   */
  createTripFromMatch: async (matchId: string) => {
    const response = await api.post(
      `/travel-matching/create-trip/${matchId}`,
      null,
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Toggle charter availability
   */
  toggleAvailability: async (isAvailable: boolean) => {
    const response = await api.put(
      "/travel-matching/charter/toggle-availability",
      { isAvailable },
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },
};
