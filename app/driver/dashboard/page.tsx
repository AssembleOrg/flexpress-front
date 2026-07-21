"use client";

import {
  Add,
  Assignment,
  Block,
  Chat,
  ChevronRight,
  DirectionsCar,
  Flag,
  History,
  HourglassEmpty,
  LocationOn,
  Person,
  StarRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Fab,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MobileMatchCard } from "@/components/cards/MobileMatchCard";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { MatchExpirationTimer } from "@/components/MatchExpirationTimer";
import { AcceptMatchModal } from "@/components/modals/AcceptMatchModal";
import { ActivationModal } from "@/components/modals/ActivationModal";
import { CreditPackagesShowcase } from "@/components/modals/CreditPackagesShowcase";
import { RespondInquiryModal } from "@/components/modals/RespondInquiryModal";
import { AccountStatusBanner } from "@/components/ui/AccountStatusBanner";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import { WelcomeHeader } from "@/components/ui/WelcomeHeader";
import { authApi } from "@/lib/api/auth";
import {
  useRespondToMatch,
  useToggleAvailability,
} from "@/lib/hooks/mutations/useTravelMatchMutations";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import { useReceivedInquiries } from "@/lib/hooks/queries/useAvailabilityInquiriesQueries";
import {
  useMyDrivers,
  useMyHelpers,
} from "@/lib/hooks/queries/useCharterPersonnelQueries";
import { useUserFeedback } from "@/lib/hooks/queries/useFeedbackQueries";
import { usePublicPricing } from "@/lib/hooks/queries/useSystemConfigQueries";
import {
  useCharterAvailability,
  useCharterMatches,
} from "@/lib/hooks/queries/useTravelMatchQueries";
import { useMyVehicles } from "@/lib/hooks/queries/useVehicleQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCreditPurchaseStore } from "@/lib/stores/creditPurchaseStore";
import type { AvailabilityInquiry } from "@/lib/types/api";
import { type TravelMatch, VerificationStatus } from "@/lib/types/api";
import { isMatchExpired } from "@/lib/utils/matchHelpers";

const MotionCard = motion.create(Card);

export default function DriverDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, gender, returnToOrigin, updateUser } = useAuthStore();
  const { data: availabilityData } = useCharterAvailability();
  const isAvailable = availabilityData?.isAvailable ?? false;
  const toggleMutation = useToggleAvailability();
  const { data: charterMatches = [], isLoading: matchesLoading } =
    useCharterMatches();
  const respondMutation = useRespondToMatch();
  const { data: pricing } = usePublicPricing();
  const { openModal: openCreditModal } = useCreditPurchaseStore();

  // Modal state
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedMatchForAccept, setSelectedMatchForAccept] =
    useState<TravelMatch | null>(null);

  // Availability inquiries
  const { data: receivedInquiries = [] } = useReceivedInquiries();
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] =
    useState<AvailabilityInquiry | null>(null);

  // Auto-abrir modal cuando la notif viene con ?inquiry={id}
  const searchParams = useSearchParams();
  useEffect(() => {
    const inquiryId = searchParams.get("inquiry");
    if (!inquiryId) return;
    const match = receivedInquiries.find((i) => i.id === inquiryId);
    if (!match) return;
    setSelectedInquiry(match);
    setRespondModalOpen(true);
    // Limpiar el query param para que no se reabra al refrescar.
    router.replace("/driver/dashboard");
  }, [searchParams, receivedInquiries, router]);

  // Refrescar el perfil al montar para traer accountStatus fresco (warning/ban)
  // sin WebSocket: reusa el patrón post-login (PATCH /users/:id con body vacío
  // devuelve el perfil completo). Se ejecuta una vez al entrar al dashboard.
  // biome-ignore lint/correctness/useExhaustiveDependencies: solo al montar
  useEffect(() => {
    if (!user?.id) return;
    authApi
      .updateUser(user.id, {})
      .then((fresh) => updateUser(fresh))
      .catch(() => {
        // No crítico: si falla, el dashboard sigue con el user en store.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Activation modal state (elegir conductor + vehículo + ayudantes al activarse)
  const [activationOpen, setActivationOpen] = useState(false);
  const { data: myDrivers = [] } = useMyDrivers();
  const { data: myHelpers = [] } = useMyHelpers();
  const hasExtraDrivers = myDrivers.some(
    (d) => d.verificationStatus === "verified" && d.isEnabled,
  );
  const hasHelpers = myHelpers.some(
    (h) => h.verificationStatus === "verified" && h.isEnabled,
  );

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

  // Filter active conversations (accepted or completed matches still in progress)
  // No exigimos conversationId: un viaje en charter_completed (esperando
  // confirmación del cliente) debe seguir visible y navegable aunque el campo
  // conversationId no haya llegado. El chat se resuelve en la vista de detalle.
  const activeConversations = charterMatches.filter((match) => {
    // Must have valid match ID
    if (!match?.id) return false;

    // Exclude trips that are already completed (should appear in history instead)
    if (match.trip?.status === "completed") return false;

    return match.status === "accepted" || match.status === "completed";
  });

  const { setReturnToOrigin } = useAuthStore();

  const handleAvailabilityChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newStatus = event.target.checked;

    const availabilityKey = queryKeys.charter.availability(user?.id || "");

    if (!newStatus) {
      // Desconectar: optimistic update + revert en error
      queryClient.setQueryData(
        availabilityKey,
        (old: typeof availabilityData) => ({
          ...old,
          isAvailable: false,
          vehicleId: old?.vehicleId ?? null,
        }),
      );
      toggleMutation.mutate(
        { isAvailable: false },
        {
          onSuccess: () => setReturnToOrigin(false),
          onError: () =>
            queryClient.setQueryData(
              availabilityKey,
              (old: typeof availabilityData) => ({
                ...old,
                isAvailable: true,
                vehicleId: old?.vehicleId ?? null,
              }),
            ),
        },
      );
      return;
    }

    // Conectar: necesitamos vehículo verificado
    if (verifiedVehicles.length === 0) {
      toast.error("Necesitás al menos 1 vehículo verificado para activarte.");
      return;
    }

    // Si el charter tiene conductores extra o más de un vehículo, abrimos el
    // modal de activación para que elija la config (conductor + vehículo +
    // ayudantes). Caso simple (titular, 1 vehículo, sin extras): activar directo.
    const hasExtras =
      hasExtraDrivers || hasHelpers || verifiedVehicles.length > 1;
    if (hasExtras) {
      setActivationOpen(true);
      return;
    }

    // Caso simple: titular con un único vehículo verificado.
    queryClient.setQueryData(availabilityKey, {
      isAvailable: true,
      vehicleId: verifiedVehicles[0].id,
      activeDriverId: null,
      activeHelperIds: [],
    });
    toggleMutation.mutate(
      {
        isAvailable: true,
        vehicleId: verifiedVehicles[0].id,
        activeDriverId: null,
        activeHelperIds: [],
      },
      {
        onSuccess: () => toast.success("Estás en línea"),
        onError: () =>
          queryClient.setQueryData(
            availabilityKey,
            (old: typeof availabilityData) => ({
              ...old,
              isAvailable: false,
              vehicleId: old?.vehicleId ?? null,
            }),
          ),
      },
    );
  };

  const handleActivationConfirm = (selection: {
    vehicleId: string;
    activeDriverId: string | null;
    activeHelperIds: string[];
  }) => {
    const availabilityKey = queryKeys.charter.availability(user?.id || "");
    queryClient.setQueryData(availabilityKey, {
      isAvailable: true,
      ...selection,
    });
    toggleMutation.mutate(
      { isAvailable: true, ...selection },
      {
        onSuccess: () => {
          setActivationOpen(false);
          toast.success("Estás en línea");
        },
        onError: () => {
          queryClient.setQueryData(
            availabilityKey,
            (old: typeof availabilityData) => ({
              ...old,
              isAvailable: false,
              vehicleId: old?.vehicleId ?? null,
            }),
          );
        },
      },
    );
  };

  const handleActivationCancel = () => {
    setActivationOpen(false);
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
      <MobileContainer withBottomNav>
        <WelcomeHeader
          userName={user?.name}
          userRole="charter"
          greeting={greeting}
          avatarUrl={user?.avatar ?? undefined}
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
    );
  }

  return (
    <MobileContainer withBottomNav>
      {/* Welcome Header */}
      <WelcomeHeader
        userName={user?.name}
        userRole="charter"
        greeting={greeting}
        avatarUrl={user?.avatar ?? undefined}
      />

      {/* Aviso de estado de cuenta (advertencia / bloqueo) */}
      {(user?.accountStatus === "warned" ||
        user?.accountStatus === "banned") && (
        <AccountStatusBanner
          status={user.accountStatus}
          note={user.accountStatusNote}
          contactEmail={pricing?.contactEmail}
        />
      )}

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
            {/* Derecha: botón recargar + Switch */}
            <Stack direction="row" alignItems="center" gap={1}>
              <Fab
                color="secondary"
                size="small"
                onClick={openCreditModal}
                aria-label="Recargar créditos"
                sx={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  flexShrink: 0,
                }}
              >
                <Add />
              </Fab>
              <Switch
                checked={isAvailable}
                onChange={handleAvailabilityChange}
                color="secondary"
                disabled={
                  !isAvailable &&
                  ((user?.credits ?? 0) < 2 || hasNoVerifiedVehicles)
                }
              />
            </Stack>
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
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={0.75}
                  flex={1}
                  minWidth={0}
                >
                  <DirectionsCar
                    sx={{
                      fontSize: 18,
                      color: "text.secondary",
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {[activeVehicle.brand, activeVehicle.model]
                      .filter(Boolean)
                      .join(" ") || "Vehículo"}
                  </Typography>
                  <Chip
                    label={activeVehicle.plate}
                    size="small"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      height: 20,
                      flexShrink: 0,
                    }}
                  />
                </Stack>
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  endIcon={<ChevronRight sx={{ fontSize: 16 }} />}
                  onClick={() => router.push("/driver/vehicles")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    p: 0,
                    minWidth: 0,
                    flexShrink: 0,
                  }}
                >
                  Gestionar
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </MotionCard>

      {/* Activation Modal: elegir conductor + vehículo + ayudantes */}
      <ActivationModal
        open={activationOpen}
        onClose={handleActivationCancel}
        onConfirm={handleActivationConfirm}
        isLoading={toggleMutation.isPending}
        initial={
          availabilityData
            ? {
                vehicleId: availabilityData.vehicleId ?? undefined,
                activeDriverId: availabilityData.activeDriverId ?? null,
                activeHelperIds: availabilityData.activeHelperIds ?? [],
              }
            : null
        }
      />

      {/* Stats row: Tarifa + Reputación + Créditos */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        sx={{ mb: 3 }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr auto 1fr",
            alignItems: "stretch",
          }}
        >
          {/* Columna: Tarifa */}
          <ButtonBase
            onClick={() => router.push("/driver/settings")}
            sx={{
              flexDirection: "column",
              alignItems: "flex-start",
              p: 2,
              borderRadius: "inherit",
              gap: 0.25,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Stack direction="row" alignItems="center" gap={0.25} width="100%">
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Tarifa
              </Typography>
              <ChevronRight
                sx={{ fontSize: 13, color: "text.disabled", ml: "auto" }}
              />
            </Stack>
            {user?.pricePerKm != null ? (
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                ${user.pricePerKm}
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 0.4 }}
                >
                  /km
                </Typography>
              </Typography>
            ) : (
              <Typography
                variant="caption"
                color="warning.main"
                fontWeight={600}
              >
                Sin configurar
              </Typography>
            )}
            {/* Placeholder: reserva la 3ª línea para alinear la altura con
                  las columnas Reputación y Créditos (que tienen subtítulo). */}
            <Typography
              variant="caption"
              sx={{ fontSize: "0.6rem", visibility: "hidden" }}
            >
              &nbsp;
            </Typography>
          </ButtonBase>

          <Divider orientation="vertical" flexItem sx={{ my: 1.5 }} />

          {/* Columna: Reputación */}
          <ButtonBase
            onClick={() => router.push("/driver/trips/history")}
            sx={{
              flexDirection: "column",
              alignItems: "flex-start",
              p: 2,
              gap: 0.25,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Stack direction="row" alignItems="center" gap={0.25} width="100%">
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Reputación
              </Typography>
              <ChevronRight
                sx={{ fontSize: 13, color: "text.disabled", ml: "auto" }}
              />
            </Stack>
            <Stack direction="row" alignItems="center" gap={0.4}>
              <StarRounded sx={{ fontSize: 18, color: "warning.main" }} />
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                {(myFeedback?.averageRating ?? 0).toFixed(1)}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ fontSize: "0.6rem" }}
            >
              {myFeedback?.totalCount ?? 0} reseñas
            </Typography>
          </ButtonBase>

          <Divider orientation="vertical" flexItem sx={{ my: 1.5 }} />

          {/* Columna: Créditos */}
          <ButtonBase
            onClick={openCreditModal}
            sx={{
              flexDirection: "column",
              alignItems: "flex-start",
              p: 2,
              gap: 0.25,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Stack direction="row" alignItems="center" gap={0.25} width="100%">
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Créditos
              </Typography>
              <Box
                component="span"
                role="button"
                aria-label="Ver mis pagos"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/driver/payments");
                }}
                sx={{
                  ml: "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 0.25,
                  borderRadius: 1,
                  cursor: "pointer",
                  color: "text.disabled",
                  "&:hover": {
                    color: "secondary.main",
                    bgcolor: "action.hover",
                  },
                }}
              >
                <History sx={{ fontSize: 16 }} />
              </Box>
            </Stack>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              lineHeight={1.2}
              color={(user?.credits ?? 0) >= 2 ? "success.main" : "error.main"}
            >
              {user?.credits ?? 0}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ fontSize: "0.6rem" }}
            >
              Recargar
            </Typography>
          </ButtonBase>
        </Box>
      </MotionCard>

      {/* Aviso: configurar tarifa para aparecer con precio estimado.
            Branding: oro sobre pergamino, sin icono (no es un Alert). */}
      {user?.pricePerKm == null && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "secondary.light",
            borderLeft: "4px solid",
            borderLeftColor: "secondary.main",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 1.5,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="primary.main"
            >
              Configurá tu tarifa
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Definí tu precio por km para que los clientes vean cuánto les
              saldría el viaje y te elijan.
            </Typography>
          </Box>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => router.push("/driver/settings")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Configurar
          </Button>
        </Box>
      )}

      {/* Aviso de costo por aceptar solicitud */}
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

      {/* Consultas de disponibilidad */}
      {receivedInquiries.length > 0 && (
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
              }}
            >
              Consultas de disponibilidad
            </Typography>
            <Chip
              label={receivedInquiries.length}
              size="small"
              color="warning"
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Stack spacing={1.5}>
            {receivedInquiries.map((inquiry) => (
              <Card key={inquiry.id}>
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Person fontSize="small" sx={{ color: "primary.main" }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700 }}
                        noWrap
                      >
                        {inquiry.fromUser?.name ?? "Cliente"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        hace{" "}
                        {formatDistanceToNow(new Date(inquiry.createdAt), {
                          locale: es,
                        })}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => {
                      setSelectedInquiry(inquiry);
                      setRespondModalOpen(true);
                    }}
                  >
                    Responder
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
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
                          gap: 0.75,
                        }}
                      >
                        <SignedAvatar
                          value={match.user?.avatar}
                          alt={match.user?.name}
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: "0.8rem",
                            bgcolor: "secondary.main",
                            color: "primary.main",
                            fontWeight: 700,
                          }}
                        >
                          {match.user?.name?.[0] ?? "U"}
                        </SignedAvatar>
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
              // El personal ya fue elegido al ponerse disponible; aceptar solo confirma.
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
        availability={availabilityData}
        isLoading={respondMutation.isPending}
      />

      {/* Respond Inquiry Modal */}
      <RespondInquiryModal
        open={respondModalOpen}
        onClose={() => {
          setRespondModalOpen(false);
          setSelectedInquiry(null);
        }}
        inquiry={selectedInquiry}
      />

      {/* Modal de recarga de créditos (premium, reutilizado del flujo del cliente) */}
      <CreditPackagesShowcase />
    </MobileContainer>
  );
}
