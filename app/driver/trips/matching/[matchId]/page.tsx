"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";
import toast from "react-hot-toast";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useMatch } from "@/lib/hooks/queries/useTravelMatchQueries";
import { useTrip } from "@/lib/hooks/queries/useTripQueries";
import { useCharterCompleteTrip } from "@/lib/hooks/mutations/useTripMutations";
import { useAuthStore } from "@/lib/stores/authStore";

export default function DriverMatchingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const { user } = useAuthStore();

  const { data: match, isLoading: matchLoading, refetch } = useMatch(matchId);
  const tripId = match?.tripId;
  const { data: trip, isLoading: tripLoading } = useTrip(tripId || "", {
    enabled: !!tripId,
  });

  const charterCompleteTripMutation = useCharterCompleteTrip();

  // Temporal MVP: Poll when waiting for client confirmation
  useEffect(() => {
    if (match?.trip?.status === 'charter_completed') {
      const interval = setInterval(() => {
        refetch();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [match?.trip?.status, refetch]);

  const handleCharterCompleteTrip = async () => {
    if (!tripId) return;
    try {
      await charterCompleteTripMutation.mutateAsync(tripId);
      // ✅ NO redirect! Se queda en la misma página
    } catch (error) {
      console.error("Error completing trip:", error);
    }
  };

  if (matchLoading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!match) {
    return (
      <Container sx={{ pt: 4 }}>
        <Alert severity="error">Solicitud no encontrada</Alert>
      </Container>
    );
  }

  const isCompletingTrip = charterCompleteTripMutation.isPending;
  const tripCompleted = trip?.status === "completed";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box mb={3}>
        <Link href="/driver/dashboard">
          <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
            Volver al Dashboard
          </Button>
        </Link>
      </Box>

      <Grid container spacing={3}>
        {/* Chat Section */}
        <Grid item xs={12} md={8}>
          {!match.conversation?.id ? (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                  Preparando el chat...
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  La conversación se está configurando. Esto toma solo unos
                  segundos.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <ChatWindow
              conversationId={match.conversation.id}
              otherUser={match.user}
              onClose={() => router.back()}
            />
          )}
        </Grid>

        {/* Trip Details Section */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Detalles del Viaje
                </Typography>

                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Cliente
                    </Typography>
                    <Typography variant="body2">
                      {match.user?.name || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Origen
                    </Typography>
                    <Typography variant="body2">
                      {match.pickupAddress || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Destino
                    </Typography>
                    <Typography variant="body2">
                      {match.destinationAddress || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Créditos Estimados
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {match.estimatedCredits || 0} créditos
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Trabajadores
                    </Typography>
                    <Typography variant="body2">
                      {match.workersCount || 1}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Trip Status */}
            {tripId && trip && (
              <Card>
                <CardContent>
                  <Typography variant="caption" color="textSecondary">
                    Estado del Viaje
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: trip.status === "completed"
                        ? "success.main"
                        : trip.status === "charter_completed"
                          ? "warning.main"
                          : "info.main",
                    }}
                  >
                    {trip.status === "pending"
                      ? "En Progreso"
                      : trip.status === "charter_completed"
                        ? "Esperando Confirmación del Cliente"
                        : trip.status === "completed"
                          ? "Completado"
                          : trip.status}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Stack spacing={2}>
              {/* Estado 1: Esperando que cliente confirme el viaje */}
              {!tripId && (
                <Alert severity="info">
                  ℹ️ Esperando que el cliente confirme el viaje...
                </Alert>
              )}

              {/* Estado 2: Trip confirmado, charter puede finalizar */}
              {tripId && trip?.status === "pending" && (
                <>
                  <Alert severity="success">
                    ✅ Viaje confirmado. Los créditos están reservados. Puedes
                    finalizarlo cuando termines el trabajo.
                  </Alert>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleCharterCompleteTrip}
                    disabled={isCompletingTrip}
                    size="large"
                  >
                    {isCompletingTrip ? (
                      <CircularProgress size={20} />
                    ) : (
                      "🏁 Finalizar Viaje"
                    )}
                  </Button>
                </>
              )}

              {/* Estado 3: Charter finalizó, esperando cliente */}
              {tripId && trip?.status === "charter_completed" && (
                <Alert severity="warning">
                  ⏳ Has finalizado el viaje. Esperando confirmación del
                  cliente...
                </Alert>
              )}

              {/* Estado 4: Viaje completado por AMBOS */}
              {tripId && trip?.status === "completed" && (
                <>
                  <Alert severity="success">
                    ✅ Viaje completado. Créditos transferidos exitosamente.
                  </Alert>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/driver/dashboard")}
                    fullWidth
                  >
                    Volver al Dashboard
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
