"use client";

import {
  ArrowBack,
  CheckCircle,
  CreditCard,
  Download,
  Flag,
  LocalShipping,
  LocationOn,
  Map,
  Navigation,
  ReportProblem,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { FinalizeTripModal } from "@/components/modals/FinalizeTripModal";
import { ReportModal } from "@/components/modals/ReportModal";
import { TripDetailsCard } from "@/components/trip/TripDetailsCard";
import { TripMetricsCard } from "@/components/trip/TripMetricsCard";
import LeafletMap, { type LeafletMapHandle } from "@/components/ui/LeafletMap";
import { conversationApi } from "@/lib/api/conversations";
import { useToggleAvailability } from "@/lib/hooks/mutations/useTravelMatchMutations";
import { useCharterCompleteTrip } from "@/lib/hooks/mutations/useTripMutations";
import {
  useCharterAvailability,
  useMatch,
} from "@/lib/hooks/queries/useTravelMatchQueries";
import { useTrip } from "@/lib/hooks/queries/useTripQueries";
import { useMyVehicles } from "@/lib/hooks/queries/useVehicleQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import { getDirectionsUrl } from "@/lib/utils/mapLinks";
import { downloadPDF, generateCharterReceipt } from "@/lib/utils/pdfGenerator";

export default function DriverMatchingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const { user, returnToOrigin, setReturnToOrigin } = useAuthStore();

  const { data: match, isLoading: matchLoading, refetch } = useMatch(matchId);
  const tripId = match?.tripId;
  const { data: trip, isLoading: tripLoading } = useTrip(tripId || "");

  const charterCompleteTripMutation = useCharterCompleteTrip();
  const toggleAvailabilityMutation = useToggleAvailability();
  const { data: myVehicles = [] } = useMyVehicles();
  const { data: availabilityData } = useCharterAvailability();
  const activeVehicleId = availabilityData?.vehicleId ?? null;
  const activeVehicle =
    myVehicles.find((v) => v.id === activeVehicleId) ??
    myVehicles.find((v) => v.isEnabled) ??
    myVehicles[0];
  const [finalizeTripModalOpen, setFinalizeTripModalOpen] = useState(false);
  const [availabilityConfirmed, setAvailabilityConfirmed] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [conversationRecoveryAttempt, setConversationRecoveryAttempt] =
    useState(0);
  const [conversationRecoveryFailed, setConversationRecoveryFailed] =
    useState(false);
  const isRecoveringConversation = useRef(false);
  const mapRef = useRef<LeafletMapHandle>(null);

  const handleDownload = () => {
    if (!trip) return;
    const doc = generateCharterReceipt(trip);
    downloadPDF(doc, `comprobante-${trip.id}.pdf`);
  };

  // Polling eliminado - useMatch ya tiene refetchInterval de 15s
  // WebSocket maneja updates en tiempo real

  // Detectar cuando el cliente rechaza
  const hasShownRejectionToast = useRef(false);
  useEffect(() => {
    if (match?.status === "rejected" && !hasShownRejectionToast.current) {
      toast.error("El cliente rechazó la solicitud de viaje");
      hasShownRejectionToast.current = true;
    }
  }, [match?.status]);

  // Detectar cuando el cliente cancela
  const hasShownCancellationToast = useRef(false);
  useEffect(() => {
    if (match?.status === "cancelled" && !hasShownCancellationToast.current) {
      toast.error("El cliente canceló la solicitud");
      hasShownCancellationToast.current = true;
      router.push("/driver/dashboard");
    }
  }, [match?.status, router]);

  // Recovery: si el match puede tener chat (accepted/completed) pero no hay
  // conversación (ni scalar ni relación), reintentar creación.
  useEffect(() => {
    const canHaveChat =
      match?.status === "accepted" || match?.status === "completed";
    if (
      !canHaveChat ||
      match?.conversationId ||
      match?.conversation?.id ||
      conversationRecoveryFailed ||
      isRecoveringConversation.current
    ) {
      return;
    }

    const MAX_ATTEMPTS = 2;

    if (conversationRecoveryAttempt >= MAX_ATTEMPTS) {
      setConversationRecoveryFailed(true);
      console.warn("⚠️ [CONV RECOVERY] All recovery attempts exhausted");
      return;
    }

    const delay = (conversationRecoveryAttempt + 1) * 1500;

    const timerId = setTimeout(async () => {
      if (isRecoveringConversation.current) return;
      isRecoveringConversation.current = true;

      const attemptNumber = conversationRecoveryAttempt + 1;
      console.log(
        `🔄 [CONV RECOVERY] Attempt ${attemptNumber}/${MAX_ATTEMPTS} for match ${matchId}`,
      );
      setConversationRecoveryAttempt(attemptNumber);

      try {
        await conversationApi.createFromMatch(matchId);
        console.log(
          `✅ [CONV RECOVERY] Conversation created on attempt ${attemptNumber}`,
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        await refetch();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          console.log(
            "ℹ️ [CONV RECOVERY] 409 — conversation exists, refetching match...",
          );
          await new Promise((resolve) => setTimeout(resolve, 500));
          await refetch();
        } else {
          console.error(
            `❌ [CONV RECOVERY] Attempt ${attemptNumber} failed:`,
            error,
          );
        }
      } finally {
        isRecoveringConversation.current = false;
      }
    }, delay);

    return () => clearTimeout(timerId);
  }, [
    match?.status,
    match?.conversationId,
    match?.conversation?.id,
    matchId,
    conversationRecoveryAttempt,
    conversationRecoveryFailed,
    refetch,
  ]);

  const handleCharterCompleteTrip = async () => {
    if (!tripId) return;
    try {
      await charterCompleteTripMutation.mutateAsync(tripId);
      setFinalizeTripModalOpen(false);
      toast.success("Viaje finalizado. Esperando confirmación del cliente.");
    } catch (error) {
      console.error("Error completing trip:", error);
      toast.error("Error al finalizar el viaje");
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

  // El scalar match.conversationId puede quedar desincronizado (null) aunque la
  // conversación exista; usamos la relación incluida por el backend como fallback.
  const conversationId = match.conversationId ?? match.conversation?.id;

  const _isCompletingTrip = charterCompleteTripMutation.isPending;
  const _tripCompleted = trip?.status === "completed";

  // Determine trip status for UI
  const getStatusInfo = () => {
    if (!tripId) {
      return { label: "En Conversación", color: "primary" as const };
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

      <MobileContainer withBottomNav maxWidth="lg">
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
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 1.5,
            mb: { xs: 0, md: 0 },
          }}
        >
          {/* Left column: Chat + Action Buttons */}
          <Box>
            {!conversationId ? (
              <Card>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                  {!conversationRecoveryFailed ? (
                    <>
                      <CircularProgress sx={{ mb: 2 }} />
                      <Typography
                        variant="h6"
                        color="textSecondary"
                        sx={{ mb: 1 }}
                      >
                        {conversationRecoveryAttempt === 0
                          ? "Preparando el chat..."
                          : "Configurando la conversación..."}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {conversationRecoveryAttempt === 0
                          ? "La conversación se está configurando. Esto toma solo unos segundos."
                          : `Reintentando... (intento ${conversationRecoveryAttempt}/2)`}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          mb={0.5}
                        >
                          No se pudo configurar la conversación
                        </Typography>
                        <Typography variant="body2">
                          No pudimos conectar el chat automáticamente. Vuelve al
                          dashboard e intenta acceder nuevamente en unos
                          momentos.
                        </Typography>
                      </Alert>
                      <Link href="/driver/dashboard">
                        <Button variant="contained" color="secondary">
                          Volver al Dashboard
                        </Button>
                      </Link>
                    </>
                  )}
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
                  conversationId={conversationId}
                  otherUser={{
                    id: match.user?.id || "",
                    name: match.user?.name || "Usuario",
                    avatar: match.user?.avatar ?? null,
                  }}
                  onClose={() => router.push("/driver/dashboard")}
                />
              </Box>
            )}

            {/* Action Buttons - directly below chat */}
            <Stack spacing={1} sx={{ mt: 1.5 }}>
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
                      bgcolor: "background.paper",
                      border: "2px solid",
                      borderColor: "success.main",
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
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: "text.primary",
                        }}
                      >
                        Viaje Confirmado
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.7rem" }}
                        color="text.secondary"
                      >
                        Créditos reservados
                      </Typography>
                    </Box>
                  </Box>

                  {/* Complete trip button */}
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={() => setFinalizeTripModalOpen(true)}
                    sx={{
                      gridColumn: { xs: "1 / -1", md: "2 / 3" },
                      minHeight: { xs: 44, md: "100%" },
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    Finalizar Viaje
                  </Button>

                  {/* Report problem button */}
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    size="small"
                    startIcon={<ReportProblem sx={{ fontSize: 18 }} />}
                    onClick={() => setReportModalOpen(true)}
                    sx={{
                      gridColumn: "1 / -1",
                      minHeight: 40,
                      fontSize: "0.8rem",
                    }}
                  >
                    Reportar Problema
                  </Button>
                </Box>
              )}

              {/* Estado 3: Charter finalizó, esperando cliente */}
              {tripId &&
                trip?.status === "charter_completed" &&
                (() => {
                  const hasOrigin = !!user?.originLatitude;
                  const vehicleId = activeVehicle?.id ?? myVehicles[0]?.id;

                  if (availabilityConfirmed) {
                    return (
                      <Alert severity="success">
                        <Typography variant="caption">
                          Estás disponible. Revisá el dashboard para nuevos
                          viajes.
                        </Typography>
                      </Alert>
                    );
                  }

                  return (
                    <Box
                      sx={{
                        border: "1px solid",
                        borderColor: "warning.main",
                        borderRadius: 1.5,
                        p: 2,
                        bgcolor: "warning.50",
                      }}
                    >
                      <Typography variant="body2" fontWeight={700} mb={0.5}>
                        Viaje finalizado — Esperando confirmación del cliente
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={1.5}
                      >
                        ¿Querés aparecer disponible para un nuevo viaje?
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        {hasOrigin && (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            disabled={toggleAvailabilityMutation.isPending}
                            onClick={() => {
                              toggleAvailabilityMutation.mutate(
                                { isAvailable: true, vehicleId },
                                {
                                  onSuccess: () => {
                                    setReturnToOrigin(true);
                                    setAvailabilityConfirmed(true);
                                    toast.success("Estás disponible");
                                  },
                                },
                              );
                            }}
                          >
                            Volver a mi zona
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={toggleAvailabilityMutation.isPending}
                          onClick={() => {
                            toggleAvailabilityMutation.mutate(
                              { isAvailable: true, vehicleId },
                              {
                                onSuccess: () => {
                                  setReturnToOrigin(false);
                                  setAvailabilityConfirmed(true);
                                  toast.success("Estás disponible");
                                },
                              },
                            );
                          }}
                        >
                          Cualquier viaje
                        </Button>
                      </Stack>
                    </Box>
                  );
                })()}

              {/* Estado 4: Viaje completado por AMBOS */}
              {tripId && trip?.status === "completed" && (
                <>
                  <Box sx={{ textAlign: "center", py: 1.5 }}>
                    <CheckCircle
                      sx={{ fontSize: 52, color: "success.main", mb: 1 }}
                    />
                    <Typography variant="h6" fontWeight={700}>
                      Viaje Completado
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Créditos transferidos exitosamente
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="center"
                      spacing={5}
                      sx={{ mt: 2.5 }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <IconButton
                          onClick={handleDownload}
                          sx={{
                            bgcolor: "action.hover",
                            width: 54,
                            height: 54,
                          }}
                        >
                          <Download />
                        </IconButton>
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          Comprobante
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: "center" }}>
                        <IconButton
                          onClick={() => setReportModalOpen(true)}
                          sx={{
                            bgcolor: "action.hover",
                            width: 54,
                            height: 54,
                          }}
                        >
                          <ReportProblem sx={{ color: "error.main" }} />
                        </IconButton>
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          Reportar
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={() => router.push("/driver/dashboard")}
                    fullWidth
                    sx={{ minHeight: 48, mt: 1 }}
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
              cargo={match.cargoDescription}
              otherUser={{
                name: match.user?.name || "Cliente",
                avatar: match.user?.avatar ?? undefined,
                role: "Cliente",
              }}
              personnel={match.personnel?.snapshot}
              status={statusInfo}
              metadata={
                activeVehicle
                  ? [
                      {
                        icon: <LocalShipping sx={{ fontSize: 16 }} />,
                        label: "Vehículo",
                        value:
                          [activeVehicle.brand, activeVehicle.model]
                            .filter(Boolean)
                            .join(" ") || "Sin datos",
                      },
                      ...(activeVehicle.plate
                        ? [
                            {
                              icon: <CreditCard sx={{ fontSize: 16 }} />,
                              label: "Patente",
                              value: activeVehicle.plate,
                            },
                          ]
                        : []),
                    ]
                  : undefined
              }
            />

            {/* Trip Map Card */}
            <Card sx={{ mb: 1.5 }}>
              <CardContent sx={{ p: 1.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 1,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  📍 Mapa del Viaje
                </Typography>

                <LeafletMap
                  ref={mapRef}
                  markers={[
                    {
                      lat: Number.parseFloat(match.pickupLatitude),
                      lon: Number.parseFloat(match.pickupLongitude),
                      label: "Origen",
                      type: "pickup",
                    },
                    {
                      lat: Number.parseFloat(match.destinationLatitude),
                      lon: Number.parseFloat(match.destinationLongitude),
                      label: "Destino",
                      type: "destination",
                    },
                  ]}
                  height="250px"
                  disableInteraction={true}
                />

                {/* Map navigation buttons */}
                <Box
                  sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<LocationOn />}
                    onClick={() => {
                      mapRef.current?.centerOnMarker(
                        Number.parseFloat(match.pickupLatitude),
                        Number.parseFloat(match.pickupLongitude),
                      );
                    }}
                  >
                    Ver Origen
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<Flag />}
                    onClick={() => {
                      mapRef.current?.centerOnMarker(
                        Number.parseFloat(match.destinationLatitude),
                        Number.parseFloat(match.destinationLongitude),
                      );
                    }}
                  >
                    Ver Destino
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    startIcon={<Map />}
                    onClick={() => {
                      mapRef.current?.fitAllMarkers();
                      toast.success("Mostrando ruta completa");
                    }}
                    sx={{
                      bgcolor: "secondary.main",
                      "&:hover": { bgcolor: "secondary.dark" },
                    }}
                  >
                    Ruta Completa
                  </Button>
                </Box>

                {/* Botón primario: abrir Google Maps en modo navegación */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Navigation />}
                  onClick={() =>
                    window.open(
                      getDirectionsUrl(
                        Number.parseFloat(match.pickupLatitude),
                        Number.parseFloat(match.pickupLongitude),
                        Number.parseFloat(match.destinationLatitude),
                        Number.parseFloat(match.destinationLongitude),
                      ),
                      "_blank",
                      "noopener",
                    )
                  }
                  sx={{
                    mt: 1,
                    py: 1.1,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 700,
                    boxShadow: "none",
                    "&:hover": { boxShadow: "none" },
                  }}
                >
                  Cómo llegar
                </Button>
              </CardContent>
            </Card>

            {/* Trip Metrics Card */}
            <TripMetricsCard distance={match.distanceKm ?? undefined} />
          </Box>
        </Box>
      </MobileContainer>

      {/* Finalize Trip Modal */}
      <FinalizeTripModal
        open={finalizeTripModalOpen}
        onClose={() => setFinalizeTripModalOpen(false)}
        onConfirm={handleCharterCompleteTrip}
        clientName={match.user?.name || "Cliente"}
        isLoading={charterCompleteTripMutation.isPending}
      />

      {/* Report Modal */}
      {conversationId && (
        <ReportModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          conversationId={conversationId}
          reportedUserId={match.userId}
          reportedUserName={match.user?.name || "Cliente"}
        />
      )}
    </>
  );
}
