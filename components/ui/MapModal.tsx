"use client";

import { Close, MyLocation } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { geoApi } from "@/lib/api/geo";

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  onLocationSelect: (
    address: string,
    coordinates: { lat: number; lng: number },
  ) => void;
  title: string;
  fieldName: "origin" | "destination";
}

export default function MapModal({
  open,
  onClose,
  onLocationSelect,
  title,
  fieldName,
}: MapModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);
  const [isGettingAddress, setIsGettingAddress] = useState(false);

  // Buenos Aires coordinates
  const defaultCenter = { lat: -34.6118, lng: -58.396 };

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setSelectedLocation(null);
      // Simular carga del mapa
      setTimeout(() => setIsLoading(false), 1500);
    }
  }, [open]);

  // Reverse geocoding function using centralized geoApi
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const result = await geoApi.reverseGeocode(lat, lng);

      if (result) {
        return result.formattedAddress || result.address;
      }

      // Fallback: return coordinates if no address found
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setIsGettingAddress(true);

    try {
      const address = await reverseGeocode(lat, lng);
      setSelectedLocation({ lat, lng, address });
    } catch (_error) {
      setSelectedLocation({
        lat,
        lng,
        address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      });
    } finally {
      setIsGettingAddress(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(
        selectedLocation.address ||
          `Lat: ${selectedLocation.lat}, Lng: ${selectedLocation.lng}`,
        { lat: selectedLocation.lat, lng: selectedLocation.lng },
      );
      onClose();
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleMapClick(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to Buenos Aires center
          handleMapClick(defaultCenter.lat, defaultCenter.lng);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: "80vh" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            flexDirection="column"
            gap={2}
          >
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Cargando mapa interactivo...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Instructions */}
            <Alert
              severity="info"
              sx={{ m: 2, mb: 1 }}
              action={
                <Button
                  size="small"
                  startIcon={<MyLocation />}
                  onClick={handleCurrentLocation}
                  variant="outlined"
                >
                  Mi ubicación
                </Button>
              }
            >
              <Typography variant="body2">
                <strong>Instrucciones:</strong> Haz clic en el mapa donde
                quieres{" "}
                {fieldName === "origin" ? "ser recogido" : "que te lleven"}. La
                dirección aparecerá automáticamente.
              </Typography>
            </Alert>

            <Box
              sx={{
                flex: 1,
                position: "relative",
                m: 2,
                mt: 1,
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "grey.100",
              }}
            >
              {/* COPIAR O USAR FLETALO QUIZAS? idea<iframe
                src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d13138.508296788736!2d${defaultCenter.lng}!3d${defaultCenter.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sar!4v1645123456789!5m2!1sen!2sar`}
                width='100%'
                height='100%'
                style={{ border: 0, minHeight: 300 }}
                allowFullScreen
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
                title='Seleccionar ubicación'
              /> */}

              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  cursor: "crosshair",
                }}
                onClick={() => {
                  const randomLat =
                    defaultCenter.lat + (Math.random() - 0.5) * 0.1;
                  const randomLng =
                    defaultCenter.lng + (Math.random() - 0.5) * 0.1;
                  handleMapClick(randomLat, randomLng);
                }}
              />
            </Box>

            {/* Selected Location Display */}
            {selectedLocation && (
              <Box sx={{ p: 2, pt: 0 }}>
                <Alert
                  severity="success"
                  sx={{
                    "& .MuiAlert-message": {
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    },
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      📍 Ubicación seleccionada:
                    </Typography>
                    {isGettingAddress ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={16} />
                        <Typography variant="body2">
                          Obteniendo dirección...
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2">
                        {selectedLocation.address}
                      </Typography>
                    )}
                  </Box>
                </Alert>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedLocation || isGettingAddress}
          sx={{ minWidth: 120 }}
        >
          {isGettingAddress ? "Procesando..." : "Confirmar Ubicación"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
