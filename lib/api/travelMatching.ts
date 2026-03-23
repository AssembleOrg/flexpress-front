/**
 * Travel Matching API Service
 * Handles all Travel Matching operations between users and charters
 */

import api from '@/lib/api';
import type {
  ApiResponse,
  AvailableCharter,
  TravelMatch,
} from '@/lib/types/api';

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
    try {
      const response = await api.post<ApiResponse<CreateMatchResponse>>(
        '/travel-matching/matches',
        data
      );

      // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
      const responseData = response.data.data!;

      // Si response.data.data tiene 'success' y 'message', es el wrapper del backend
      // Extraer el verdadero CreateMatchResponse de responseData.data
      if (
        responseData &&
        typeof responseData === 'object' &&
        'success' in responseData &&
        'message' in responseData &&
        'data' in responseData
      ) {
        // biome-ignore lint/style/noNonNullAssertion: structure validated above
        return (
          responseData as unknown as {
            data: CreateMatchResponse;
          }
        ).data!;
      }

      return responseData as CreateMatchResponse;
    } catch (error) {
      console.error('❌ [MATCHING] Create match failed');

      // Extract detailed error information
      const errorDetails = {
        status: null as number | null,
        message: 'Unknown error',
        backend_error: null as unknown,
      };

      if (error instanceof Error && 'response' in error) {
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

        console.error('Status:', errorDetails.status);
        console.error('Backend message:', errorDetails.message);
        console.error('Full error data:', errorDetails.backend_error);
      }

      // Create a detailed error with all context
      const enhancedError = new Error(
        `Travel match creation failed: ${errorDetails.message}`
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
    charterId: string
  ): Promise<TravelMatch> => {
    const response = await api.put<ApiResponse<TravelMatch>>(
      `/travel-matching/matches/${matchId}/select-charter`,
      { charterId }
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Get all matches for current user
   */
  getUserMatches: async (): Promise<TravelMatch[]> => {
    try {
      const response = await api.get<ApiResponse<TravelMatch[]>>(
        '/travel-matching/matches'
      );

      // Manejar doble wrapper del backend
      const responseData = response.data.data;

      // Si tiene doble nesting (response.data.data.data)
      if (
        responseData &&
        typeof responseData === 'object' &&
        'data' in responseData
      ) {
        const matches = (responseData as { data: TravelMatch[] }).data;
        if (Array.isArray(matches)) {
          return matches;
        }
      }

      // Si es array directo (fallback)
      if (Array.isArray(responseData)) {
        return responseData;
      }

      return [];
    } catch (error) {
      console.error('❌ [MATCHING] Get user matches failed', error);
      throw error;
    }
  },

  /**
   * Get all match requests for current charter
   */
  getCharterMatches: async (): Promise<TravelMatch[]> => {
    try {
      const response = await api.get<
        ApiResponse<{ success: boolean; data: TravelMatch[] } | TravelMatch[]>
      >('/travel-matching/charter/matches');

      // Manejar doble wrapper del backend
      const responseData = response.data.data;

      // Si tiene doble nesting (response.data.data.data)
      if (
        responseData &&
        typeof responseData === 'object' &&
        'data' in responseData
      ) {
        const matches = responseData.data;
        if (Array.isArray(matches)) {
          return matches;
        }
      }

      // Si es array directo (fallback)
      if (Array.isArray(responseData)) {
        return responseData;
      }

      return [];
    } catch (error) {
      console.error('❌ [MATCHING] Get charter matches failed', error);
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
    accept: boolean
  ): Promise<TravelMatch> => {
    const response = await api.put<ApiResponse<TravelMatch>>(
      `/travel-matching/charter/matches/${matchId}/respond`,
      { accept } // Send as JSON body, not as query param
    );

    // Defensive: validate response structure
    if (!response.data.data) {
      console.error(
        '❌ [RESPOND] Backend returned invalid response:',
        response.data
      );
      throw new Error('Backend devolvió estructura de respuesta inválida');
    }

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
    const response = await api.get<
      ApiResponse<{ success: boolean; data: TravelMatch } | TravelMatch>
    >(`/travel-matching/matches/${matchId}`);

    // Manejar doble wrapper del backend
    const responseData = response.data.data;

    // Si tiene doble nesting (response.data.data.data)
    if (
      responseData &&
      typeof responseData === 'object' &&
      'data' in responseData
    ) {
      return (responseData as { data: TravelMatch }).data;
    }

    if (responseData && typeof responseData === 'object') {
      return responseData as TravelMatch;
    }

    // Si no hay match, error
    console.error(
      '❌ [MATCHING] Backend returned invalid match:',
      response.data
    );
    throw new Error('Backend devolvió match con estructura inválida');
  },

  /**
   * Cancel a match (before trip is created)
   * PUT /travel-matching/matches/:matchId/cancel
   */
  cancelMatch: async (matchId: string): Promise<TravelMatch> => {
    const response = await api.put<ApiResponse<TravelMatch>>(
      `/travel-matching/matches/${matchId}/cancel`,
      {}
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
      {}
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Get current charter availability status
   */
  getAvailability: async (): Promise<{ isAvailable: boolean; vehicleId: string | null }> => {
    const response = await api.get('/travel-matching/charter/availability');
    const data = response.data?.data;
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as { data: { isAvailable: boolean; vehicleId: string | null } }).data;
    }
    return data;
  },

  /**
   * Toggle charter availability
   */
  toggleAvailability: async (isAvailable: boolean, vehicleId?: string) => {
    const payload: { isAvailable: boolean; vehicleId?: string } = {
      isAvailable,
      ...(vehicleId && { vehicleId }),
    };
    const response = await api.put('/travel-matching/charter/availability', payload);
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Update charter origin location
   */
  updateCharterOrigin: async (
    latitude: string,
    longitude: string,
    address: string
  ) => {
    const response = await api.put('/travel-matching/charter/origin', {
      latitude,
      longitude,
      address,
    });
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },
};
