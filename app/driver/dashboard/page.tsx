"use client";

import {
  Assignment,
  Block,
  Chat,
  DirectionsCar,
  EditOutlined,
  Flag,
  HourglassEmpty,
  LocationOn,
  Person,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormControlLabel as FormControlLabelRadio,
  IconButton,
  Radio,
  RadioGroup,
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
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { MatchExpirationTimer } from "@/components/MatchExpirationTimer";
import { AcceptMatchModal } from "@/components/modals/AcceptMatchModal";
import { WelcomeHeader } from "@/components/ui/WelcomeHeader";
import {
  useRespondToMatch,
  useToggleAvailability,
} from "@/lib/hooks/mutations/useTravelMatchMutations";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import { usePublicPricing } from "@/lib/hooks/queries/useSystemConfigQueries";
import {
  useCharterAvailability,
  useCharterMatches,
} from "@/lib/hooks/queries/useTravelMatchQueries";
import { useMyVehicles } from "@/lib/hooks/queries/useVehicleQueries";
import { useUserFeedback } from "@/lib/hooks/queries/useFeedbackQueries";
import { RatingDisplay } from "@/components/ui/RatingDisplay";
import { useAuthStore } from "@/lib/stores/authStore";
import { type TravelMatch, VerificationStatus } from "@/lib/types/api";
import { isMatchExpired } from "@/lib/utils/matchHelpers";

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

export default function DriverDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, gender, returnToOrigin } = useAuthStore();
  const { data: availabilityData } = useCharterAvailability();
  const isAvailable = availabilityData?.isAvailable ?? false;
  const toggleMutation = useToggleAvailability();
  const { data: charterMatches = [], isLoading: matchesLoading } =
    useCharterMatches();
  const respondMutation = useRespondToMatch();
  const { data: pricing } = usePublicPricing();

  // Modal state
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedMatchForAccept, setSelectedMatchForAccept] =
    useState<TravelMatch | null>(null);

  // Vehicle selection modal state (UI only — temporary while modal is open)
  const [vehicleSelectOpen, setVehicleSelectOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [pendingAvailabilityToggle, setPendingAvailabilityToggle] =
    useState(false);

  // Active vehicle ID comes from server state (availability query)
  const activeVehicleId = availabilityData?.vehicleId ?? null;

  // Approx distance for sorting (no haversine, just coordinate diff)
  const getApproxDistance = (
    lat1: string | number,
    lon1: string | number,
    lat2: string | number,
    lon2: string | number,
  ) => {
    return (
      Math.abs(Number(lat1) - Number(lat2)) +
      Math.abs(Number(lon1) - Number(lon2))
    );
  };

  const RETURN_TO_ORIGIN_THRESHOLD = 0.5; // ~50km in degree units

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

  // Sort pending matches by proximity to driver's origin if returnToOrigin is active
  const sortedPendingMatches =
    returnToOrigin && user?.originLatitude
      ? [...pendingMatches].sort((a, b) => {
          const originLat = user.originLatitude!;
          const originLon = user.originLongitude!;
          const distA = getApproxDistance(
            a.destinationLatitude,
            a.destinationLongitude,
            originLat,
            originLon,
          );
          const distB = getApproxDistance(
            b.destinationLatitude,
            b.destinationLongitude,
            originLat,
            originLon,
          );
          return distA - distB;
        })
      : pendingMatches;

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

  const { setReturnToOrigin } = useAuthStore();

  const handleAvailabilityChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newStatus = event.target.checked;

    const availabilityKey = queryKeys.charter.availability(user?.id || '');

    if (!newStatus) {
      // Desconectar: optimistic update + revert en error
      queryClient.setQueryData(availabilityKey, (old: typeof availabilityData) => ({
        ...old,
        isAvailable: false,
        vehicleId: old?.vehicleId ?? null,
      }));
      toggleMutation.mutate(
        { isAvailable: false },
        {
          onSuccess: () => setReturnToOrigin(false),
          onError: () =>
            queryClient.setQueryData(availabilityKey, (old: typeof availabilityData) => ({
              ...old,
              isAvailable: true,
              vehicleId: old?.vehicleId ?? null,
            })),
        },
      );
      return;
    }

    // Conectar: necesitamos vehículo verificado
    if (verifiedVehicles.length === 0) {
      toast.error("Necesitás al menos 1 vehículo verificado para activarte.");
      return;
    } else if (verifiedVehicles.length === 1) {
      // Un vehículo: asignar automáticamente sin modal
      queryClient.setQueryData(availabilityKey, {
        isAvailable: true,
        vehicleId: verifiedVehicles[0].id,
      });
      toggleMutation.mutate(
        { isAvailable: true, vehicleId: verifiedVehicles[0].id },
        {
          onSuccess: () => toast.success("Estás en línea"),
          onError: () =>
            queryClient.setQueryData(availabilityKey, (old: typeof availabilityData) => ({
              ...old,
              isAvailable: false,
              vehicleId: old?.vehicleId ?? null,
            })),
        },
      );
    } else {
      // Múltiples vehículos: abrir modal de selección
      setSelectedVehicleId("");
      setVehicleSelectOpen(true);
      setPendingAvailabilityToggle(true);
    }
  };

  const handleVehicleSelectConfirm = () => {
    if (!selectedVehicleId) {
      toast.error("Selecciona un vehículo");
      return;
    }
    const availabilityKey = queryKeys.charter.availability(user?.id || '');
    setVehicleSelectOpen(false);
    queryClient.setQueryData(availabilityKey, {
      isAvailable: true,
      vehicleId: selectedVehicleId,
    });
    toggleMutation.mutate(
      { isAvailable: true, vehicleId: selectedVehicleId },
      {
        onSuccess: () => toast.success("Estás en línea"),
        onError: () => {
          queryClient.setQueryData(availabilityKey, (old: typeof availabilityData) => ({
            ...old,
            isAvailable: false,
            vehicleId: old?.vehicleId ?? null,
          }));
          setSelectedVehicleId("");
          setVehicleSelectOpen(false);
        },
      },
    );
    setPendingAvailabilityToggle(false);
  };

  const handleVehicleSelectCancel = () => {
    setVehicleSelectOpen(false);
    setSelectedVehicleId("");
    setPendingAvailabilityToggle(false);
  };

  const handleRejectMatch = (matchId: string) => {
    respondMutation.mutate({
      matchId,
      accept: false,
    });
  };

  const { data: myVehicles = [] } = useMyVehicles();
  const { data: myFeedback } = useUserFeedback(user?.id || "");

  // Derive active vehicle from server availability state
  const activeVehicle = myVehicles.find((v) => v.id === activeVehicleId);
  const verifiedVehicles = myVehicles.filter(
    (v) => v.verificationStatus === VerificationStatus.VERIFIED,
  );
  const hasNoVerifiedVehicles = verifiedVehicles.length === 0;

  // Check verification status
  const isPending = user?.verificationStatus === VerificationStatus.PENDING;
  const isRejected = user?.verificationStatus === VerificationStatus.REJECTED;
  const isNotVerified = isPending || isRejected;

  // Generar saludo personalizado según género
  const greeting =
    gender === "male"
      ? `¡Bienvenido, ${user?.name?.split(" ")[0]}!`
      : gender === "female"
        ? `¡Bienvenida, ${user?.name?.split(" ")[0]}!`
        : `¡Hola, ${user?.name?.split(" ")[0]}!`;

  // If charter is not verified, show blocking screen
  if (isNotVerified) {
    return (
      <>
        <AuthNavbar />
        <MobileContainer withBottomNav>
          <WelcomeHeader
            userName={user?.name}
            userRole="charter"
            greeting={greeting}
          />

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              mt: 4,
              textAlign: "center",
              p: 4,
              borderTop: "4px solid",
              borderTopColor: isPending ? "warning.main" : "error.main",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: isPending ? "warning.light" : "error.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              {isPending ? (
                <HourglassEmpty sx={{ fontSize: 40, color: "warning.dark" }} />
              ) : (
                <Block sx={{ fontSize: 40, color: "error.dark" }} />
              )}
            </Box>

            <Typography variant="h5" fontWeight={700} mb={2}>
              {isPending ? "Cuenta en Verificación" : "Cuenta Rechazada"}
            </Typography>

            {isPending ? (
              <>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  Tu cuenta está siendo revisada por nuestro equipo de
                  administración.
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Este proceso puede tomar hasta <strong>48 horas</strong>. Te
                  notificaremos por correo electrónico cuando tu cuenta sea
                  aprobada.
                </Typography>
                <Chip
                  icon={<HourglassEmpty />}
                  label="Pendiente de Aprobación"
                  color="warning"
                  sx={{ fontWeight: 600 }}
                />
              </>
            ) : (
              <>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  Lo sentimos, tu solicitud de registro como conductor ha sido
                  rechazada.
                </Typography>
                {user?.rejectionReason && (
                  <Box
                    sx={{
                      bgcolor: "error.light",
                      p: 2,
                      borderRadius: 2,
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="error.dark"
                      mb={1}
                    >
                      Motivo del rechazo:
                    </Typography>
                    <Typography variant="body2" color="error.dark">
                      {user.rejectionReason}
                    </Typography>
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary">
                  Si crees que esto es un error, por favor contacta a soporte.
                </Typography>
              </>
            )}
          </MotionCard>

          {/* Estado de vehículos */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <DirectionsCar fontSize="small" color="action" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Tus vehículos
                </Typography>
              </Stack>

              {myVehicles.length === 0 ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    No has registrado ningún vehículo todavía.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => router.push("/driver/onboarding/vehicle")}
                  >
                    Agregar vehículo
                  </Button>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {myVehicles.map((vehicle) => (
                    <Box key={vehicle.id}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={0.5}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {vehicle.plate}
                          {vehicle.alias ? ` — ${vehicle.alias}` : ""}
                        </Typography>
                        <Chip
                          label={
                            vehicle.verificationStatus ===
                            VerificationStatus.VERIFIED
                              ? "Aprobado"
                              : vehicle.verificationStatus ===
                                  VerificationStatus.REJECTED
                                ? "Rechazado"
                                : "En revisión"
                          }
                          color={
                            vehicle.verificationStatus ===
                            VerificationStatus.VERIFIED
                              ? "success"
                              : vehicle.verificationStatus ===
                                  VerificationStatus.REJECTED
                                ? "error"
                                : "warning"
                          }
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>
                      {vehicle.verificationStatus ===
                        VerificationStatus.REJECTED &&
                        vehicle.rejectionReason && (
                          <Box
                            sx={{
                              bgcolor: "error.light",
                              p: 1.5,
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              color="error.dark"
                              display="block"
                            >
                              Motivo del rechazo:
                            </Typography>
                            <Typography variant="caption" color="error.dark">
                              {vehicle.rejectionReason}
                            </Typography>
                          </Box>
                        )}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </MobileContainer>
      </>
    );
  }

  return (
    <>
      <AuthNavbar />
      <MobileContainer withBottomNav>
        {/* Welcome Header */}
        <WelcomeHeader
          userName={user?.name}
          userRole="charter"
          greeting={greeting}
        />

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
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              {/* Izquierda: estado + descripción */}
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: isAvailable ? "success.main" : "grey.400",
                      animation: isAvailable ? "pulse 2s infinite" : "none",
                    }}
                  />
                  <Typography variant="subtitle1" fontWeight={700}>
                    {isAvailable ? "En línea" : "Desconectado"}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {isAvailable
                    ? "Recibiendo solicitudes"
                    : hasNoVerifiedVehicles
                      ? "Necesitás un vehículo verificado para activarte"
                      : (user?.credits ?? 0) < 2
                        ? "Necesitás 2 créditos para activarte"
                        : "Actívate para mostrarte disponible"}
                </Typography>
              </Stack>
              {/* Derecha: Switch — deshabilitado si no hay créditos suficientes */}
              <Switch
                checked={isAvailable}
                onChange={handleAvailabilityChange}
                color="secondary"
                disabled={!isAvailable && ((user?.credits ?? 0) < 2 || hasNoVerifiedVehicles)}
              />
            </Stack>

            {isAvailable && activeVehicle && (
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                >
                  <Stack direction="row" alignItems="center" gap={0.75} flex={1} minWidth={0}>
                    <DirectionsCar sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {[activeVehicle.brand, activeVehicle.model].filter(Boolean).join(" ") || "Vehículo"}
                    </Typography>
                    <Chip
                      label={activeVehicle.plate}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: "monospace", fontSize: "0.65rem", height: 18, flexShrink: 0 }}
                    />
                  </Stack>
                  <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{ cursor: "pointer", flexShrink: 0, textDecoration: "underline" }}
                    onClick={() => router.push("/driver/vehicles")}
                  >
                    Gestionar →
                  </Typography>
                </Stack>
                {user?.pricePerKm != null && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={0.5}
                  >
                    💰 {user.pricePerKm} cr/km
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </MotionCard>

        {/* Vehicle Selection Dialog */}
        <Dialog
          open={vehicleSelectOpen}
          onClose={handleVehicleSelectCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Selecciona tu vehículo</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <RadioGroup
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                {myVehicles
                  .filter(
                    (v) => v.verificationStatus === VerificationStatus.VERIFIED,
                  )
                  .map((vehicle) => (
                    <FormControlLabelRadio
                      key={vehicle.id}
                      value={vehicle.id}
                      control={<Radio />}
                      label={`${vehicle.brand || "Sin marca"} ${vehicle.model || ""} (${vehicle.plate})`}
                    />
                  ))}
              </RadioGroup>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleVehicleSelectCancel}>Cancelar</Button>
            <Button
              onClick={handleVehicleSelectConfirm}
              variant="contained"
              disabled={!selectedVehicleId || toggleMutation.isPending}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tarifa del charter */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          sx={{ mb: 3 }}
        >
          <CardContent sx={{ p: 2.5 }}>
            {/* Header row */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Tu tarifa
              </Typography>
              <IconButton
                size="small"
                onClick={() => router.push("/driver/settings")}
                sx={{ color: "text.secondary" }}
                aria-label="Editar tarifa"
              >
                <EditOutlined fontSize="small" />
              </IconButton>
            </Stack>
            {user?.pricePerKm != null ? (
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  Tu precio: <strong>{user.pricePerKm} cr/km</strong>
                </Typography>
                {pricing?.creditsPerKm && (
                  <Typography variant="caption" color="text.secondary">
                    Tarifa base del sistema: {pricing.creditsPerKm} cr/km
                  </Typography>
                )}
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Aún no configuraste tu precio por km.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => router.push("/driver/settings")}
                >
                  Configurar precio
                </Button>
              </Stack>
            )}
          </CardContent>
        </MotionCard>

        {/* Reputación */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.175 }}
          sx={{ mb: 3 }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                  Tu reputación
                </Typography>
                <RatingDisplay
                  averageRating={myFeedback?.averageRating ?? 0}
                  totalReviews={myFeedback?.totalCount ?? 0}
                  size="medium"
                />
              </Box>
              <Button
                size="small"
                variant="text"
                onClick={() => router.push("/driver/trips/history")}
                sx={{ color: "text.secondary", fontSize: "0.75rem", textTransform: "none" }}
              >
                Ver historial →
              </Button>
            </Stack>
          </CardContent>
        </MotionCard>

        {/* Credits Summary — siempre visible */}
        <MotionBox
          display="flex"
          gap={2}
          mb={2}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
        >
          <Card sx={{ flex: 1, p: 2, textAlign: "center" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: (user?.credits ?? 0) >= 2 ? "success.main" : "error.main" }}
            >
              {user?.credits || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Créditos Disponibles
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

        {/* Aviso de costo por aceptar solicitud */}
        {(user?.credits ?? 0) < 2 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Necesitás al menos 2 créditos para activarte y aceptar solicitudes.
            Cada solicitud aceptada tiene un costo de 2 créditos.
          </Alert>
        )}
        {(user?.credits ?? 0) >= 2 && !isAvailable && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Aceptar una solicitud tiene un costo de 2 créditos.
          </Alert>
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

            {!matchesLoading && sortedPendingMatches.length > 0 && (
              <Stack spacing={2}>
                {sortedPendingMatches.map((match) => {
                  if (!match?.id) {
                    console.warn("⚠️ Match inválido:", match);
                    return null;
                  }
                  const isNearOrigin =
                    returnToOrigin &&
                    user?.originLatitude &&
                    getApproxDistance(
                      match.destinationLatitude,
                      match.destinationLongitude,
                      user.originLatitude,
                      user.originLongitude!,
                    ) < RETURN_TO_ORIGIN_THRESHOLD;

                  return (
                    <Box key={match.id} sx={{ position: "relative" }}>
                      {isNearOrigin && (
                        <Chip
                          label="Vuelve a tu zona"
                          size="small"
                          color="success"
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            fontWeight: 700,
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                      <MobileMatchCard
                        matchId={match.id}
                        user={{
                          name: match.user?.name || "Usuario",
                          avatar: match.user?.avatar ?? undefined,
                        }}
                        origin={match.pickupAddress || "No especificado"}
                        destination={
                          match.destinationAddress || "No especificado"
                        }
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
                    </Box>
                  );
                })}
              </Stack>
            )}

            {!matchesLoading && sortedPendingMatches.length === 0 && (
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
    </>
  );
}
