"use client";

import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

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
  onMarkerDrag?: (
    type: "pickup" | "destination" | "charter",
    lat: number,
    lon: number,
  ) => void;
  allowDragging?: boolean;
  disableInteraction?: boolean; // Deshabilita zoom, pan, y toda interacción (solo lectura)
}

export interface LeafletMapHandle {
  centerOnMarker: (lat: number, lon: number, zoom?: number) => void;
  fitAllMarkers: () => void;
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
 *
 * Exposed Methods:
 * - centerOnMarker(lat, lon, zoom?): Center map on a marker with smooth animation
 */
const LeafletMap = forwardRef<LeafletMapHandle, LeafletMapProps>(
  (
    {
      markers = [],
      height = "400px",
      isLoading = false,
      onMarkerDrag,
      allowDragging = false,
      disableInteraction = false,
    },
    ref,
  ) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const polylineRef = useRef<L.Polyline | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      centerOnMarker: (lat: number, lon: number, zoom = 15) => {
        if (!mapRef.current) return;

        mapRef.current.flyTo([lat, lon], zoom, {
          duration: 0.8,
          easeLinearity: 0.25,
        });
      },
      fitAllMarkers: () => {
        if (!mapRef.current || markersRef.current.length === 0) return;

        const bounds = L.latLngBounds([]);
        markersRef.current.forEach((marker) => {
          bounds.extend(marker.getLatLng());
        });

        if (bounds.isValid() && markersRef.current.length > 1) {
          mapRef.current.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15,
            animate: true, // With animation for manual call
          });
        }
      },
    }));

    // Initialize map
    useEffect(() => {
      if (!containerRef.current || mapRef.current) {
        return;
      }

      try {
        // Create map centered on Argentina (Buenos Aires area)
        // High zoom level (18) to show individual buildings for precision selection
        mapRef.current = L.map(containerRef.current, {
          minZoom: 5, // Allow zoom out for route visualization (50+ km)
          maxZoom: 20, // Allow higher zoom levels
          // Deshabilitar interacción si disableInteraction={true}
          scrollWheelZoom: !disableInteraction,
          doubleClickZoom: !disableInteraction,
          touchZoom: !disableInteraction,
          dragging: !disableInteraction,
          zoomControl: !disableInteraction, // Ocultar botones +/-
        }).setView(
          [-34.6037, -58.3816],
          18, // Zoom 18 shows buildings individually (5-15m precision)
        );

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 20, // Updated to match map maxZoom
        }).addTo(mapRef.current);

        setIsMapReady(true);
      } catch (error) {
        console.error("Error initializing Leaflet map:", error);
      }

      // Cleanup
      return () => {
        // Clean up polyline before removing map
        if (polylineRef.current && mapRef.current) {
          mapRef.current.removeLayer(polylineRef.current);
          polylineRef.current = null;
        }
        // Then remove the map
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

      // Clear existing markers and listeners
      markersRef.current.forEach((marker) => {
        marker.off("dragend"); // Limpiar listener de dragend
        mapRef.current?.removeLayer(marker);
      });
      markersRef.current = [];

      // Clear existing polyline
      if (polylineRef.current && mapRef.current) {
        mapRef.current.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }

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

        const leafletMarker = L.marker(latlng, {
          icon: markerIcon,
          draggable: allowDragging, // Hacer arrastrables si allowDragging es true
        })
          .bindPopup(
            marker.label ||
              `${marker.lat.toFixed(4)}, ${marker.lon.toFixed(4)}`,
          )
          .addTo(mapRef.current);

        // Agregar listener de dragend si es arrastrable y hay callback
        if (allowDragging && onMarkerDrag) {
          leafletMarker.on("dragend", (e) => {
            const newPos = (e.target as L.Marker).getLatLng();
            const markerType = marker.type || "pickup";

            // Feedback visual: mostrar loading en popup
            (e.target as L.Marker).setPopupContent(
              "🔄 Actualizando dirección...",
            );
            (e.target as L.Marker).openPopup();
            e;
            // La geocodificación y actualización de dirección se manejará en React (useEffect)
            onMarkerDrag(
              markerType as "pickup" | "destination" | "charter",
              newPos.lat,
              newPos.lng,
            );
          });
        }

        markersRef.current.push(leafletMarker);
      });

      // Draw polyline connecting markers if there are multiple
      if (markers.length > 1) {
        const polylineCoords = markers.map(
          (m) => [m.lat, m.lon] as L.LatLngExpression,
        );
        polylineRef.current = L.polyline(polylineCoords, {
          color: "#FF6B35",
          weight: 2,
          opacity: 0.7,
          dashArray: "5, 5",
        }).addTo(mapRef.current);
      }

      // Fit bounds to show all markers
      if (bounds.isValid() && markers.length > 1) {
        setTimeout(() => {
          if (!mapRef.current) return;
          mapRef.current.invalidateSize(); // Ensure dimensions are correct
          mapRef.current.fitBounds(bounds, {
            padding: [50, 50], // 50px padding on all sides
            maxZoom: 15, // Don't zoom in too close
            animate: false, // No animation on initial load
          });
        }, 100);
      } else if (markers.length === 1) {
        // If only one marker, center on it
        mapRef.current?.setView([markers[0].lat, markers[0].lon], 15);
      }
    }, [markers, isMapReady, allowDragging, onMarkerDrag]);

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
  },
);

LeafletMap.displayName = "LeafletMap";

export default LeafletMap;
