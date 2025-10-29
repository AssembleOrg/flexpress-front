"use client";

import {
  Cancel,
  Check,
  DirectionsCar,
  LocationOn,
  Phone,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { RouteMap } from "@/components/ui/Map";
import { useTravelMatch } from "@/lib/hooks/useTravelMatch";
import type { TravelMatch } from "@/lib/types/api";

export default function DriverMatchesPage() {
  const { myMatches, isLoading, loadCharterMatches, respondToMatch } =
    useTravelMatch();

  const [selectedMatch, setSelectedMatch] = useState<TravelMatch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadCharterMatches();
  }, [loadCharterMatches]);

  const handleOpenDetails = (match: TravelMatch) => {
    setSelectedMatch(match);
    setDialogOpen(true);
  };

  const handleAcceptMatch = async () => {
    if (!selectedMatch) return;

    const result = await respondToMatch(selectedMatch.id, true);
    if (result) {
      setDialogOpen(false);
      setSelectedMatch(null);
    }
  };

  const handleRejectMatch = async () => {
    if (!selectedMatch) return;

    const result = await respondToMatch(selectedMatch.id, false);
    if (result) {
      setDialogOpen(false);
      setSelectedMatch(null);
    }
  };

  if (isLoading && myMatches.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Cargando solicitudes...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Solicitudes de Viaje
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Solicitudes de usuarios esperando tu respuesta
        </Typography>
      </Box>

      {/* Lista de solicitudes */}
      {myMatches.length === 0 ? (
        <Alert severity="info">
          <Typography>
            No tienes solicitudes pendientes en este momento.
          </Typography>
        </Alert>
      ) : (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
            {myMatches.length} solicitud{myMatches.length !== 1 ? "es" : ""}{" "}
            pendiente{myMatches.length !== 1 ? "s" : ""}
          </Typography>

          {myMatches.map((match) => (
            <Card key={match.id} sx={{ mb: 2 }}>
              <CardContent>
                {/* Usuario información */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Solicitud de {match.user?.name || "Usuario"}
                  </Typography>
                  {match.user?.number && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Phone sx={{ fontSize: 16, color: "primary.main" }} />
                      <Typography variant="body2">
                        {match.user.number}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Ruta */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <LocationOn
                      sx={{ fontSize: 18, color: "primary.main", mt: 0.5 }}
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        De
                      </Typography>
                      <Typography variant="body2">
                        {match.pickupAddress}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                  >
                    <LocationOn
                      sx={{ fontSize: 18, color: "secondary.main", mt: 0.5 }}
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        A
                      </Typography>
                      <Typography variant="body2">
                        {match.destinationAddress}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Detalles */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {match.distanceKm && (
                    <Chip
                      icon={<DirectionsCar />}
                      label={`${match.distanceKm.toFixed(1)} km`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {match.estimatedCredits && (
                    <Chip
                      label={`${match.estimatedCredits} créditos`}
                      size="small"
                      color="success"
                      variant="filled"
                    />
                  )}
                  {match.workersCount > 0 && (
                    <Chip
                      label={`${match.workersCount} trabajador${match.workersCount > 1 ? "es" : ""}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Botones */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Check />}
                    onClick={() => handleOpenDetails(match)}
                    fullWidth
                  >
                    Ver Detalles & Aceptar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => handleRejectMatch()}
                  >
                    Rechazar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialog de detalles */}
      {selectedMatch && (
        <Dialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedMatch(null);
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Detalles de Solicitud - {selectedMatch.user?.name}
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            {/* Información del usuario */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Información del Usuario
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2">
                  <strong>Nombre:</strong> {selectedMatch.user?.name}
                </Typography>
                {selectedMatch.user?.email && (
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedMatch.user.email}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Ruta */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Ruta del Viaje
              </Typography>
              <RouteMap
                pickup={{
                  lat: parseFloat(selectedMatch.pickupLatitude),
                  lon: parseFloat(selectedMatch.pickupLongitude),
                  label: "Recogida",
                  type: "pickup",
                }}
                destination={{
                  lat: parseFloat(selectedMatch.destinationLatitude),
                  lon: parseFloat(selectedMatch.destinationLongitude),
                  label: "Destino",
                  type: "destination",
                }}
              />
            </Box>

            {/* Detalles */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Detalles del Viaje
              </Typography>
              <Box sx={{ pl: 2 }}>
                {selectedMatch.distanceKm && (
                  <Typography variant="body2">
                    <strong>Distancia:</strong>{" "}
                    {selectedMatch.distanceKm.toFixed(1)} km
                  </Typography>
                )}
                {selectedMatch.estimatedCredits && (
                  <Typography variant="body2">
                    <strong>Tarifa:</strong> {selectedMatch.estimatedCredits}{" "}
                    créditos
                  </Typography>
                )}
                {selectedMatch.workersCount > 0 && (
                  <Typography variant="body2">
                    <strong>Trabajadores:</strong> {selectedMatch.workersCount}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => {
                setDialogOpen(false);
                setSelectedMatch(null);
              }}
              variant="outlined"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRejectMatch}
              color="error"
              variant="outlined"
            >
              Rechazar
            </Button>
            <Button
              onClick={handleAcceptMatch}
              color="success"
              variant="contained"
            >
              Aceptar Solicitud
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}
