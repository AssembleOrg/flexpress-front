"use client";

import {
  Assignment,
  Chat,
  Flag,
  LocationOn,
  Person,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { MobileMatchCard } from "@/components/cards/MobileMatchCard";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { MatchExpirationTimer } from "@/components/MatchExpirationTimer";
import { AcceptMatchModal } from "@/components/modals/AcceptMatchModal";
import { WelcomeHeader } from "@/components/ui/WelcomeHeader";
import {
  useRespondToMatch,
  useToggleAvailability,
} from "@/lib/hooks/mutations/useTravelMatchMutations";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import { useCharterMatches } from "@/lib/hooks/queries/useTravelMatchQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import type { TravelMatch } from "@/lib/types/api";
import { isMatchExpired } from "@/lib/utils/matchHelpers";

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

export default function DriverDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isAvailable, setIsAvailable] = useState(false);
  const toggleMutation = useToggleAvailability();
  const { data: charterMatches = [], isLoading: matchesLoading } =
    useCharterMatches();
  const respondMutation = useRespondToMatch();

  // Modal state
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedMatchForAccept, setSelectedMatchForAccept] =
    useState<TravelMatch | null>(null);

  // Filter pending matches defensively
  // Only show matches with:
  // 1. status === "pending"
  // 2. Not expired (expiresAt > now)
  const pendingMatches = charterMatches.filter((match) => {
    if (!match?.id || match.status !== "pending") {
      return false;
    }

    // Defensive: check if match has expired
    if (isMatchExpired(match)) {
      console.warn(
        `⏰ [DASHBOARD] Match ${match.id} has expired, filtering out`,
      );
      return false;
    }

    return true;
  });

  // Filter active conversations (accepted or completed matches with active conversations)
  // Show conversations where charter accepted and conversation exists
  // (conversationId is created immediately when charter accepts, before tripId)
  const activeConversations = charterMatches.filter((match) => {
    // Must have valid match ID
    if (!match?.id) return false;

    // Exclude trips that are already completed (should appear in history instead)
    if (match.trip?.status === "completed") return false;

    // Include accepted/completed matches WITH active conversations
    // Check conversationId instead of tripId (tripId only exists after client confirms)
    return (
      (match.status === "accepted" || match.status === "completed") &&
      !!match.conversationId
    );
  });

  const handleAvailabilityChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newStatus = event.target.checked;
    setIsAvailable(newStatus);
    toggleMutation.mutate(newStatus);
  };

  const handleRejectMatch = (matchId: string) => {
    respondMutation.mutate({
      matchId,
      accept: false,
    });
  };

  return (
    <MobileContainer withBottomNav>
      {/* Welcome Header */}
      <WelcomeHeader userName={user?.name} userRole="charter" />

      {/* Status Toggle - Mobile-First */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        sx={{
          mb: 3,
          overflow: "visible",
          transition: "all 0.2s ease-in-out",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3 },
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Status indicator animado */}
          <Box
            sx={{
              width: { xs: 16, md: 14 },
              height: { xs: 16, md: 14 },
              borderRadius: "50%",
              bgcolor: isAvailable ? "success.main" : "grey.400",
              position: "absolute",
              top: { xs: 20, md: 16 },
              right: { xs: 20, md: 16 },
              animation: isAvailable ? "pulse 2s infinite" : "none",
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "1.2rem", md: "1.25rem" },
            }}
          >
            {isAvailable ? "Estás en línea" : "Estás desconectado"}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={isAvailable}
                onChange={handleAvailabilityChange}
                size="medium"
                color="secondary"
                sx={{
                  transform: { xs: "scale(1.2)", md: "scale(1)" },
                }}
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
      </MotionCard>

      {/* Credits Summary */}
      {isAvailable && (
        <MotionBox
          display="flex"
          gap={2}
          mb={3}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
        >
          <Card sx={{ flex: 1, p: 2, textAlign: "center" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "success.main" }}
            >
              {user?.credits || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Créditos Actuales
            </Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2, textAlign: "center" }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              fullWidth
              onClick={() => router.push("/driver/trips/history")}
              sx={{ fontWeight: 600 }}
            >
              Ver Historial
            </Button>
          </Card>
        </MotionBox>
      )}

      {/* Pending Match Requests */}
      {isAvailable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.1rem", md: "1.25rem" },
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Assignment fontSize="small" />
              Solicitudes Pendientes
            </Typography>
            {pendingMatches.length > 0 && (
              <Chip
                label={pendingMatches.length}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>

          {matchesLoading && (
            <Card sx={{ p: 3, textAlign: "center" }}>
              <CircularProgress size={40} />
            </Card>
          )}

          {!matchesLoading && pendingMatches.length > 0 && (
            <Stack spacing={2}>
              {pendingMatches.map((match) => {
                if (!match?.id) {
                  console.warn("⚠️ Match inválido:", match);
                  return null;
                }
                return (
                  <MobileMatchCard
                    key={match.id}
                    matchId={match.id}
                    user={{
                      name: match.user?.name || "Usuario",
                      avatar: match.user?.avatar ?? undefined,
                    }}
                    origin={match.pickupAddress || "No especificado"}
                    destination={match.destinationAddress || "No especificado"}
                    scheduledDate={
                      match.scheduledDate
                        ? new Date(match.scheduledDate).toLocaleDateString(
                            "es-AR",
                          )
                        : undefined
                    }
                    expiresIn={
                      match.expiresAt ? (
                        <MatchExpirationTimer expiresAt={match.expiresAt} />
                      ) : undefined
                    }
                    onAccept={() => {
                      setSelectedMatchForAccept(match);
                      setAcceptModalOpen(true);
                    }}
                    onReject={() => handleRejectMatch(match.id)}
                    isLoading={respondMutation.isPending}
                  />
                );
              })}
            </Stack>
          )}

          {!matchesLoading && pendingMatches.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  No hay solicitudes pendientes en este momento
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Te notificaremos cuando haya nuevas solicitudes
                </Typography>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Active Conversations Section */}
      {activeConversations.length > 0 && (
        <Box mb={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.1rem", md: "1.25rem" },
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Chat fontSize="small" />
              Conversaciones Activas
            </Typography>
            <Chip
              label={activeConversations.length}
              size="small"
              color="primary"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <Stack spacing={2}>
            {activeConversations.map((match) => (
              <Card
                key={match.id}
                sx={{
                  borderLeft: "4px solid",
                  borderLeftColor:
                    match.trip?.status === "completed"
                      ? "success.main"
                      : match.trip?.status === "charter_completed"
                        ? "warning.main"
                        : "primary.main",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                    gap={2}
                  >
                    <Box flex={1}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Person
                          fontSize="small"
                          sx={{ color: "primary.main" }}
                        />
                        {match.user?.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{
                          mb: 0.5,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 0.5,
                        }}
                      >
                        <LocationOn
                          fontSize="small"
                          sx={{ color: "primary.main", mt: 0.1 }}
                        />
                        {match.pickupAddress}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 0.5,
                        }}
                      >
                        <Flag
                          fontSize="small"
                          sx={{ color: "secondary.main", mt: 0.1 }}
                        />
                        {match.destinationAddress}
                      </Typography>
                    </Box>

                    {/* Status Chip */}
                    <Chip
                      label={
                        match.trip?.status === "completed"
                          ? "Completado"
                          : match.trip?.status === "charter_completed"
                            ? "Esperando Cliente"
                            : match.trip?.status === "pending"
                              ? "En Progreso"
                              : "Confirmado"
                      }
                      color={
                        match.trip?.status === "completed"
                          ? "success"
                          : match.trip?.status === "charter_completed"
                            ? "warning"
                            : "primary"
                      }
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  {/* Trip Info Row */}
                  <Box
                    display="flex"
                    gap={2}
                    mb={2}
                    sx={{
                      p: 1.5,
                      bgcolor: "background.default",
                      borderRadius: 1.5,
                    }}
                  >
                    {match.distanceKm && (
                      <Box flex={1} textAlign="center">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Distancia
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {match.distanceKm.toFixed(1)} km
                        </Typography>
                      </Box>
                    )}
                    {match.estimatedCredits && (
                      <Box flex={1} textAlign="center">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Créditos
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: "success.main" }}
                        >
                          {match.estimatedCredits}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      router.push(`/driver/trips/matching/${match.id}`)
                    }
                    fullWidth
                    sx={{
                      minHeight: 44,
                      fontWeight: 700,
                    }}
                  >
                    Ver Chat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {/* Accept Match Modal */}
      <AcceptMatchModal
        open={acceptModalOpen}
        onClose={() => {
          setAcceptModalOpen(false);
          setSelectedMatchForAccept(null);
        }}
        onAccept={async () => {
          if (selectedMatchForAccept) {
            try {
              // Use mutateAsync to wait for the response
              await respondMutation.mutateAsync({
                matchId: selectedMatchForAccept.id,
                accept: true,
              });

              setAcceptModalOpen(false);
              setSelectedMatchForAccept(null);

              // Invalidate and wait for fresh data
              await queryClient.invalidateQueries({
                queryKey: queryKeys.matches.all,
              });

              // Now redirect to the chat page
              // The conversation should now be available in the cached data
              router.push(
                `/driver/trips/matching/${selectedMatchForAccept?.id}`,
              );
            } catch (error) {
              console.error("❌ Error accepting match:", error);
              toast.error("Error al aceptar solicitud. Intenta de nuevo.");
              // Keep modal open on error so user can retry
              setAcceptModalOpen(true);
            }
          }
        }}
        onReject={() => {
          if (selectedMatchForAccept) {
            respondMutation.mutate(
              {
                matchId: selectedMatchForAccept.id,
                accept: false,
              },
              {
                onSuccess: () => {
                  setAcceptModalOpen(false);
                  setSelectedMatchForAccept(null);
                },
              },
            );
          }
        }}
        match={selectedMatchForAccept}
        isLoading={respondMutation.isPending}
      />
    </MobileContainer>
  );
}
