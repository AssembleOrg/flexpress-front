"use client";

import { LocationOn, ZoomOutMap } from "@mui/icons-material";
import { Box, Button, Paper, Typography } from "@mui/material";

export interface MapMarker {
  lat: number;
  lon: number;
  label?: string;
  type?: "pickup" | "destination" | "charter";
}

interface MapProps {
  markers?: MapMarker[];
  height?: string;
  isLoading?: boolean;
}

/**
 * MapDisplay Component
 * Simple map component that displays markers and their information
 * For now, this is a placeholder that will be replaced with Leaflet integration
 * once Leaflet is installed (npm install leaflet)
 */
export function MapDisplay({
  markers = [],
  height = "400px",
  isLoading = false,
}: MapProps) {
  const handleOpenMap = () => {
    if (markers.length === 0) {
      alert("No hay ubicaciones para mostrar en el mapa");
      return;
    }

    // For now, open Google Maps with the first marker
    const marker = markers[0];
    const mapsUrl = `https://www.google.com/maps/search/${marker.lat},${marker.lon}`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <Paper
      sx={{
        width: "100%",
        height,
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isLoading ? (
        <Typography color="text.secondary">Cargando mapa...</Typography>
      ) : markers.length === 0 ? (
        <Box sx={{ textAlign: "center" }}>
          <ZoomOutMap sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography color="text.secondary">
            Selecciona origen y destino para ver el mapa
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ textAlign: "center", mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Ubicaciones en el mapa
            </Typography>

            {markers.map((marker, idx) => (
              <Box key={`${marker.lat}-${marker.lon}`} sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOn
                    sx={{
                      fontSize: 18,
                      color:
                        marker.type === "pickup"
                          ? "primary.main"
                          : marker.type === "destination"
                            ? "secondary.main"
                            : "success.main",
                    }}
                  />
                  <Typography variant="body2">
                    {marker.label || `Ubicación ${idx + 1}`}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 4 }}
                >
                  {marker.lat.toFixed(4)}, {marker.lon.toFixed(4)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenMap}
            startIcon={<ZoomOutMap />}
            sx={{ mt: 1 }}
          >
            Ver en Google Maps
          </Button>
        </>
      )}
    </Paper>
  );
}

// Using alias for backward compatibility
export { MapDisplay as Map };

/**
 * RouteMap Component
 * Displays a route between pickup and destination
 */
export function RouteMap({
  pickup,
  destination,
  charter,
}: {
  pickup?: MapMarker;
  destination?: MapMarker;
  charter?: MapMarker;
}) {
  const markers: MapMarker[] = [];

  if (charter) markers.push(charter);
  if (pickup) markers.push(pickup);
  if (destination) markers.push(destination);

  return <MapDisplay markers={markers} height="500px" />;
}
