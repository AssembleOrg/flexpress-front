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
import { useSelectCharter } from "@/lib/hooks/mutations/useTravelMatchMutations";
import { useCharterRating } from "@/lib/hooks/queries/useFeedbackQueries";
import { useTravelMatchStore } from "@/lib/stores/travelMatchStore";
import type { AvailableCharter } from "@/lib/types/api";

/**
 * Charter card wrapper that fetches and displays rating
 */
function CharterCardWithRating({
  charter,
  isLoading,
  onSelect,
}: {
  charter: AvailableCharter;
  isLoading: boolean;
  onSelect: () => void;
}) {
  const { data: feedback } = useCharterRating(charter.charterId);

  return (
    <CharterCard
      charter={charter}
      isLoading={isLoading}
      onSelect={onSelect}
      averageRating={feedback?.averageRating || 0}
      totalReviews={feedback?.totalFeedbacks || 0}
    />
  );
}

export default function MatchingPage() {
  const router = useRouter();
  const selectMutation = useSelectCharter();

  const {
    currentMatch,
    availableCharters,
    pickupAddress,
    pickupCoords,
    destinationAddress,
    destinationCoords,
  } = useTravelMatchStore();

  // Si no hay match activo, redirect de vuelta
  if (!currentMatch) {
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

  if (selectMutation.isPending) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Seleccionando chófer...</Typography>
      </Container>
    );
  }

  const handleSelectCharter = (charterId: string) => {
    if (!currentMatch) return;
    selectMutation.mutate(
      { matchId: currentMatch.id, charterId },
      {
        onSuccess: (result) => {
          router.push(`/client/trips/matching/${result.id}`);
        },
      },
    );
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
          Se encontraron {availableCharters.length} chóferes disponibles dentro
          de 30 km del origen
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
        <Box>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No se encontraron chóferes disponibles
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Buscamos dentro de 30 km de tu punto de recogida, pero no hay
              chóferes disponibles en este momento.
            </Typography>
            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
              <strong>Posibles razones:</strong>
              <ul style={{ marginTop: 8, marginBottom: 8, paddingLeft: 20 }}>
                <li>No hay chóferes dentro del radio de búsqueda</li>
                <li>Los chóferes cercanos no están disponibles ahora</li>
                <li>Todos están ocupados con otros viajes</li>
              </ul>
            </Typography>
            <Typography variant="body2" component="div">
              <strong>Sugerencias:</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Ajusta tu punto de recogida o destino</li>
                <li>Intenta en unos minutos cuando un chófer esté libre</li>
                <li>Contacta a soporte para asistencia</li>
              </ul>
            </Typography>
          </Alert>

          <Link href="/client/trips/new" style={{ textDecoration: "none" }}>
            <Button variant="contained" color="secondary">
              Buscar de Nuevo
            </Button>
          </Link>
        </Box>
      ) : (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
            Selecciona un chófer para continuar:
          </Typography>

          {availableCharters.map((charter) => (
            <CharterCardWithRating
              key={charter.charterId}
              charter={charter}
              isLoading={selectMutation.isPending}
              onSelect={() => handleSelectCharter(charter.charterId)}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}
