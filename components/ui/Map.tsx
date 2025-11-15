"use client";

import { ZoomOutMap } from "@mui/icons-material";
import { CircularProgress, Paper, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { LeafletMapHandle } from "./LeafletMap";

// Dynamic import to avoid SSR issues with Leaflet
const LeafletMapDynamic = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <Paper
      sx={{
        width: "100%",
        height: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">Cargando mapa...</Typography>
    </Paper>
  ),
});

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
  onMarkerDrag?: (
    type: "pickup" | "destination" | "charter",
    lat: number,
    lon: number,
  ) => void;
  allowDragging?: boolean;
}

export type MapHandle = LeafletMapHandle;

/**
 * MapDisplay Component
 * Interactive map component that displays markers and routes using Leaflet
 */
export const MapDisplay = forwardRef<MapHandle, MapProps>(function MapDisplay(
  {
    markers = [],
    height = "400px",
    isLoading = false,
    onMarkerDrag,
    allowDragging = false,
  },
  ref,
) {
  // Show empty state if no markers
  if (!isLoading && markers.length === 0) {
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
        }}
      >
        <ZoomOutMap sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
        <Typography color="text.secondary">
          Selecciona origen y destino para ver el mapa
        </Typography>
      </Paper>
    );
  }

  return (
    <LeafletMapDynamic
      ref={ref}
      markers={markers}
      height={height}
      isLoading={isLoading}
      onMarkerDrag={onMarkerDrag}
      allowDragging={allowDragging}
    />
  );
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Used as export Map
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
