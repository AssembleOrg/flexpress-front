import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/places/autocomplete
 *
 * Proxy server-side del autocomplete de Places (API New). Antes esto corría en
 * el browser con la key pública (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY); acá usa la
 * key server (GOOGLE_MAPS_API_KEY, IP-restringible) para que NINGUNA key de
 * Google viaje al cliente.
 *
 * El `sessionToken` lo genera el cliente y viaja igual hasta Google: agrupa los
 * tecleos + el Place Details siguiente en una sola sesión facturable.
 */

// Sesgo a GBA ampliado: CABA + conurbano + La Plata, Pilar, Escobar, Luján,
// Cañuelas. Es sesgo, no restricción: el resto de Argentina sigue apareciendo.
const LOCATION_BIAS = {
  rectangle: {
    low: { latitude: -35.2, longitude: -59.3 },
    high: { latitude: -34.1, longitude: -57.8 },
  },
};

interface Body {
  input?: string;
  sessionToken?: string;
}

interface GoogleSuggestion {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const { input, sessionToken }: Body = await request.json();
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 },
      );
    }

    // Mismo umbral que el cliente: no gastar una llamada por 1 caracter.
    if (!input || input.trim().length < 2) {
      return NextResponse.json({ predictions: [] });
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat",
        },
        body: JSON.stringify({
          input,
          includedRegionCodes: ["ar"],
          locationBias: LOCATION_BIAS,
          ...(sessionToken ? { sessionToken } : {}),
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Places Autocomplete API error: ${response.status}` },
        { status: response.status },
      );
    }

    const data: { suggestions?: GoogleSuggestion[] } = await response.json();

    const predictions = (data.suggestions ?? [])
      .map((s) => s.placePrediction)
      .filter(
        (p): p is NonNullable<typeof p> & { placeId: string } => !!p?.placeId,
      )
      .map((p) => ({
        placeId: p.placeId,
        description: p.text?.text ?? "",
        // Calle + localidad/partido por separado: "San Martín 1234" existe en
        // decenas de partidos del GBA y el usuario tiene que ver cuál elige.
        mainText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
        secondaryText: p.structuredFormat?.secondaryText?.text ?? "",
      }));

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
