import api from "../api";
import type { ApiResponse, Vehicle } from "../types/api";

export const vehiclesApi = {
  /**
   * Get vehicles owned by the authenticated charter
   * GET /vehicles/me
   */
  getMyVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get<ApiResponse<Vehicle[]>>("/vehicles/me");
    return response.data.data ?? [];
  },
};
