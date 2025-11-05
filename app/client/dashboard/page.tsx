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

export default function ClientDashboard() {
  const router = useRouter();
  const { data: myMatches = [], isLoading } = useUserMatches();

  const activeMatches = myMatches.filter(
    (match) => match.status === "pending" || match.status === "accepted",
  );

  const handleRequestFreight = () => {
    router.push("/client/trips/new");
  };

  const handleViewMatch = (matchId: string) => {
    router.push(`/client/trips/matching?matchId=${matchId}`);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<
      string,
      {
        label: string;
        color:
          | "default"
          | "primary"
          | "secondary"
          | "error"
          | "info"
          | "success"
          | "warning";
      }
    > = {
      pending: { label: "Esperando", color: "warning" },
      accepted: { label: "Aceptado", color: "success" },
      rejected: { label: "Rechazado", color: "error" },
      completed: { label: "Completado", color: "default" },
    };
    return labels[status] || { label: status, color: "default" };
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

        {/* Active Trips - Condensed */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Mis Solicitudes Activas
          </Typography>

          {isLoading ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
            </Box>
          ) : activeMatches.length === 0 ? (
            <Box textAlign="center" py={4}>
              <LocalShipping sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No tienes solicitudes activas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cuando solicites un flete aparecerá aquí
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {activeMatches.map((match) => {
                const statusInfo = getStatusLabel(match.status);
                return (
                  <Card key={match.id}>
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="start"
                        mb={1}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          Solicitud de Flete
                        </Typography>
                        <Chip
                          label={statusInfo.label}
                          color={statusInfo.color}
                          size="small"
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={1}
                      >
                        De: {match.pickupAddress || "Origen"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={2}
                      >
                        A: {match.destinationAddress || "Destino"}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => handleViewMatch(match.id)}
                      >
                        Ver Detalles
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
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
