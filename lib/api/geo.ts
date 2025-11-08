/**
 * Google Maps Integration Service
 * Handles geocoding and reverse geocoding via server-side API
 * Autocomplete is handled client-side using Google Maps JavaScript SDK in AddressInput component
 * API Docs: https://developers.google.com/maps/documentation
 */

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

/**
 * Geocoding and utility API functions
 * Note: Autocomplete is now handled client-side via Google Maps SDK in AddressInput component
 */
export const geoApi = {
  /**
   * Convert address string to coordinates
   * @param address - Full address string
   * @returns Coordinates with address details
   */
  geocode: async (address: string): Promise<AddressSuggestion | null> => {
    if (!address || address.trim().length === 0) {
      return null;
    }

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        console.error(`Geocoding error: ${response.status}`);
        return null;
      }

      const data = await response.json();

      return {
        address: data.address,
        coordinates: {
          lat: data.coordinates.lat,
          lon: data.coordinates.lon,
        },
        formattedAddress: data.formattedAddress,
        city: data.city,
        state: data.state,
        country: data.country,
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
    if (typeof lat !== "number" || typeof lon !== "number") {
      return null;
    }

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat, lon }),
      });

      if (!response.ok) {
        console.error(`Reverse geocoding error: ${response.status}`);
        return null;
      }

      const data = await response.json();

      return {
        address: data.address,
        coordinates: {
          lat: data.coordinates.lat,
          lon: data.coordinates.lon,
        },
        formattedAddress: data.formattedAddress,
        city: data.city,
        state: data.state,
        country: data.country,
      };
    } catch (error) {
      console.error("Error reverse geocoding coordinates:", error);
      return null;
    }
  },

  /**
   * Calculate distance between two points using Haversine formula
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
