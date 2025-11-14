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
      const responseData = response.data.data!;

      // Si response.data.data tiene 'success' y 'message', es el wrapper del backend
      // Extraer el verdadero CreateMatchResponse de responseData.data
      if (
        responseData &&
        typeof responseData === "object" &&
        "success" in responseData &&
        "message" in responseData &&
        "data" in responseData
      ) {
        console.log(
          "🔍 [MATCHING] Detected double-wrapped response, extracting inner data",
        );
        // biome-ignore lint/style/noNonNullAssertion: structure validated above
        return (
          responseData as unknown as {
            data: CreateMatchResponse;
          }
        ).data!;
      }

      // Si no tiene esos campos, asumir que es directamente CreateMatchResponse
      console.log(
        "✅ [MATCHING] Response structure is directly CreateMatchResponse",
      );
      return responseData as CreateMatchResponse;
    } catch (error) {
      console.error("❌ [MATCHING] Create match failed");

      // Extract detailed error information
      const errorDetails = {
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
        "/travel-matching/matches",
      );

      console.log("🔍 [DEBUG] response.data:", response.data);
      console.log("🔍 [DEBUG] response.data.data:", response.data.data);

      // Manejar doble wrapper del backend
      const responseData = response.data.data;

      // Si tiene doble nesting (response.data.data.data)
      if (
        responseData &&
        typeof responseData === "object" &&
        "data" in responseData
      ) {
        const matches = (responseData as { data: TravelMatch[] }).data;
        if (Array.isArray(matches)) {
          console.log(
            "✅ [MATCHING] User matches fetched (doble wrapper):",
            matches.length,
          );
          return matches;
        }
      }

      // Si es array directo (fallback)
      if (Array.isArray(responseData)) {
        console.log(
          "✅ [MATCHING] User matches fetched (directo):",
          responseData.length,
        );
        return responseData;
      }

      // Si no hay matches, retornar array vacío
      console.warn(
        "⚠️ [MATCHING] Response estructura inesperada, retornando []",
      );
      return [];
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
      const response = await api.get<
        ApiResponse<{ success: boolean; data: TravelMatch[] } | TravelMatch[]>
      >("/travel-matching/charter/matches");

      console.log("🔍 [DEBUG] response.data:", response.data);
      console.log("🔍 [DEBUG] response.data.data:", response.data.data);

      // Manejar doble wrapper del backend
      const responseData = response.data.data;

      // Si tiene doble nesting (response.data.data.data)
      if (
        responseData &&
        typeof responseData === "object" &&
        "data" in responseData
      ) {
        const matches = responseData.data;
        if (Array.isArray(matches)) {
          console.log(
            "✅ [MATCHING] Charter matches fetched (doble wrapper):",
            matches.length,
          );
          return matches;
        }
      }

      // Si es array directo (fallback)
      if (Array.isArray(responseData)) {
        console.log(
          "✅ [MATCHING] Charter matches fetched (directo):",
          responseData.length,
        );
        return responseData;
      }

      // Si no hay matches, retornar array vacío
      console.warn(
        "⚠️ [MATCHING] Response estructura inesperada, retornando []",
      );
      return [];
    } catch (error) {
      console.error("❌ [MATCHING] Get charter matches failed", error);
      throw error;
    }
  },

  /**
   * Charter responds to a match (accept or reject)
   * PUT /travel-matching/charter/matches/:matchId/respond
   *
   * Sends accept boolean in request body (not as query param)
   */
  respondToMatch: async (
    matchId: string,
    accept: boolean,
  ): Promise<TravelMatch> => {
    console.log(
      `📝 [RESPOND] Charter responding to match: ${matchId}, accept=${accept}`,
    );

    const response = await api.put<ApiResponse<TravelMatch>>(
      `/travel-matching/charter/matches/${matchId}/respond`,
      { accept }, // Send as JSON body, not as query param
    );

    // Defensive: validate response structure
    if (!response.data.data) {
      console.error(
        "❌ [RESPOND] Backend returned invalid response:",
        response.data,
      );
      throw new Error("Backend devolvió estructura de respuesta inválida");
    }

    console.log(`✅ [RESPOND] Response successful for match: ${matchId}`);
    return response.data.data;
  },

  /**
   * Get single match by ID
   * GET /travel-matching/matches/:matchId
   *
   * Handles double-wrapped response from backend:
   * { data: { success: true, data: { ...match... } } }
   */
  getMatch: async (matchId: string): Promise<TravelMatch> => {
    console.log(`🔍 [MATCHING] Fetching match detail: ${matchId}`);

    const response = await api.get<
      ApiResponse<{ success: boolean; data: TravelMatch } | TravelMatch>
    >(`/travel-matching/matches/${matchId}`);

    console.log("🔍 [DEBUG] response.data:", response.data);
    console.log("🔍 [DEBUG] response.data.data:", response.data.data);

    // Manejar doble wrapper del backend
    const responseData = response.data.data;

    // Si tiene doble nesting (response.data.data.data)
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      const match = (responseData as { data: TravelMatch }).data;
      console.log(
        `✅ [MATCHING] Match detail fetched (doble wrapper): ${matchId}`,
      );
      return match;
    }

    // Si es objeto directo (fallback)
    if (responseData && typeof responseData === "object") {
      console.log(
        `✅ [MATCHING] Match detail fetched (directo): ${matchId}`,
      );
      return responseData as TravelMatch;
    }

    // Si no hay match, error
    console.error(
      "❌ [MATCHING] Backend returned invalid match:",
      response.data,
    );
    throw new Error("Backend devolvió match con estructura inválida");
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
    const response = await api.put("/travel-matching/charter/availability", {
      isAvailable,
    });
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
    const response = await api.put("/travel-matching/charter/origin", {
      latitude,
      longitude,
      address,
    });
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },
};
