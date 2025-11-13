"use client";

import { ArrowBack, LocalShipping } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { geoApi } from "@/lib/api/geo";
import { AddressInput } from "@/components/ui/AddressInput";
import { LocationChip } from "@/components/ui/LocationChip";
// biome-ignore lint/suspicious/noShadowRestrictedNames: exported as alias from Map component
import { Map, type MapHandle } from "@/components/ui/Map";
import { useCreateMatch } from "@/lib/hooks/mutations/useTravelMatchMutations";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useAuthStore } from "@/lib/stores/authStore";
import { useTravelMatchStore } from "@/lib/stores/travelMatchStore";

export default function NewTripPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { isAuthenticated } = useAuthStore();

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      console.log("❌ [PAGE] User not authenticated, redirecting to login");
      router.push("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  // Form state from Zustand
  const {
    pickupAddress,
    pickupCoords,
    destinationAddress,
    destinationCoords,
    setPickupLocation,
    setDestinationLocation,
  } = useTravelMatchStore();

  // Mutation for creating match
  const createMatchMutation = useCreateMatch();

  // Estado para coordenadas pendientes (esperando geocodificación)
  const [pendingCoords, setPendingCoords] = useState<{
    type: 'pickup' | 'destination';
    lat: number;
    lon: number;
  } | null>(null);

  // Ref para controlar el mapa desde los chips
  const mapRef = useRef<MapHandle>(null);

  // Handle marker drag from map
  const handleMarkerDrag = (
    type: 'pickup' | 'destination' | 'charter',
    lat: number,
    lon: number
  ) => {
    // Solo actualizar estado pendiente
    if (type === 'pickup' || type === 'destination') {
      setPendingCoords({ type, lat, lon });
    }
  };

  // Vigilante reactivo: geocodifica cuando hay coordenadas pendientes
  useEffect(() => {
    if (!pendingCoords) return;

    const { type, lat, lon } = pendingCoords;

    // Debounce: esperar 500ms antes de llamar a la API
    const timeoutId = setTimeout(async () => {
      try {
        console.log('🔄 [PAGE] Calling reverse geocode from React context:', { type, lat, lon });

        const result = await geoApi.reverseGeocode(lat, lon);

        if (result) {
          const address = result.formattedAddress || result.address;

          // Actualizar Zustand store
          if (type === 'pickup') {
            setPickupLocation(address, { lat, lon });
            toast.success("📍 Origen ajustado en el mapa");
          } else if (type === 'destination') {
            setDestinationLocation(address, { lat, lon });
            toast.success("🎯 Destino ajustado en el mapa");
          }

          console.log('✅ [PAGE] Reverse geocode successful:', address);
        } else {
          console.warn('⚠️ [PAGE] No address found for coordinates');
          toast.error("No se encontró dirección para esta ubicación");
        }
      } catch (error) {
        console.error('❌ [PAGE] Error in reverse geocode:', error);
        toast.error("Error al obtener dirección");
      } finally {
        // Limpiar estado pendiente
        setPendingCoords(null);
      }
    }, 500); // Debounce de 500ms

    // Cleanup
    return () => clearTimeout(timeoutId);
  }, [pendingCoords, setPickupLocation, setDestinationLocation]);

  // Mostrar loading mientras se hidrata
  if (!hydrated) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  const isFormComplete =
    !!pickupAddress &&
    !!destinationAddress &&
    !!pickupCoords &&
    !!destinationCoords;

  // Handle centering map on pickup location
  const handleCenterOnPickup = () => {
    if (pickupCoords) {
      mapRef.current?.centerOnMarker(pickupCoords.lat, pickupCoords.lon);
      toast.success("Centrando en Origen");
    }
  };

  // Handle centering map on destination location
  const handleCenterOnDestination = () => {
    if (destinationCoords) {
      mapRef.current?.centerOnMarker(destinationCoords.lat, destinationCoords.lon);
      toast.success("Centrando en Destino");
    }
  };

  const handleCreateMatch = () => {
    if (!isFormComplete) return;

    createMatchMutation.mutate(
      {
        pickupAddress,
        pickupLatitude: pickupCoords.lat.toString(),
        pickupLongitude: pickupCoords.lon.toString(),
        destinationAddress,
        destinationLatitude: destinationCoords.lat.toString(),
        destinationLongitude: destinationCoords.lon.toString(),
      },
      {
        onSuccess: () => {
          router.push("/client/trips/matching");
        },
      },
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Link href="/client/dashboard">
          <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
            Volver al Dashboard
          </Button>
        </Link>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <LocalShipping sx={{ fontSize: 32, color: "secondary.main" }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Solicitar Viaje
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Completa los detalles de tu viaje y encontraremos el chófer perfecto
        </Typography>
      </Box>

      {/* Formulario */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Ubicaciones */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            📍 Ubicaciones
          </Typography>

          {/* Origen */}
          <Box sx={{ mb: 3 }}>
            <AddressInput
              label="Punto de Recogida"
              placeholder="Ej: Av. Hipólito Yrigoyen 8985, Buenos Aires"
              value={pickupAddress || ""}
              onAddressSelect={(address, lat, lon) => {
                setPickupLocation(address, { lat, lon });
                toast.success("Origen seleccionado");
              }}
            />
          </Box>

          {/* Destino */}
          <Box sx={{ mb: 3 }}>
            <AddressInput
              label="Punto de Destino"
              placeholder="Ej: Calle 13 567, La Plata, Buenos Aires"
              value={destinationAddress || ""}
              onAddressSelect={(address, lat, lon) => {
                setDestinationLocation(address, { lat, lon });
                toast.success("Destino seleccionado");
              }}
            />
          </Box>

          {/* Chips informativos con iconos de ubicación */}
          {(pickupAddress || destinationAddress) && (
            <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {pickupAddress && (
                <LocationChip
                  type="pickup"
                  address={pickupAddress}
                  onClick={handleCenterOnPickup}
                />
              )}
              {destinationAddress && (
                <LocationChip
                  type="destination"
                  address={destinationAddress}
                  onClick={handleCenterOnDestination}
                />
              )}
            </Box>
          )}

          {/* Mapa */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              📍 Vista del trayecto
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              💡 Arrastra los pines en el mapa para ajustar la ubicación exacta
            </Typography>
            <Map
              ref={mapRef}
              markers={[
                ...(pickupCoords
                  ? [
                      {
                        lat: pickupCoords.lat,
                        lon: pickupCoords.lon,
                        label: "Recogida",
                        type: "pickup" as const,
                      },
                    ]
                  : []),
                ...(destinationCoords
                  ? [
                      {
                        lat: destinationCoords.lat,
                        lon: destinationCoords.lon,
                        label: "Destino",
                        type: "destination" as const,
                      },
                    ]
                  : []),
              ]}
              height="300px"
              allowDragging={true}
              onMarkerDrag={handleMarkerDrag}
            />
          </Box>

          {/* Trabajadores */}
          {/* <Typography
            variant='subtitle2'
            sx={{ fontWeight: 600, mb: 2, mt: 3 }}
          >
            👥 Número de Trabajadores (Opcional)
          </Typography>

          <TextField
            type='number'
            label='Cantidad de trabajadores'
            value={workersCount}
            onChange={(e) => setWorkersCount(parseInt(e.target.value, 10) || 0)}
            inputProps={{ min: 0, max: 100 }}
            sx={{ mb: 4 }}
            helperText='Número de personas que viajarán contigo'
          /> */}

          {/* Botón de búsqueda */}
          <Box textAlign="center">
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleCreateMatch}
              disabled={createMatchMutation.isPending || !isFormComplete}
              sx={{
                fontSize: "1.125rem",
                fontWeight: 600,
                px: 6,
                py: 1.5,
                minWidth: 250,
              }}
            >
              {createMatchMutation.isPending
                ? "Buscando chóferes..."
                : "Buscar Chóferes"}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {!isFormComplete
                ? "Selecciona origen y destino para continuar"
                : "Se buscarán chóferes disponibles en tu área"}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
