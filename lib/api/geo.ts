/**
 * Geoapify Integration Service
 * Handles geocoding, reverse geocoding, and address autocomplete
 * API Docs: https://apidocs.geoapify.com/
 */

export interface GeoapifyFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    formatted: string;
    address_line1: string;
    address_line2?: string;
    lat: number;
    lon: number;
    name?: string;
    country?: string;
    state?: string;
    city?: string;
  };
}

export interface AutocompleteResult {
  features: GeoapifyFeature[];
}

export interface GeocodeResult {
  type: string;
  features: GeoapifyFeature[];
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface AddressSuggestion {
  address: string;
  coordinates: Coordinates;
  formattedAddress?: string;
  city?: string;
  state?: string;
  country?: string;
}

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
const GEOAPIFY_BASE_URL = "https://api.geoapify.com";

if (!GEOAPIFY_API_KEY) {
  console.warn(
    "⚠️ NEXT_PUBLIC_GEOAPIFY_API_KEY is not defined. Geoapify services will not work.",
  );
}

/**
 * Get address suggestions based on user input
 * Used for autocomplete in address input fields
 */
export const geoApi = {
  /**
   * Autocomplete addresses based on partial input
   * @param text - Partial address text
   * @param limit - Maximum number of suggestions
   * @returns Array of address suggestions with coordinates
   */
  autocomplete: async (
    text: string,
    limit: number = 5,
  ): Promise<AddressSuggestion[]> => {
    if (!GEOAPIFY_API_KEY) {
      console.error("Geoapify API key is not configured");
      return [];
    }

    if (!text || text.trim().length < 2) {
      return [];
    }

    try {
      const url = new URL(`${GEOAPIFY_BASE_URL}/v1/geocode/autocomplete`);
      url.searchParams.set("text", text);
      url.searchParams.set("limit", limit.toString());
      url.searchParams.set("apiKey", GEOAPIFY_API_KEY);
      url.searchParams.set("filter", "countrycode:ar");
      url.searchParams.set("bias", "countrycode:ar");

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          `Geoapify API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: AutocompleteResult = await response.json();

      return data.features.map((feature) => ({
        address: feature.properties.formatted,
        coordinates: {
          lat: feature.properties.lat,
          lon: feature.properties.lon,
        },
        formattedAddress: feature.properties.formatted,
        city: feature.properties.city,
        state: feature.properties.state,
        country: feature.properties.country,
      }));
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      return [];
    }
  },

  /**
   * Convert address string to coordinates
   * @param address - Full address string
   * @returns Coordinates with address details
   */
  geocode: async (address: string): Promise<AddressSuggestion | null> => {
    if (!GEOAPIFY_API_KEY) {
      console.error("Geoapify API key is not configured");
      return null;
    }

    if (!address || address.trim().length === 0) {
      return null;
    }

    try {
      const url = new URL(`${GEOAPIFY_BASE_URL}/v1/geocode/search`);
      url.searchParams.set("text", address);
      url.searchParams.set("limit", "1");
      url.searchParams.set("apiKey", GEOAPIFY_API_KEY);
      url.searchParams.set("filter", "countrycode:ar");

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          `Geoapify API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: GeocodeResult = await response.json();

      if (!data.features || data.features.length === 0) {
        return null;
      }

      const feature = data.features[0];
      return {
        address: feature.properties.formatted,
        coordinates: {
          lat: feature.properties.lat,
          lon: feature.properties.lon,
        },
        formattedAddress: feature.properties.formatted,
        city: feature.properties.city,
        state: feature.properties.state,
        country: feature.properties.country,
      };
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  },

  /**
   * Convert coordinates to address
   * @param lat - Latitude
   * @param lon - Longitude
   * @returns Address with coordinates
   */
  reverseGeocode: async (
    lat: number,
    lon: number,
  ): Promise<AddressSuggestion | null> => {
    if (!GEOAPIFY_API_KEY) {
      console.error("Geoapify API key is not configured");
      return null;
    }

    try {
      const url = new URL(`${GEOAPIFY_BASE_URL}/v1/geocode/reverse`);
      url.searchParams.set("lat", lat.toString());
      url.searchParams.set("lon", lon.toString());
      url.searchParams.set("apiKey", GEOAPIFY_API_KEY);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          `Geoapify API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: GeocodeResult = await response.json();

      if (!data.features || data.features.length === 0) {
        return null;
      }

      const feature = data.features[0];
      return {
        address: feature.properties.formatted,
        coordinates: {
          lat: feature.properties.lat,
          lon: feature.properties.lon,
        },
        formattedAddress: feature.properties.formatted,
        city: feature.properties.city,
        state: feature.properties.state,
        country: feature.properties.country,
      };
    } catch (error) {
      console.error("Error reverse geocoding coordinates:", error);
      return null;
    }
  },

  /**
   * Calculate distance between two points (simplified)
   * @param lat1 - First point latitude
   * @param lon1 - First point longitude
   * @param lat2 - Second point latitude
   * @param lon2 - Second point longitude
   * @returns Distance in kilometers
   */
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};
