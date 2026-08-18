import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/places/details
 *
 * Proxy server-side del Place Details (API New). Resuelve un placeId (el que
 * eligió el usuario en el autocomplete) a dirección + coordenadas, usando la
 * key server. El `sessionToken` cierra la sesión de facturación abierta por el
 * autocomplete: mandarlo acá hace que toda la sesión cuente como una sola.
 */

interface Body {
  placeId?: string;
  sessionToken?: string;
}

interface GooglePlace {
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
}

export async function POST(request: NextRequest) {
  try {
    const { placeId, sessionToken }: Body = await request.json();
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 },
      );
    }

    if (!placeId) {
      return NextResponse.json(
        { error: "placeId is required" },
        { status: 400 },
      );
    }

    const params = new URLSearchParams();
    if (sessionToken) params.set("sessionToken", sessionToken);
    const qs = params.toString();

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}${
        qs ? `?${qs}` : ""
      }`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "formattedAddress,location",
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Place Details API error: ${response.status}` },
        { status: response.status },
      );
    }

    const data: GooglePlace = await response.json();

    if (
      !data.formattedAddress ||
      !data.location ||
      typeof data.location.latitude !== "number" ||
      typeof data.location.longitude !== "number"
    ) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    return NextResponse.json({
      address: data.formattedAddress,
      lat: data.location.latitude,
      lon: data.location.longitude,
    });
  } catch (error) {
    console.error("Place details error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
