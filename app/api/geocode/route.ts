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
  };
  address_components: GeocoderAddressComponent[];
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
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

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
      // Reverse geocoding
      if (typeof body.lat !== "number" || typeof body.lon !== "number") {
        return NextResponse.json(
          { error: "Valid lat and lon are required" },
          { status: 400 },
        );
      }

      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${body.lat},${body.lon}&key=${apiKey}`;
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

    const data: GoogleGeocodeResponse = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return NextResponse.json({ error: "No results found" }, { status: 404 });
    }

    const result = data.results[0];
    const components = extractAddressComponents(result.address_components);

    return NextResponse.json({
      address: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lon: result.geometry.location.lng,
      },
      formattedAddress: result.formatted_address,
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
