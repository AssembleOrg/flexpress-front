import { type NextRequest, NextResponse } from "next/server";

interface GeocodeRequest {
  address?: string;
  lat?: number;
  lon?: number;
}

interface GeocoderAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type?: string;
  };
  address_components: GeocoderAddressComponent[];
  types?: string[];
}

interface GoogleGeocodeResponse {
  results: GeocodeResult[];
  status: string;
}

/**
 * Extract city and state from address components
 */
const extractAddressComponents = (components: GeocoderAddressComponent[]) => {
  let city: string | undefined;
  let state: string | undefined;

  components.forEach((component) => {
    if (component.types.includes("locality")) {
      city = component.long_name;
    }
    if (component.types.includes("administrative_area_level_1")) {
      state = component.long_name;
    }
  });

  return { city, state };
};

/**
 * POST /api/geocode
 * Server-side geocoding endpoint
 * Handles both forward geocoding (address -> coordinates) and reverse geocoding (coordinates -> address)
 */
export async function POST(request: NextRequest) {
  try {
    const body: GeocodeRequest = await request.json();
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 },
      );
    }

    let url: string;

    if (body.address) {
      // Forward geocoding
      if (!body.address || body.address.trim().length === 0) {
        return NextResponse.json(
          { error: "Address is required" },
          { status: 400 },
        );
      }

      const encodedAddress = encodeURIComponent(body.address);
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&components=country:ar&key=${apiKey}`;
    } else if (body.lat !== undefined && body.lon !== undefined) {
      // Reverse geocoding with precision parameters
      if (typeof body.lat !== "number" || typeof body.lon !== "number") {
        return NextResponse.json(
          { error: "Valid lat and lon are required" },
          { status: 400 },
        );
      }

      // Build URL with precision parameters: ROOFTOP level + street_address only
      const baseUrl = "https://maps.googleapis.com/maps/api/geocode/json";
      const params = new URLSearchParams({
        latlng: `${body.lat},${body.lon}`,
        result_type: "street_address", // Only street addresses
        location_type: "ROOFTOP", // Maximum precision (5-15m)
        language: "es", // Results in Spanish
        key: apiKey,
      });
      url = `${baseUrl}?${params.toString()}`;
    } else {
      return NextResponse.json(
        {
          error: "Either address or (lat, lon) is required",
        },
        { status: 400 },
      );
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Google Geocoding API error: ${response.status}`,
        },
        { status: response.status },
      );
    }

    let data: GoogleGeocodeResponse = await response.json();

    // Fallback strategy for areas without ROOFTOP precision
    // Attempt 1: ROOFTOP + street_address (99% precision)
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.log(
        "⚠️ [GEOCODE] ROOFTOP failed, attempting RANGE_INTERPOLATED fallback",
        { lat: body.lat, lon: body.lon },
      );

      // Fallback 2: RANGE_INTERPOLATED + street_address (95% precision)
      const baseUrl = "https://maps.googleapis.com/maps/api/geocode/json";
      const fallbackParams = new URLSearchParams({
        latlng: `${body.lat},${body.lon}`,
        result_type: "street_address",
        location_type: "RANGE_INTERPOLATED",
        language: "es",
        key: apiKey,
      });

      const fallbackResponse = await fetch(
        `${baseUrl}?${fallbackParams.toString()}`,
      );
      data = await fallbackResponse.json();

      // DEBUG: Log Fallback 2 response
      console.log("🔍 [GEOCODE] Fallback 2 raw response:", {
        status: data.status,
        resultCount: data.results?.length || 0,
        firstResultTypes: data.results?.[0]?.types,
        firstResult: data.results?.[0]?.formatted_address,
      });
    }

    // Fallback 3: No result_type filter - accept ANY result (route, locality, etc.)
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.log(
        "⚠️ [GEOCODE] RANGE_INTERPOLATED failed, attempting without result_type filter",
        { lat: body.lat, lon: body.lon },
      );

      const baseUrl = "https://maps.googleapis.com/maps/api/geocode/json";
      const finalParams = new URLSearchParams({
        latlng: `${body.lat},${body.lon}`,
        language: "es",
        key: apiKey,
        // ✅ NO result_type - accepts route, locality, sublocality, etc.
      });

      const finalResponse = await fetch(`${baseUrl}?${finalParams.toString()}`);
      data = await finalResponse.json();

      // DEBUG: Log what Google actually returned
      console.log("🔍 [GEOCODE] Fallback 3 raw response:", {
        status: data.status,
        resultCount: data.results?.length || 0,
        firstResultTypes: data.results?.[0]?.types,
        firstResult: data.results?.[0]?.formatted_address,
      });
    }

    // Final fallback: return coordinates if no address found
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.warn(
        "⚠️ [GEOCODE] All fallbacks failed, returning coordinates as address",
        { lat: body.lat, lon: body.lon },
      );

      return NextResponse.json({
        address: `Ubicación: ${body.lat?.toFixed(5)}, ${body.lon?.toFixed(5)}`,
        formattedAddress: "Sin dirección cercana",
        coordinates: {
          lat: body.lat,
          lon: body.lon,
        },
        locationType: "APPROXIMATE",
        isPrecise: false,
      });
    }

    // Success: Extract result with precision metadata
    const result = data.results[0];
    const components = extractAddressComponents(result.address_components);
    const locationType = result.geometry.location_type || "APPROXIMATE";
    const isPrecise = locationType === "ROOFTOP";

    console.log("✅ [GEOCODE] Success:", {
      address: result.formatted_address,
      locationType,
      isPrecise,
    });

    return NextResponse.json({
      address: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lon: result.geometry.location.lng,
      },
      formattedAddress: result.formatted_address,
      locationType,
      isPrecise,
      city: components.city,
      state: components.state,
      country: "Argentina",
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
