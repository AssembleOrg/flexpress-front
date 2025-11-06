"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { MatchExpirationTimer } from "@/components/MatchExpirationTimer";
import {
  useRespondToMatch,
  useToggleAvailability,
} from "@/lib/hooks/mutations/useTravelMatchMutations";
import { useCharterMatches } from "@/lib/hooks/queries/useTravelMatchQueries";

export default function DriverDashboard() {
  const [isAvailable, setIsAvailable] = useState(false);
  const toggleMutation = useToggleAvailability();
  const { data: charterMatches, isLoading: matchesLoading } =
    useCharterMatches();
  const respondMutation = useRespondToMatch();

  // Filter pending matches (status: 'searching')
  const pendingMatches = charterMatches?.filter(
    (match) => match.status === "searching",
  );

  const handleAvailabilityChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newStatus = event.target.checked;
    setIsAvailable(newStatus);
    toggleMutation.mutate(newStatus);
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <AuthNavbar />

      <Container maxWidth="sm" sx={{ py: 4, px: 2 }}>
        {/* Status Toggle - Uber Driver Style */}
        <Card sx={{ mb: 3, overflow: "visible" }}>
          <CardContent sx={{ p: 3, textAlign: "center", position: "relative" }}>
            {/* Status indicator */}
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor: isAvailable ? "success.main" : "grey.400",
                position: "absolute",
                top: 16,
                right: 16,
              }}
            />

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {isAvailable ? "Estás en línea" : "Estás desconectado"}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={isAvailable}
                  onChange={handleAvailabilityChange}
                  size="medium"
                  color="secondary"
                />
              }
              label={
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {isAvailable ? "Conectado" : "Desconectado"}
                </Typography>
              }
              labelPlacement="top"
              sx={{ mb: 2 }}
            />

            <Typography variant="caption" color="text.secondary">
              {isAvailable
                ? "Recibiendo solicitudes de viajes"
                : "Actívate para empezar a ganar"}
            </Typography>
          </CardContent>
        </Card>

        {/* Earnings Summary - Quick Stats */}
        {isAvailable && (
          <Box display="flex" gap={2} mb={3}>
            <Card sx={{ flex: 1, p: 2, textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "success.main" }}
              >
                $1,250
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Esta semana
              </Typography>
            </Card>
            <Card sx={{ flex: 1, p: 2, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                0
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Viajes completados
              </Typography>
            </Card>
          </Box>
        )}

        {/* Pending Match Requests */}
        {isAvailable && (
          <Box mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              📋 Solicitudes Pendientes
            </Typography>

            {matchesLoading && (
              <Card sx={{ p: 3, textAlign: "center" }}>
                <CircularProgress size={40} />
              </Card>
            )}

            {!matchesLoading && pendingMatches && pendingMatches.length > 0 && (
              <Stack spacing={2}>
                {pendingMatches.map((match) => (
                  <Card key={match.id} sx={{ overflow: "hidden" }}>
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="start"
                        mb={2}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, flex: 1 }}
                        >
                          Nueva Solicitud de Flete
                        </Typography>
                        {match.expiresAt && (
                          <MatchExpirationTimer expiresAt={match.expiresAt} />
                        )}
                      </Box>

                      {/* User Information */}
                      <Box mb={2}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          👤 {match.user?.name}
                        </Typography>
                        {match.workersCount > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {match.workersCount}{" "}
                            {match.workersCount === 1
                              ? "trabajador"
                              : "trabajadores"}
                          </Typography>
                        )}
                        {match.scheduledDate && (
                          <Typography variant="caption" color="text.secondary">
                            📅{" "}
                            {new Date(match.scheduledDate).toLocaleDateString(
                              "es-AR",
                            )}
                          </Typography>
                        )}
                      </Box>

                      {/* Location Information */}
                      <Box mb={2} sx={{ pl: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          📍 Origen: {match.pickupAddress}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          📍 Destino: {match.destinationAddress}
                        </Typography>
                      </Box>

                      {/* Action Buttons */}
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() =>
                            respondMutation.mutate({
                              matchId: match.id,
                              accept: true,
                            })
                          }
                          disabled={respondMutation.isPending}
                          sx={{ flex: 1 }}
                        >
                          {respondMutation.isPending ? (
                            <CircularProgress size={20} />
                          ) : (
                            "Aceptar"
                          )}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            respondMutation.mutate({
                              matchId: match.id,
                              accept: false,
                            })
                          }
                          disabled={respondMutation.isPending}
                          sx={{ flex: 1 }}
                        >
                          {respondMutation.isPending ? (
                            <CircularProgress size={20} />
                          ) : (
                            "Rechazar"
                          )}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            {!matchesLoading &&
              (!pendingMatches || pendingMatches.length === 0) && (
                <Card sx={{ p: 3, textAlign: "center" }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    No hay solicitudes pendientes en este momento
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Te notificaremos cuando haya nuevas solicitudes
                  </Typography>
                </Card>
              )}
          </Box>
        )}

        {/* Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              ℹ️ Cómo Funciona
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Cuando estés conectado (disponible), recibirás notificaciones en
              tiempo real de nuevas solicitudes de viaje que coincidan con tu
              ubicación y disponibilidad.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Acepta o rechaza las solicitudes según tus preferencias. ¡Buena
              suerte!
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
