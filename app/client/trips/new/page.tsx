"use client";

import { ArrowBack, LocalShipping } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { AddressInput } from "@/components/ui/AddressInput";
// biome-ignore lint/suspicious/noShadowRestrictedNames: exported as alias from Map component
import { Map } from "@/components/ui/Map";
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

          {/* Chips informativos */}
          {(pickupAddress || destinationAddress) && (
            <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {pickupAddress && (
                <Chip
                  label={`📍 Origen: ${pickupAddress.slice(0, 30)}...`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
              {destinationAddress && (
                <Chip
                  label={`🎯 Destino: ${destinationAddress.slice(0, 30)}...`}
                  color="secondary"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          )}

          {/* Mapa */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              📍 Vista del trayecto
            </Typography>
            <Map
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
