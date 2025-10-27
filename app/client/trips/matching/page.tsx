"use client";

import { ArrowBack } from "@mui/icons-material";
import {
  Alert,
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
import { CharterCard } from "@/components/ui/CharterCard";
import { RouteMap } from "@/components/ui/Map";
import { useTravelMatch } from "@/lib/hooks/useTravelMatch";

export default function MatchingPage() {
  const router = useRouter();
  const {
    currentMatch,
    availableCharters,
    isLoading,
    selectCharter,
    pickupAddress,
    pickupCoords,
    destinationAddress,
    destinationCoords,
  } = useTravelMatch();

  // Si no hay match activo, redirect de vuelta
  if (!currentMatch && !isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography>
            No hay búsqueda activa. Por favor crea una nueva búsqueda.
          </Typography>
        </Alert>
        <Link href="/client/trips/new">
          <Button variant="contained" color="secondary">
            Crear Nueva Búsqueda
          </Button>
        </Link>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Buscando chóferes disponibles...</Typography>
      </Container>
    );
  }

  const handleSelectCharter = async (charterId: string) => {
    const result = await selectCharter(charterId);
    if (result) {
      // Redirect a la vista de conversación o detalles del match
      router.push(`/client/trips/matching/${result.id}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Link href="/client/trips/new">
          <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
            Nueva Búsqueda
          </Button>
        </Link>

        <Box mb={2}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Chóferes Disponibles
          </Typography>

          {currentMatch && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              {pickupAddress && (
                <Chip
                  label={`📍 De: ${pickupAddress.slice(0, 25)}...`}
                  color="primary"
                  variant="outlined"
                />
              )}
              {destinationAddress && (
                <Chip
                  label={`🎯 A: ${destinationAddress.slice(0, 25)}...`}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>

        <Typography variant="body1" color="text.secondary">
          Se encontraron {availableCharters.length} chóferes disponibles en tu
          área
        </Typography>
      </Box>

      {/* Mapa de ruta */}
      {pickupCoords && destinationCoords && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Ruta del Viaje
            </Typography>
            <RouteMap
              pickup={{
                lat: pickupCoords.lat,
                lon: pickupCoords.lon,
                label: "Punto de Recogida",
                type: "pickup",
              }}
              destination={{
                lat: destinationCoords.lat,
                lon: destinationCoords.lon,
                label: "Punto de Destino",
                type: "destination",
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Lista de chóferes */}
      {availableCharters.length === 0 ? (
        <Alert severity="warning">
          <Typography>
            No se encontraron chóferes disponibles en este momento. Intenta más
            tarde.
          </Typography>
        </Alert>
      ) : (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
            Selecciona un chófer para continuar:
          </Typography>

          {availableCharters.map((charter) => (
            <CharterCard
              key={charter.charterId}
              charter={charter}
              isLoading={isLoading}
              onSelect={() => handleSelectCharter(charter.charterId)}
              averageRating={4.5}
              totalReviews={12}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}
