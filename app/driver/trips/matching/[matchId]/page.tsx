"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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
import toast from "react-hot-toast";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useMatch } from "@/lib/hooks/queries/useTravelMatchQueries";
import { useTrip } from "@/lib/hooks/queries/useTripQueries";
import { useCompleteTrip } from "@/lib/hooks/mutations/useTripMutations";
import { useAuthStore } from "@/lib/stores/authStore";

export default function DriverMatchingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const { user } = useAuthStore();

  const { data: match, isLoading: matchLoading } = useMatch(matchId);
  const tripId = match?.tripId;
  const { data: trip, isLoading: tripLoading } = useTrip(tripId || "", {
    enabled: !!tripId,
  });

  const completeTripMutation = useCompleteTrip();

  const handleCompleteTrip = async () => {
    if (!tripId) return;
    try {
      await completeTripMutation.mutateAsync(tripId);
      router.push(`/driver/trips/${tripId}`);
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

  const isCompletingTrip = completeTripMutation.isPending;
  const tripCompleted = trip?.status === "completed";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Chat Section */}
        <Grid item xs={12} md={8}>
          {match.conversation && (
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
                      textTransform: "capitalize",
                      fontWeight: 600,
                      color: tripCompleted ? "success.main" : "info.main",
                    }}
                  >
                    {trip.status}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Stack spacing={1}>
              {/* Waiting for client confirmation */}
              {!tripId && (
                <Alert severity="info">
                  ℹ️ Esperando que el cliente confirme el viaje...
                </Alert>
              )}

              {tripId && !tripCompleted && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ El cliente confirmó el viaje. Los créditos están
                  reservados.
                </Alert>
              )}

              {tripId && !tripCompleted && (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={handleCompleteTrip}
                  disabled={isCompletingTrip}
                  size="large"
                >
                  {isCompletingTrip ? (
                    <CircularProgress size={20} />
                  ) : (
                    "🏁 Finalizar Viaje"
                  )}
                </Button>
              )}

              {tripCompleted && (
                <Alert severity="success">✅ Viaje completado</Alert>
              )}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
