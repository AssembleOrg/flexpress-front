"use client";

import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

export interface MapMarker {
  lat: number;
  lon: number;
  label?: string;
  type?: "pickup" | "destination" | "charter";
}

interface LeafletMapProps {
  markers?: MapMarker[];
  height?: string;
  isLoading?: boolean;
}

// Custom marker icons
const markerIcons = {
  pickup: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  destination: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  charter: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  default: L.Icon.Default.prototype,
};

/**
 * LeafletMap Component
 * Interactive map using Leaflet and OpenStreetMap
 * Must be rendered client-side only (no SSR)
 */
export default function LeafletMap({
  markers = [],
  height = "400px",
  isLoading = false,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    try {
      // Create map centered on Argentina (Buenos Aires area)
      mapRef.current = L.map(containerRef.current).setView(
        [-34.6037, -58.3816],
        12,
      );

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapRef.current);

      setIsMapReady(true);
    } catch (error) {
      console.error("Error initializing Leaflet map:", error);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !isMapReady) {
      return;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    if (markers.length === 0) {
      return;
    }

    // Add new markers
    const bounds = L.latLngBounds([]);

    markers.forEach((marker) => {
      const latlng: L.LatLngExpression = [marker.lat, marker.lon];
      bounds.extend(latlng);

      const markerIcon =
        markerIcons[marker.type || "default"] || markerIcons.default;

      if (!mapRef.current) return;

      const leafletMarker = L.marker(latlng, { icon: markerIcon })
        .bindPopup(
          marker.label || `${marker.lat.toFixed(4)}, ${marker.lon.toFixed(4)}`,
        )
        .addTo(mapRef.current);

      markersRef.current.push(leafletMarker);
    });

    // Fit map to markers with padding
    if (markers.length === 1) {
      // For single marker, set zoom level
      mapRef.current.setView([markers[0].lat, markers[0].lon], 14);
    } else {
      // For multiple markers, fit bounds
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Draw polyline connecting markers if there are multiple
    if (markers.length > 1) {
      const polylineCoords = markers.map(
        (m) => [m.lat, m.lon] as L.LatLngExpression,
      );
      L.polyline(polylineCoords, {
        color: "#FF6B35",
        weight: 2,
        opacity: 0.7,
        dashArray: "5, 5",
      }).addTo(mapRef.current);
    }
  }, [markers, isMapReady]);

  if (isLoading) {
    return (
      <Paper
        sx={{
          width: "100%",
          height,
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
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height,
        borderRadius: 1,
        overflow: "hidden",
        border: "1px solid #e0e0e0",
      }}
    />
  );
}
