/**
 * System Configuration API Service
 * Handles public pricing configuration for credit purchase
 */

import api from "@/lib/api";
import type { ApiResponse } from "@/lib/types/api";

export interface PricingConfig {
  creditsPerKm: number;
  minimumCharge: number;
  creditPrice: number;
}

export const systemConfigApi = {
  /**
   * Get public pricing configuration (no auth required)
   * Used by: Credit purchase modal to display rates and calculate prices
   */
  getPublicPricing: async (): Promise<PricingConfig> => {
    const response = await api.get<ApiResponse<PricingConfig>>(
      "/system-config/public/pricing",
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },
};
