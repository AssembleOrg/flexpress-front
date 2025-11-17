"use client";

import { Add, History, LocalShipping } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { useUserMatches } from "@/lib/hooks/queries/useTravelMatchQueries";
import { isMatchExpired } from "@/lib/utils/matchHelpers";

export default function ClientDashboard() {
  const router = useRouter();
  const { data: myMatches = [], isLoading } = useUserMatches();

  // Find the ONE active trip (only one trip at a time allowed)
  const activeTrip = myMatches.find((match) => {
    // Exclude non-active statuses
    if (
      match.status === "rejected" ||
      match.status === "cancelled" ||
      match.status === "expired"
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

    // Include: PENDING (not expired), ACCEPTED, or COMPLETED
    return match.status === "pending" || match.status === "accepted" || match.status === "completed";
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
        return { label: "En Conversación", color: "info" as const };
      }

      // Check trip status for more granular state
      if (match?.trip?.status === "completed") {
        return { label: "Completado", color: "success" as const };
      }

      if (match?.trip?.status === "charter_completed") {
        return { label: "Esperando tu Confirmación", color: "warning" as const };
      }

      if (match?.trip?.status === "pending") {
        return { label: "En Progreso", color: "info" as const };
      }

      return { label: "Confirmado", color: "success" as const };
    }

    return { label: status, color: "default" as const };
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <AuthNavbar />

      <Container maxWidth="sm" sx={{ py: 4, px: 2 }}>
        {/* CTA Principal*/}
        <Card sx={{ mb: 3, overflow: "visible" }}>
          <CardContent sx={{ p: 3, textAlign: "center", position: "relative" }}>
            {/* Quick action icons */}
            <Box display="flex" justifyContent="center" gap={1} mb={3}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                }}
              />
              <Typography
                variant="caption"
                color="success.main"
                sx={{ fontWeight: 600 }}
              >
                Conductores disponibles ahora
              </Typography>
            </Box>

            <LocalShipping
              sx={{ fontSize: 40, color: "primary.main", mb: 2 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              ¿Necesitás transportar algo?
            </Typography>

            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              startIcon={<Add />}
              onClick={handleRequestFreight}
              sx={{
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 3,
              }}
            >
              Solicitar Flete
            </Button>

            {/* Delivery estimate */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, display: "block" }}
            >
              Conductores disponibles en tu zona
            </Typography>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Box display="flex" gap={2} mb={3}>
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={() => router.push("/client/trips/history")}
            sx={{ flex: 1, py: 1.5 }}
          >
            Historial
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push("/support")}
            sx={{ flex: 1, py: 1.5 }}
          >
            Soporte
          </Button>
        </Box>

        {/* Active Trip - Single Trip Only */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Tu Viaje Activo
          </Typography>

          {isLoading ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
            </Box>
          ) : !activeTrip ? (
            <Box textAlign="center" py={4}>
              <LocalShipping sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No tienes viajes activos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cuando solicites un flete aparecerá aquí
              </Typography>
            </Box>
          ) : (
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="start"
                  mb={2}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Solicitud de Flete
                  </Typography>
                  <Chip
                    label={getStatusLabel(activeTrip.status, activeTrip).label}
                    color={getStatusLabel(activeTrip.status, activeTrip).color}
                    size="small"
                  />
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  De: {activeTrip.pickupAddress || "Origen"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={2}
                >
                  A: {activeTrip.destinationAddress || "Destino"}
                </Typography>

                {/* Show charter name if accepted */}
                {activeTrip.status === "accepted" && activeTrip.charter && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={2}
                  >
                    Chófer: <strong>{activeTrip.charter.name}</strong>
                  </Typography>
                )}

                <Box display="flex" gap={1}>
                  {/* Direct chat access if conversation exists */}
                  {activeTrip.conversation?.id ? (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleViewMatch(activeTrip.id)}
                    >
                      Volver al Chat
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleViewMatch(activeTrip.id)}
                    >
                      Ver Detalles
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Acceso rápido al historial */}
        <Button
          variant="outlined"
          fullWidth
          startIcon={<History />}
          onClick={() => router.push("/client/trips/history")}
          sx={{ mt: 2 }}
        >
          Ver Historial Completo
        </Button>
      </Container>
    </Box>
  );
}
