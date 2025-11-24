"use client";

import {
  AccountBalanceWallet,
  Add,
  Email,
  Flag,
  LocalShipping,
  LocationOn,
  Phone,
} from "@mui/icons-material";
import {
  Avatar,
  Badge,
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
  Fab,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { WelcomeHeader } from "@/components/ui/WelcomeHeader";
import { useUserMatches } from "@/lib/hooks/queries/useTravelMatchQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import { isActiveTrip } from "@/lib/utils/matchHelpers";

const MotionCard = motion.create(Card);
const MotionButton = motion.create(Button);

export default function ClientDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: myMatches = [], isLoading } = useUserMatches();
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);

  // Find the ONE active trip (only one trip at a time allowed)
  const activeTrip = myMatches.find(isActiveTrip);

  const handleRequestFreight = () => {
    // Prevent creating new trip if one is already active
    if (activeTrip) {
      alert(
        "Ya tienes un viaje activo. Completa o cancela antes de solicitar otro.",
      );
      return;
    }
    router.push("/client/trips/new");
  };

  const handleViewMatch = (matchId: string) => {
    router.push(`/client/trips/matching/${matchId}`);
  };

  const getStatusLabel = (status: string, match?: typeof activeTrip) => {
    // Show status based on match state
    if (status === "pending") {
      return { label: "Pendiente de Respuesta", color: "warning" as const };
    }

    if (status === "accepted" || status === "completed") {
      // Distinguish between: chatting vs confirmed vs completed
      if (!match?.tripId) {
        return { label: "En Conversación", color: "primary" as const };
      }

      // Check trip status for more granular state
      if (match?.trip?.status === "completed") {
        return { label: "Completado", color: "success" as const };
      }

      if (match?.trip?.status === "charter_completed") {
        return {
          label: "Esperando tu Confirmación",
          color: "warning" as const,
        };
      }

      if (match?.trip?.status === "pending") {
        return { label: "En Progreso", color: "primary" as const };
      }

      return { label: "Confirmado", color: "success" as const };
    }

    return { label: status, color: "default" as const };
  };

  const getStatusColor = (status: string, match?: typeof activeTrip) => {
    const statusData = getStatusLabel(status, match);
    const colorMap = {
      warning: "warning.main",
      primary: "primary.main",
      info: "primary.main",
      success: "success.main",
      default: "grey.400",
    };
    return colorMap[statusData.color] || "grey.400";
  };

  return (
    <MobileContainer withBottomNav>
      {/* Welcome Header */}
      <WelcomeHeader userName={user?.name} userRole="client" />

      {/* Credits Card */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        sx={{
          mb: 3,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <motion.div
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                type: "spring",
                stiffness: 150,
              }}
            >
              <AccountBalanceWallet sx={{ fontSize: 40, opacity: 0.9 }} />
            </motion.div>
            <Box>
              <Typography
                variant="caption"
                sx={{ opacity: 0.9, display: "block", mb: 0.5 }}
              >
                Créditos Disponibles
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "inherit" }}
              >
                {user?.credits || 0}
              </Typography>
            </Box>
          </Box>
          <Fab
            color="secondary"
            size="medium"
            onClick={() => setRechargeModalOpen(true)}
            sx={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Add />
          </Fab>
        </CardContent>
      </MotionCard>

      {/* CTA Principal */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
          {/* Indicador de conductores disponibles con animación */}
          <Badge
            badgeContent="●"
            color="success"
            sx={{
              mb: 2,
              "& .MuiBadge-badge": {
                animation: "pulse 2s infinite",
              },
            }}
          >
            <Typography
              variant="caption"
              color="success.main"
              sx={{ fontWeight: 600, pr: 2 }}
            >
              Conductores disponibles ahora
            </Typography>
          </Badge>

          {/* Ícono de camión con animación sutil */}
          <Box
            sx={{
              animation: activeTrip ? "none" : "pulse 3s infinite",
            }}
          >
            <LocalShipping
              sx={{
                fontSize: { xs: 50, md: 40 },
                color: "primary.main",
                mb: 2,
              }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "1.15rem", md: "1.25rem" },
            }}
          >
            ¿Necesitás transportar algo?
          </Typography>

          <MotionButton
            variant="contained"
            color="secondary"
            size="large"
            fullWidth
            startIcon={<Add />}
            onClick={handleRequestFreight}
            disabled={!!activeTrip}
            whileHover={
              !activeTrip
                ? {
                    scale: 1.02,
                    boxShadow: "0 8px 24px rgba(220, 166, 33, 0.3)",
                  }
                : {}
            }
            whileTap={!activeTrip ? { scale: 0.98 } : {}}
            sx={{
              py: { xs: 2, md: 1.5 },
              fontSize: { xs: "1.1rem", md: "1rem" },
              fontWeight: 700,
              borderRadius: 3,
              minHeight: { xs: 56, md: 48 },
            }}
          >
            Solicitar Flete
          </MotionButton>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}
          >
            Conductores disponibles en tu zona
          </Typography>
        </CardContent>
      </MotionCard>

      {/* Active Trip - Single Trip Only */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: "1.1rem", md: "1.25rem" },
          }}
        >
          Tu Viaje Activo
        </Typography>

        {isLoading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress />
          </Box>
        ) : !activeTrip ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <LocalShipping sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                No tienes viajes activos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cuando solicites un flete aparecerá aquí
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            sx={{
              borderLeft: "4px solid",
              borderLeftColor: getStatusColor(activeTrip.status, activeTrip),
              transition: "all 0.2s ease-in-out",
            }}
          >
            <CardContent sx={{ p: 1.5 }}>
              {/* Header: Title + Status */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={1.5}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                >
                  Solicitud de Flete
                </Typography>
                <Chip
                  label={getStatusLabel(activeTrip.status, activeTrip).label}
                  color={getStatusLabel(activeTrip.status, activeTrip).color}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22 }}
                />
              </Box>

              {/* Route Info with Icons */}
              <Box mb={1.5}>
                {/* Origin */}
                <Box
                  display="flex"
                  alignItems="flex-start"
                  gap={0.75}
                  mb={0.75}
                >
                  <LocationOn
                    sx={{
                      fontSize: 18,
                      color: "primary.main",
                      mt: 0.1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontSize="0.85rem"
                    lineHeight={1.4}
                  >
                    {activeTrip.pickupAddress || "Origen"}
                  </Typography>
                </Box>

                {/* Destination */}
                <Box display="flex" alignItems="flex-start" gap={0.75}>
                  <Flag
                    sx={{
                      fontSize: 18,
                      color: "secondary.main",
                      mt: 0.1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontSize="0.85rem"
                    fontWeight={600}
                    lineHeight={1.4}
                  >
                    {activeTrip.destinationAddress || "Destino"}
                  </Typography>
                </Box>
              </Box>

              {/* Show charter info if accepted */}
              {activeTrip.status === "accepted" && activeTrip.charter && (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={2}
                  p={1.5}
                  sx={{
                    bgcolor: "background.default",
                    borderRadius: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "secondary.main",
                      color: "primary.main",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                    }}
                  >
                    {activeTrip.charter?.name?.[0] ?? "?"}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Chófer
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {activeTrip.charter?.name ?? "Sin asignar"}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Action Button */}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handleViewMatch(activeTrip.id)}
                sx={{
                  minHeight: 44,
                  fontWeight: 700,
                }}
              >
                {activeTrip.conversationId ? "Volver al Chat" : "Ver Detalles"}
              </Button>
            </CardContent>
          </MotionCard>
        )}
      </motion.div>

      {/* Recharge Credits Modal */}
      <Dialog
        open={rechargeModalOpen}
        onClose={() => setRechargeModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalanceWallet color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Recargar Créditos
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Para recargar créditos, por favor contacta al administrador:
          </Typography>
          <Card sx={{ bgcolor: "background.default", p: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Email fontSize="small" />
              Email: admin@flexpress.com
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Phone fontSize="small" />
              Teléfono: +54 11 1234-5678
            </Typography>
          </Card>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}
          >
            El administrador procesará tu solicitud y acreditará los créditos a
            tu cuenta.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRechargeModalOpen(false)}
            variant="contained"
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </MobileContainer>
  );
}
