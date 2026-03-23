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
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
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
import LeafletMap, {
  type LeafletMapHandle,
  type MapMarker,
} from "@/components/ui/LeafletMap";
import { MOBILE_BOTTOM_NAV_HEIGHT } from "@/lib/constants/mobileDesign";
import { useToggleAvailability } from "@/lib/hooks/mutations/useTravelMatchMutations";
import { useCharterCompleteTrip } from "@/lib/hooks/mutations/useTripMutations";
import { useMatch } from "@/lib/hooks/queries/useTravelMatchQueries";
import { useTrip } from "@/lib/hooks/queries/useTripQueries";
import { useMyVehicles } from "@/lib/hooks/queries/useVehicleQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import type { User, UserRole } from "@/lib/types/api";
import {
  generateCharterReceipt,
  downloadPDF,
} from "@/lib/utils/pdfGenerator";

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
  const activeVehicle = myVehicles.find((v) => v.isEnabled) ?? myVehicles[0];
  const [finalizeTripModalOpen, setFinalizeTripModalOpen] = useState(false);
  const [availabilityConfirmed, setAvailabilityConfirmed] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
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

  const isCompletingTrip = charterCompleteTripMutation.isPending;
  const tripCompleted = trip?.status === "completed";

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
            {!match.conversationId ? (
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
                  conversationId={match.conversationId}
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
                    fullWidth
                    onClick={() => setFinalizeTripModalOpen(true)}
                    sx={{
                      gridColumn: { xs: "1 / -1", md: "2 / 3" },
                      minHeight: { xs: 44, md: "100%" },
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      bgcolor: "success.main",
                      "&:hover": { bgcolor: "success.dark" },
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
                  const vehicleId = myVehicles[0]?.id;

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
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
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
              otherUser={{
                name: match.user?.name || "Cliente",
                avatar: match.user?.avatar ?? undefined,
                role: "Cliente",
              }}
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
                <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
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
              </CardContent>
            </Card>

            {/* Trip Metrics Card */}
            <TripMetricsCard
              distance={match.distanceKm ?? undefined}
            />
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
      {match.conversationId && (
        <ReportModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          conversationId={match.conversationId}
          reportedUserId={match.userId}
          reportedUserName={match.user?.name || "Cliente"}
        />
      )}
    </>
  );
}
