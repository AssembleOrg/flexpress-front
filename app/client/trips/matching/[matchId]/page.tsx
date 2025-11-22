"use client";

import { ArrowBack, LocationOn, Flag } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircle, Warning } from "@mui/icons-material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { ReportModal } from "@/components/modals/ReportModal";
import { ConfirmTripModal } from "@/components/modals/ConfirmTripModal";
import { ConfirmCompletionModal } from "@/components/modals/ConfirmCompletionModal";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { TripDetailsCard } from "@/components/trip/TripDetailsCard";
import { TripMetricsCard } from "@/components/trip/TripMetricsCard";
import { ReceiptButton } from "@/components/trip/ReceiptButton";
import LeafletMap, { type MapMarker, type LeafletMapHandle } from "@/components/ui/LeafletMap";
import { MOBILE_BOTTOM_NAV_HEIGHT } from "@/lib/constants/mobileDesign";
import { useMatch } from "@/lib/hooks/queries/useTravelMatchQueries";
import {
  useCanGiveFeedback,
  useCharterRating,
} from "@/lib/hooks/queries/useFeedbackQueries";
import {
  useCreateTripFromMatch,
  useCancelMatch,
} from "@/lib/hooks/mutations/useTravelMatchMutations";
import { useClientConfirmCompletion } from "@/lib/hooks/mutations/useTripMutations";
import {
  useMatchUpdateListener,
  useTripCompletedListener,
} from "@/lib/hooks/useWebSocket";
import { useAuthStore } from "@/lib/stores/authStore";
import type { User } from "@/lib/types/api";
import { TravelMatchStatus, UserRole } from "@/lib/types/api";

/**
 * Match detail page with conditional UI based on match status
 *
 * Shows different UI depending on the match status:
 * - pending: "Waiting for charter response" message
 * - accepted: Chat window (conversation ready)
 * - rejected: "Charter rejected" message with option to search again
 * - expired: "Request expired" message with option to search again
 */
export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [confirmTripModalOpen, setConfirmTripModalOpen] = useState(false);
  const [confirmCompletionModalOpen, setConfirmCompletionModalOpen] = useState(false);

  const { user } = useAuthStore();
  const { data: match, isLoading, refetch: refetchMatch } = useMatch(matchId);
  const createTripMutation = useCreateTripFromMatch();
  const cancelMatchMutation = useCancelMatch();
  const clientConfirmCompletionMutation = useClientConfirmCompletion();
  const [conversationLoadingTimeout, setConversationLoadingTimeout] =
    useState(false);
  const [charterFinalized, setCharterFinalized] = useState(false);
  const hasShownAcceptToast = useRef(false);
  const mapRef = useRef<LeafletMapHandle>(null);

  // Feedback/Rating related hooks
  // Always call hooks (never conditionally) - use enabled option instead
  const { data: charterRatingData } = useCharterRating(match?.charterId || "", {
    enabled: !!match?.charterId,
  });
  const { data: canGiveFeedback } = useCanGiveFeedback(match?.tripId || "", {
    enabled: !!match?.tripId,
  });

  console.log("🔍 [FEEDBACK] Debug info:", {
    canGiveFeedback,
    tripId: match?.tripId,
    tripStatus: match?.trip?.status,
    charterId: match?.charterId,
    charterName: match?.charter?.name,
  });

  // Determine if current user is the charter or the client
  const isCharter = user?.id === match?.charterId;
  const isClient = user?.id === match?.userId;

  // Listen to WebSocket match updates (charter accepts/rejects)
  useMatchUpdateListener(matchId, (newStatus) => {
    console.log(
      `📬 [CLIENT PAGE] Match status updated via WebSocket: ${newStatus}`,
    );
    // React Query will auto-refetch via WebSocket invalidation
  });

  // Handle conversation loading timeout and retry logic
  useEffect(() => {
    if (
      match?.status === TravelMatchStatus.ACCEPTED &&
      !match.conversationId &&
      !conversationLoadingTimeout
    ) {
      // Set timeout after 5 seconds
      const timeoutId = setTimeout(() => {
        setConversationLoadingTimeout(true);
        console.warn(
          "⚠️ Conversation not loaded after 5s, attempting refetch...",
        );
        refetchMatch();
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [
    match?.status,
    match?.conversationId,
    conversationLoadingTimeout,
    refetchMatch,
  ]);

  // Listen for charter finalization (trip completed)
  useTripCompletedListener(matchId, () => {
    setCharterFinalized(true);
    // Refetch match to get updated status
    refetchMatch();
  });

  // Handlers for trip confirmation and finalization
  const handleConfirmTrip = async () => {
    try {
      await createTripMutation.mutateAsync(matchId);
      toast.success("✅ Viaje confirmado. Los créditos han sido deducidos.");
      setConfirmTripModalOpen(false);
    } catch (error) {
      console.error("Error confirming trip:", error);
      toast.error("Error al confirmar el viaje");
    }
  };

  const handleFinalizeTrip = () => {
    if (!canGiveFeedback) {
      toast.error("Ya has dado feedback para este viaje");
      return;
    }
    setFeedbackModalOpen(true);
  };

  const handleClientConfirmCompletion = async () => {
    if (!match?.tripId) return;
    try {
      await clientConfirmCompletionMutation.mutateAsync(match.tripId);
      setConfirmCompletionModalOpen(false);
    } catch (error) {
      console.error("Error confirming completion:", error);
    }
  };

  const handleCancelMatch = async () => {
    if (!match?.id) return;
    try {
      await cancelMatchMutation.mutateAsync(match.id);
      router.push("/client/dashboard");
    } catch (error) {
      console.error("Error cancelling match:", error);
    }
  };

  // Auto-redirect to chat when match is accepted with conversationId
  useEffect(() => {
    if (match?.status === TravelMatchStatus.ACCEPTED && match?.conversationId) {
      console.log(`✅ [CLIENT PAGE] Match accepted, redirecting to chat`);

      // Fix: Solo mostrar toast una vez para evitar duplicados
      if (!hasShownAcceptToast.current) {
        toast.success("¡Chófer aceptó tu solicitud!");
        hasShownAcceptToast.current = true;
      }
      // Page will show ChatWindow via conditional rendering below
    }
  }, [match?.status, match?.conversationId]);

  // Auto-open feedback modal when trip is completed
  useEffect(() => {
    if (match?.trip?.status === "completed" && canGiveFeedback === true && !feedbackModalOpen) {
      setFeedbackModalOpen(true);
    }
  }, [match?.trip?.status, canGiveFeedback, feedbackModalOpen]);

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Cargando detalles del viaje...</Typography>
      </Container>
    );
  }

  // ============================================
  // ERROR STATE: Match not found
  // ============================================
  if (!match) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography>No se encontró la solicitud</Typography>
        </Alert>
        <Link href="/client/dashboard">
          <Button variant="contained" color="secondary">
            Volver al Dashboard
          </Button>
        </Link>
      </Container>
    );
  }

  // ============================================
  // PENDING STATE: Waiting for charter response
  // ============================================
  if (
    match.status === TravelMatchStatus.SEARCHING ||
    match.status === TravelMatchStatus.PENDING
  ) {
    const timeRemaining = match.expiresAt
      ? new Date(match.expiresAt).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "desconocido";

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Detalles del Viaje
          </Typography>
        </Box>

        {/* Waiting for response alert */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {isCharter
              ? "⏳ Solicitud Pendiente de Respuesta"
              : "⏳ Pendiente de Respuesta"}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {isCharter ? (
              <>
                Tienes una solicitud de viaje de{" "}
                <strong>{match.user?.name || "Cliente"}</strong>. Tienes hasta
                las {timeRemaining} para responder.
              </>
            ) : (
              <>
                El chófer <strong>{match.charter?.name || "Chófer"}</strong>{" "}
                tiene hasta las {timeRemaining} para responder a tu solicitud.
              </>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Mientras esperas, puedes revisar los detalles abajo.
          </Typography>
        </Alert>

        {/* Trip details */}
        <Stack spacing={3}>
          {/* Pickup and Destination */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                📍 Ruta del Viaje
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Punto de Recogida
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {match.pickupAddress || "No especificado"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Punto de Destino
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {match.destinationAddress || "No especificado"}
                </Typography>
              </Box>

              {match.scheduledDate && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fecha Programada
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(match.scheduledDate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Match Details */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                💼 Detalles
              </Typography>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Distancia
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {match.distanceKm
                      ? `${match.distanceKm.toFixed(1)} km`
                      : "N/A"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Créditos Estimados
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {match.estimatedCredits || 0} pts
                  </Typography>
                </Box>

                {match.workersCount && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Número de Trabajadores
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {match.workersCount}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => router.push("/client/dashboard")}
              fullWidth
            >
              Cancelar Solicitud
            </Button>
          </Box>
        </Stack>
      </Container>
    );
  }

  // ============================================
  // REJECTED STATE: Charter rejected
  // ============================================
  if (match.status === TravelMatchStatus.REJECTED) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Detalles del Viaje
          </Typography>
        </Box>

        {/* Rejected alert */}
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            ❌ Solicitud Rechazada
          </Typography>
          <Typography variant="body2">
            {isCharter ? (
              <>
                Rechazaste la solicitud de viaje de{" "}
                <strong>{match.user?.name || "Cliente"}</strong>.
              </>
            ) : (
              <>
                El chófer <strong>{match.charter?.name || "Chófer"}</strong>{" "}
                rechazó tu solicitud de viaje. Puedes buscar otro chófer
                disponible.
              </>
            )}
          </Typography>
        </Alert>

        {/* Trip details for reference */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Detalles de tu Solicitud
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Origen
              </Typography>
              <Typography variant="body2">
                {match.pickupAddress || "No especificado"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Destino
              </Typography>
              <Typography variant="body2">
                {match.destinationAddress || "No especificado"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Action button */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/client/trips/new")}
          fullWidth
          size="large"
        >
          Buscar Otro Chófer
        </Button>
      </Container>
    );
  }

  // ============================================
  // EXPIRED STATE: Request expired
  // ============================================
  if (match.status === TravelMatchStatus.EXPIRED) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Detalles del Viaje
          </Typography>
        </Box>

        {/* Expired alert */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            ⏰ Solicitud Expirada
          </Typography>
          <Typography variant="body2">
            El tiempo de espera para que el chófer respondiera ha expirado. Por
            favor, crea una nueva búsqueda para continuar.
          </Typography>
        </Alert>

        {/* Trip details for reference */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Detalles de tu Solicitud
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Origen
              </Typography>
              <Typography variant="body2">
                {match.pickupAddress || "No especificado"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Destino
              </Typography>
              <Typography variant="body2">
                {match.destinationAddress || "No especificado"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Action button */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/client/trips/new")}
          fullWidth
          size="large"
        >
          Nueva Búsqueda
        </Button>
      </Container>
    );
  }

  // ============================================
  // ACCEPTED & COMPLETED STATE: Show chat window
  // ============================================
  if (
    match.status === TravelMatchStatus.ACCEPTED ||
    match.status === TravelMatchStatus.COMPLETED
  ) {
    // Determine the other user based on current user's role
    const otherUser: User = isCharter
      ? {
          // Charter sees CLIENT as otherUser
          id: match.user?.id || match.userId || "",
          name: match.user?.name || "Cliente",
          email: match.user?.email || "",
          role: UserRole.USER,
          credits: match.user?.credits || 0,
          address: match.user?.address || "",
          number: match.user?.number || "",
          avatar: match.user?.avatar || null,
          originAddress: match.user?.originAddress || null,
          originLatitude: match.user?.originLatitude || null,
          originLongitude: match.user?.originLongitude || null,
          createdAt: match.user?.createdAt || new Date().toISOString(),
          updatedAt: match.user?.updatedAt || new Date().toISOString(),
        }
      : {
          // Client sees CHARTER as otherUser
          id: match.charter?.id || match.charterId || "",
          name: match.charter?.name || "Chófer",
          email: match.charter?.email || "",
          role: UserRole.CHARTER,
          credits: match.charter?.credits || 0,
          address: match.charter?.address || "",
          number: match.charter?.number || "",
          avatar: match.charter?.avatar || null,
          originAddress: match.charter?.originAddress || null,
          originLatitude: match.charter?.originLatitude || null,
          originLongitude: match.charter?.originLongitude || null,
          createdAt: match.charter?.createdAt || new Date().toISOString(),
          updatedAt: match.charter?.updatedAt || new Date().toISOString(),
        };

    // Validar que el match tenga conversación antes de mostrar el chat
    if (!match.conversationId) {
      return (
        <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
          <Box sx={{ my: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Preparando el chat...
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Por favor espera mientras configuramos la conversación.
            </Typography>

            {/* Show fallback button after timeout */}
            {conversationLoadingTimeout && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  La conversación está tardando más de lo esperado. Intenta
                  volver al dashboard y acceder nuevamente.
                </Alert>
                <Link href="/client/dashboard">
                  <Button variant="contained" color="secondary">
                    Volver al Dashboard
                  </Button>
                </Link>
              </Box>
            )}
          </Box>
        </Container>
      );
    }

    const conversationId = match.conversationId;

    // Determine trip status for UI
    const getStatusInfo = () => {
      if (!match.tripId) {
        return { label: "En Conversación", color: "primary" as const };
      }
      if (match.trip?.status === "completed") {
        return { label: "Completado", color: "success" as const };
      }
      if (match.trip?.status === "charter_completed") {
        return { label: "Esperando tu Confirmación", color: "warning" as const };
      }
      if (match.trip?.status === "pending") {
        return { label: "En Progreso", color: "primary" as const };
      }
      return { label: "Confirmado", color: "success" as const };
    };

    const statusInfo = getStatusInfo();

    return (
      <>
        {/* Mobile Header */}
        <MobileHeader
          title="Chat con Chófer"
          onBack={() => router.push("/client/dashboard")}
        />

        <MobileContainer withBottomNav>
          {/* Desktop Header */}
          <Box sx={{ display: { xs: "none", md: "block" }, mb: 4 }}>
            <Link href="/client/dashboard">
              <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
                Volver
              </Button>
            </Link>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Detalles del Viaje
              </Typography>
              <Chip
                label={statusInfo.label}
                color={statusInfo.color}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>

          {/* Main content grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
              gap: 1.5,
            }}
          >
            {/* Left column: Trip details - order 2 on mobile (appears below chat) */}
            <Box sx={{ order: { xs: 2, md: 1 } }}>
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
                  name: match.charter?.name || "Chófer",
                  avatar: match.charter?.avatar ?? undefined,
                  role: "Chófer",
                  rating: charterRatingData
                    ? {
                        average: charterRatingData.averageRating || 0,
                        count: charterRatingData.totalFeedbacks || 0,
                      }
                    : undefined,
                }}
                status={statusInfo}
              />

              {/* Trip Metrics Card */}
              <TripMetricsCard
                distance={match.distanceKm ?? undefined}
                credits={match.estimatedCredits ?? undefined}
              />

              {/* Map Card */}
              <Card sx={{ mb: 1.5 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 1, display: "block", fontSize: "0.7rem" }}
                  >
                    Mapa del Viaje
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
                    autoFitBounds={true}
                  />

                  {/* Map navigation buttons */}
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      startIcon={<LocationOn />}
                      onClick={() => {
                        mapRef.current?.centerOnMarker(
                          Number.parseFloat(match.pickupLatitude),
                          Number.parseFloat(match.pickupLongitude)
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
                          Number.parseFloat(match.destinationLongitude)
                        );
                      }}
                    >
                      Ver Destino
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Right column: Chat + Action Buttons - order 1 on mobile (appears first) */}
            <Box sx={{ order: { xs: 1, md: 2 } }}>
              <Box
                sx={{
                  position: "relative",
                  minHeight: { xs: "450px", md: "600px" },
                }}
              >
                <ErrorBoundary>
                  <ChatWindow
                    conversationId={conversationId}
                    otherUser={otherUser}
                    onClose={() => router.push("/client/dashboard")}
                  />
                </ErrorBoundary>
              </Box>

              {/* Action Buttons - directly below chat */}
              <Stack spacing={1} sx={{ mt: 1.5 }}>

              {/* Estado 1: Botón Confirmar Viaje + Cancelar */}
              {!match.tripId && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => setConfirmTripModalOpen(true)}
                    size="large"
                    sx={{ minHeight: 48 }}
                  >
                    ✅ Confirmar Viaje
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    size="small"
                    onClick={handleCancelMatch}
                    disabled={cancelMatchMutation.isPending || match.status === "completed"}
                    sx={{
                      minHeight: 40,
                      fontSize: "0.8rem",
                    }}
                  >
                    {cancelMatchMutation.isPending ? "Cancelando..." : "No Confirmar Viaje"}
                  </Button>
                </>
              )}

              {/* Estado 2: Trip confirmado, esperando charter */}
              {match.tripId && match.trip?.status === "pending" && (
                <>
                  {/* Status box */}
                  <Box
                    sx={{
                      bgcolor: "background.paper",
                      border: "2px solid",
                      borderColor: "success.main",
                      borderRadius: 1.5,
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 24, color: "success.main" }} />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.primary" }}
                      >
                        Viaje Confirmado
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: "0.7rem" }} color="text.secondary">
                        Créditos reservados
                      </Typography>
                    </Box>
                  </Box>

                  {/* Problem button */}
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    size="small"
                    startIcon={<Warning sx={{ fontSize: 18 }} />}
                    onClick={() => setReportModalOpen(true)}
                    sx={{
                      minHeight: 40,
                      fontSize: "0.8rem",
                    }}
                  >
                    Tuve un problema
                  </Button>
                </>
              )}

              {/* Estado 3: Charter finalizó, cliente debe confirmar */}
              {match.tripId && match.trip?.status === "charter_completed" && (
                <Stack spacing={1}>
                  <Box
                    sx={{
                      bgcolor: "primary.main",
                      borderLeft: "4px solid",
                      borderLeftColor: "primary.dark",
                      borderRadius: 1.5,
                      p: 1.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.85rem", mb: 0.5, color: "white" }}>
                      El Transportista Finalizó el Viaje
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "white", opacity: 0.9 }}>
                      Por favor confirma que has recibido tu carga correctamente.
                    </Typography>
                  </Box>

                  {/* Primary action button - fullwidth */}
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => setConfirmCompletionModalOpen(true)}
                    sx={{
                      minHeight: 48,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    ✅ Confirmar Recepción
                  </Button>

                  {/* Secondary action button - fullwidth */}
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    size="small"
                    startIcon={<Warning sx={{ fontSize: 18 }} />}
                    onClick={() => setReportModalOpen(true)}
                    sx={{
                      minHeight: 40,
                      fontSize: "0.8rem",
                    }}
                  >
                    Reportar Problema
                  </Button>
                </Stack>
              )}

              {/* Estado 4: Viaje completado por AMBOS */}
              {match.tripId && match.trip?.status === "completed" && (
                <>
                  <Alert severity="success" sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      ✅ Viaje Completado
                    </Typography>
                    <Typography variant="caption">
                      Los créditos han sido transferidos exitosamente.
                    </Typography>
                  </Alert>

                  {/* Receipt Download Button - PRIMERO para destacar */}
                  {match.trip && (
                    <ReceiptButton trip={match.trip} type="client" />
                  )}

                  {/* Show rating button ONLY if can give feedback */}
                  {canGiveFeedback ? (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => {
                        console.log("🎯 [FEEDBACK] Button clicked, opening modal");
                        console.log("📊 [FEEDBACK] Before:", { feedbackModalOpen });
                        setFeedbackModalOpen(true);
                        console.log("📊 [FEEDBACK] After setState called");
                      }}
                      size="large"
                      sx={{ minHeight: 48 }}
                    >
                      ⭐ Dar Calificación
                    </Button>
                  ) : (
                    <Alert severity="info" sx={{ mb: 1 }}>
                      <Typography variant="caption">
                        ✅ Gracias por tu calificación.
                      </Typography>
                    </Alert>
                  )}
                </>
              )}
              </Stack>
            </Box>
          </Box>
        </MobileContainer>

        {/* Feedback Modal */}
        {console.log("🎨 [FEEDBACK] Rendering modal with:", {
          open: feedbackModalOpen,
          tripId: match.tripId,
          toUserId: match.charterId,
          recipientName: match.charter?.name,
        })}
        <FeedbackModal
          open={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          tripId={match.tripId || ""}
          toUserId={match.charterId || ""}
          recipientName={match.charter?.name || "Charter"}
        />

        {/* Report Modal */}
        {match.conversation && match.charter?.id && (
          <ReportModal
            open={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            conversationId={match.conversation.id}
            reportedUserId={match.charter.id}
            reportedUserName={match.charter.name || "Chófer"}
          />
        )}

        {/* Confirm Trip Modal */}
        <ConfirmTripModal
          open={confirmTripModalOpen}
          onClose={() => setConfirmTripModalOpen(false)}
          onConfirm={handleConfirmTrip}
          estimatedCredits={match.estimatedCredits || 0}
          userCredits={user?.credits || 0}
          isLoading={createTripMutation.isPending}
        />

        {/* Confirm Completion Modal */}
        <ConfirmCompletionModal
          open={confirmCompletionModalOpen}
          onClose={() => setConfirmCompletionModalOpen(false)}
          onConfirm={handleClientConfirmCompletion}
          charterName={match.charter?.name || "Transportista"}
          estimatedCredits={match.estimatedCredits || 0}
          isLoading={clientConfirmCompletionMutation.isPending}
        />
      </>
    );
  }

  // ============================================
  // CANCELLED STATE: Trip was cancelled
  // ============================================
  if (match.status === TravelMatchStatus.CANCELLED) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Viaje Cancelado
          </Typography>
        </Box>

        {/* Cancelled alert */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            🚫 Viaje Cancelado
          </Typography>
          <Typography variant="body2">
            Este viaje ha sido cancelado. Si tienes preguntas, contacta a
            soporte.
          </Typography>
        </Alert>

        {/* Trip details for reference */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Detalles de la Solicitud Cancelada
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Origen
              </Typography>
              <Typography variant="body2">
                {match.pickupAddress || "No especificado"}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Destino
              </Typography>
              <Typography variant="body2">
                {match.destinationAddress || "No especificado"}
              </Typography>
            </Box>

            {match.charter?.name && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Chófer Asignado
                </Typography>
                <Typography variant="body2">{match.charter.name}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <Stack spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/client/trips/new")}
            fullWidth
          >
            Nueva Búsqueda
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => router.push("/client/dashboard")}
            fullWidth
          >
            Volver al Dashboard
          </Button>
        </Stack>
      </Container>
    );
  }

  // ============================================
  // SEARCHING STATE: Charter selected, waiting for confirmation
  // ============================================
  if (match.status === TravelMatchStatus.SEARCHING) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Procesando Solicitud
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            🔍 Buscando Chóferes Disponibles
          </Typography>
          <Typography variant="body2">
            Estamos procesando tu solicitud y buscando chóferes cercanos. Te
            notificaremos cuando encontremos opciones disponibles.
          </Typography>
        </Alert>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Detalles de tu Solicitud
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Origen
              </Typography>
              <Typography variant="body2">
                {match.pickupAddress || "No especificado"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Destino
              </Typography>
              <Typography variant="body2">
                {match.destinationAddress || "No especificado"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          onClick={() => router.push("/client/dashboard")}
          fullWidth
        >
          Volver al Dashboard
        </Button>
      </Container>
    );
  }

  // ============================================
  // FALLBACK: Unknown status
  // ============================================
  console.error("❌ [MATCH DETAIL] Unknown match status:", {
    matchId: match.id,
    status: match.status,
    statusType: typeof match.status,
    charterId: match.charterId,
    userId: match.userId,
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography>
          Estado desconocido: "{match.status}" (tipo: {typeof match.status})
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          ID del match: {match.id}
        </Typography>
      </Alert>
      <Link href="/client/dashboard">
        <Button variant="contained" color="secondary">
          Volver al Dashboard
        </Button>
      </Link>
    </Container>
  );
}
