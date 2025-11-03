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
    console.log("🔍 [MATCHING] Creating match request");
    console.log("📍 Base URL:", api.defaults.baseURL);
    console.log("📍 Endpoint:", "/travel-matching/matches");
    console.log("📦 Request data:", data);

    try {
      const response = await api.post<ApiResponse<CreateMatchResponse>>(
        "/travel-matching/matches",
        data,
      );
      console.log("✅ [MATCHING] Match created successfully");
      console.log("📊 Response:", response.data.data);
      // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
      return response.data.data!;
    } catch (error) {
      console.error("❌ [MATCHING] Create match failed");

      // Extract detailed error information
      let errorDetails = {
        status: null as number | null,
        message: "Unknown error",
        backend_error: null as unknown,
      };

      if (error instanceof Error && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: {
              message?: string;
              error?: string;
              details?: unknown;
            };
          };
          message?: string;
        };

        errorDetails.status = axiosError.response?.status || null;
        const backendData = axiosError.response?.data;

        // Extract backend error message
        if (backendData) {
          errorDetails.message =
            backendData.message ||
            backendData.error ||
            `HTTP ${errorDetails.status}`;
          errorDetails.backend_error = backendData;
        } else if (axiosError.message) {
          errorDetails.message = axiosError.message;
        }

        console.error("Status:", errorDetails.status);
        console.error("Backend message:", errorDetails.message);
        console.error("Full error data:", errorDetails.backend_error);
      }

      // Create a detailed error with all context
      const enhancedError = new Error(
        `Travel match creation failed: ${errorDetails.message}`,
      );
      enhancedError.cause = error;
      (enhancedError as unknown as Record<string, unknown>).details =
        errorDetails;

      throw enhancedError;
    }
  },

  /**
   * Select a charter from available options
   */
  selectCharter: async (
    matchId: string,
    charterId: string,
  ): Promise<TravelMatch> => {
    const response = await api.put<ApiResponse<TravelMatch>>(
      `/travel-matching/matches/${matchId}/select-charter`,
      { charterId },
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Get all matches for current user
   */
  getUserMatches: async (): Promise<TravelMatch[]> => {
    console.log("🔍 [MATCHING] Fetching user matches");
    try {
      const response = await api.get<ApiResponse<TravelMatch[]>>(
        "/travel-matching/user/matches",
      );
      console.log(
        "✅ [MATCHING] User matches fetched:",
        response.data.data?.length,
      );
      // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
      return response.data.data!;
    } catch (error) {
      console.error("❌ [MATCHING] Get user matches failed", error);
      throw error;
    }
  },

  /**
   * Get all match requests for current charter
   */
  getCharterMatches: async (): Promise<TravelMatch[]> => {
    console.log("📊 [MATCHING] Fetching charter matches");
    try {
      const response = await api.get<ApiResponse<TravelMatch[]>>(
        "/travel-matching/charter/matches",
      );
      console.log(
        "✅ [MATCHING] Charter matches fetched:",
        response.data.data?.length,
      );
      // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
      return response.data.data!;
    } catch (error) {
      console.error("❌ [MATCHING] Get charter matches failed", error);
      throw error;
    }
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
      `/travel-matching/matches/${matchId}/create-trip`,
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
      "/travel-matching/charter/availability",
      { isAvailable },
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Update charter origin location
   */
  updateCharterOrigin: async (
    latitude: string,
    longitude: string,
    address: string,
  ) => {
    const response = await api.put(
      "/travel-matching/charter/origin",
      { latitude, longitude, address },
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },
};
