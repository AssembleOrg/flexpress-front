"use client";

import {
  Add,
  LocalShipping,
  LocationOn,
  Flag,
  Person,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
  Avatar,
  Badge,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useUserMatches } from "@/lib/hooks/queries/useTravelMatchQueries";
import { isMatchExpired } from "@/lib/utils/matchHelpers";

export default function ClientDashboard() {
  const router = useRouter();
  const { data: myMatches = [], isLoading } = useUserMatches();

  // Find the ONE active trip (only one trip at a time allowed)
  const activeTrip = myMatches.find((match) => {
    // Exclude non-active statuses (including completed)
    if (
      match.status === "rejected" ||
      match.status === "cancelled" ||
      match.status === "expired" ||
      match.status === "completed"
    ) {
      return false;
    }

    // Exclude if pending and expired
    if (match.status === "pending" && isMatchExpired(match)) {
      console.warn(
        `⏰ [CLIENT DASHBOARD] Match ${match.id} has expired, filtering out`,
      );
      return false;
    }

    // Exclude if trip completed (regardless of feedback status)
    if (match.tripId && match.trip?.status === "completed") {
      return false;
    }

    // Include ONLY: PENDING (not expired) or ACCEPTED
    return match.status === "pending" || match.status === "accepted";
  });

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
      {/* CTA Principal */}
      <Card
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
            sx={{ fontWeight: 700, mb: 2, fontSize: { xs: "1.15rem", md: "1.25rem" } }}
          >
            ¿Necesitás transportar algo?
          </Typography>

          <Button
            variant="contained"
            color="secondary"
            size="large"
            fullWidth
            startIcon={<Add />}
            onClick={handleRequestFreight}
            disabled={!!activeTrip}
            sx={{
              py: { xs: 2, md: 1.5 },
              fontSize: { xs: "1.1rem", md: "1rem" },
              fontWeight: 700,
              borderRadius: 3,
              minHeight: { xs: 56, md: 48 },
            }}
          >
            Solicitar Flete
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}
          >
            Conductores disponibles en tu zona
          </Typography>
        </CardContent>
      </Card>

      {/* Active Trip - Single Trip Only */}
      <Box>
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
              <LocalShipping
                sx={{ fontSize: 48, color: "grey.300", mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                No tienes viajes activos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cuando solicites un flete aparecerá aquí
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card
            sx={{
              borderLeft: "4px solid",
              borderLeftColor: getStatusColor(activeTrip.status, activeTrip),
              transition: "all 0.2s ease-in-out",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {/* Header: Title + Status */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={2}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Solicitud de Flete
                </Typography>
                <Chip
                  label={getStatusLabel(activeTrip.status, activeTrip).label}
                  color={getStatusLabel(activeTrip.status, activeTrip).color}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {/* Route Info with Icons */}
              <Box mb={2}>
                {/* Origin */}
                <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
                  <LocationOn
                    sx={{
                      fontSize: 20,
                      color: "primary.main",
                      mt: 0.2,
                    }}
                  />
                  <Typography variant="body2" fontSize="0.9rem">
                    {activeTrip.pickupAddress || "Origen"}
                  </Typography>
                </Box>

                {/* Destination */}
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <Flag
                    sx={{
                      fontSize: 20,
                      color: "secondary.main",
                      mt: 0.2,
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontSize="0.9rem"
                    fontWeight={600}
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
                {activeTrip.conversation?.id ? "Volver al Chat" : "Ver Detalles"}
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </MobileContainer>
  );
}
