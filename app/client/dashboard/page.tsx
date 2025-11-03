"use client";

import { Add, History, LocalShipping } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { AuthNavbar } from "@/components/layout/AuthNavbar";

export default function ClientDashboard() {
  const router = useRouter();
  const activeTrips: { id: string }[] = [];

  const handleRequestFreight = () => {
    router.push("/client/trips/new");
  };

  const handleViewTrip = (tripId: string) => {
    router.push(`/trips/${tripId}`);
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
            onClick={() => console.log("Ver historial")}
            sx={{ flex: 1, py: 1.5 }}
          >
            Historial
          </Button>
          <Button
            variant="outlined"
            onClick={() => console.log("Soporte")}
            sx={{ flex: 1, py: 1.5 }}
          >
            Soporte
          </Button>
        </Box>

        {/* Active Trips - Condensed */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Mis Viajes Activos
          </Typography>

          {activeTrips.length === 0 ? (
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
            <Box display="flex" flexDirection="column" gap={2}>
              {activeTrips.map((trip) => (
                <Card key={trip.id}>
                  <CardContent>
                    <Typography variant="h6">Viaje activo</Typography>
                    <Button
                      size="small"
                      onClick={() => handleViewTrip(trip.id)}
                    >
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Acceso rápido al historial */}
        <Button
          variant="outlined"
          fullWidth
          startIcon={<History />}
          onClick={() => console.log("Ver historial completo")}
          sx={{ mt: 2 }}
        >
          Ver Historial Completo
        </Button>
      </Container>
    </Box>
  );
}
