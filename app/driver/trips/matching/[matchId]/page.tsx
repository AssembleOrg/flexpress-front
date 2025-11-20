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
import { ArrowBack, CheckCircle } from "@mui/icons-material";
import Link from "next/link";
import toast from "react-hot-toast";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { TripDetailsCard } from "@/components/trip/TripDetailsCard";
import { TripMetricsCard } from "@/components/trip/TripMetricsCard";
import { MOBILE_BOTTOM_NAV_HEIGHT } from "@/lib/constants/mobileDesign";
import { useMatch } from "@/lib/hooks/queries/useTravelMatchQueries";
import { useTrip } from "@/lib/hooks/queries/useTripQueries";
import { useCharterCompleteTrip } from "@/lib/hooks/mutations/useTripMutations";
import { useAuthStore } from "@/lib/stores/authStore";
import type { User, UserRole } from "@/lib/types/api";

export default function DriverMatchingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const { user } = useAuthStore();

  const { data: match, isLoading: matchLoading, refetch } = useMatch(matchId);
  const tripId = match?.tripId;
  const { data: trip, isLoading: tripLoading } = useTrip(tripId || "");

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

  // Determine trip status for UI
  const getStatusInfo = () => {
    if (!tripId) {
      return { label: "Esperando Cliente", color: "warning" as const };
    }
    if (trip?.status === "completed") {
      return { label: "Completado", color: "success" as const };
    }
    if (trip?.status === "charter_completed") {
      return { label: "Esperando Cliente", color: "warning" as const };
    }
    if (trip?.status === "pending") {
      return { label: "En Progreso", color: "primary" as const };
    }
    return { label: "Confirmado", color: "success" as const };
  };

  const statusInfo = getStatusInfo();

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader
        title="Chat con Cliente"
        onBack={() => router.push("/driver/dashboard")}
      />

      <MobileContainer withBottomNav>
        {/* Desktop Header */}
        <Box sx={{ display: { xs: "none", md: "block" }, mb: 3 }}>
          <Link href="/driver/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver al Dashboard
            </Button>
          </Link>
        </Box>

        {/* Main content grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "3fr 1fr" },
            gap: 1.5,
            mb: { xs: 0, md: 0 },
          }}
        >
          {/* Left column: Chat + Action Buttons */}
          <Box>
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
              <Box
                sx={{
                  position: "relative",
                  minHeight: { xs: "450px", md: "600px" },
                }}
              >
                <ChatWindow
                  conversationId={match.conversation.id}
                  otherUser={{
                    id: match.user?.id || "",
                    email: match.user?.email || "",
                    name: match.user?.name || "Usuario",
                    role: (match.user?.role || "user") as UserRole,
                    credits: match.user?.credits || 0,
                    address: match.user?.address || "",
                    number: match.user?.number || "",
                    avatar: match.user?.avatar ?? null,
                    originAddress: null,
                    originLatitude: null,
                    originLongitude: null,
                    createdAt: match.user?.createdAt || new Date().toISOString(),
                    updatedAt: match.user?.updatedAt || new Date().toISOString(),
                  }}
                  onClose={() => router.push("/driver/dashboard")}
                />
              </Box>
            )}

            {/* Action Buttons - directly below chat */}
            <Stack spacing={1} sx={{ mt: 1.5 }}>
            {/* Estado 1: Esperando que cliente confirme el viaje */}
            {!tripId && (
              <Alert severity="info">
                <Typography variant="caption">
                  ℹ️ Esperando que el cliente confirme el viaje...
                </Typography>
              </Alert>
            )}

            {/* Estado 2: Trip confirmado, charter puede finalizar */}
            {tripId && trip?.status === "pending" && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", md: "2fr 1fr" },
                  gap: 1,
                  mb: 1.5,
                }}
              >
                {/* Status box */}
                <Box
                  sx={{
                    gridColumn: { xs: "1 / -1", md: "1 / 2" },
                    bgcolor: "success.light",
                    borderLeft: "4px solid",
                    borderLeftColor: "success.main",
                    borderRadius: 1.5,
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <CheckCircle sx={{ fontSize: 24, color: "success.main" }} />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, fontSize: "0.85rem", color: "success.dark" }}
                    >
                      Viaje Confirmado
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.7rem" }} color="text.secondary">
                      Créditos reservados
                    </Typography>
                  </Box>
                </Box>

                {/* Complete trip button */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleCharterCompleteTrip}
                  disabled={isCompletingTrip}
                  sx={{
                    gridColumn: { xs: "1 / -1", md: "2 / 3" },
                    minHeight: { xs: 44, md: "100%" },
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {isCompletingTrip ? (
                    <CircularProgress size={20} />
                  ) : (
                    "🏁 Finalizar Viaje"
                  )}
                </Button>
              </Box>
            )}

            {/* Estado 3: Charter finalizó, esperando cliente */}
            {tripId && trip?.status === "charter_completed" && (
              <Alert severity="warning">
                <Typography variant="caption">
                  ⏳ Has finalizado el viaje. Esperando confirmación del
                  cliente...
                </Typography>
              </Alert>
            )}

            {/* Estado 4: Viaje completado por AMBOS */}
            {tripId && trip?.status === "completed" && (
              <>
                <Alert severity="success" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    ✅ Viaje Completado
                  </Typography>
                  <Typography variant="caption">
                    Créditos transferidos exitosamente.
                  </Typography>
                </Alert>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/driver/dashboard")}
                  fullWidth
                  sx={{ minHeight: 48 }}
                >
                  Volver al Dashboard
                </Button>
              </>
            )}
            </Stack>
          </Box>

          {/* Right column: Trip Details */}
          <Box>
            {/* Trip Details Card */}
            <TripDetailsCard
              origin={match.pickupAddress || "No especificado"}
              destination={match.destinationAddress || "No especificado"}
              scheduledDate={
                match.scheduledDate
                  ? new Date(match.scheduledDate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : undefined
              }
              otherUser={{
                name: match.user?.name || "Cliente",
                avatar: match.user?.avatar ?? undefined,
                role: "Cliente",
              }}
              status={statusInfo}
            />

            {/* Trip Metrics Card */}
            <TripMetricsCard
              distance={match.distanceKm ?? undefined}
              credits={match.estimatedCredits ?? undefined}
            />
          </Box>
        </Box>
      </MobileContainer>
    </>
  );
}
