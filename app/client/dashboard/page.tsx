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
import toast from "react-hot-toast";
import TripCard from "@/components/ui/TripCard";
import { getMockTripsByClient, mockCurrentUser } from "@/lib/mock/data";

export default function ClientDashboard() {
  const userTrips = getMockTripsByClient(mockCurrentUser.id);
  const activeTrips = userTrips.filter((trip) =>
    ["searching", "negotiating", "confirmed", "in_progress"].includes(
      trip.status,
    ),
  );

  const handleRequestFreight = () => {
    console.log("Solicitar nuevo flete");
    toast.success("Redirigiendo al formulario...", {
      duration: 2000,
    });
    window.location.href = "/client/trips/new";
  };

  const handleViewTrip = (tripId: string) => {
    console.log("Ver detalles del viaje:", tripId);
    // TODO: Navegar a los detalles del viaje
  };

  const handleCancelTrip = (tripId: string) => {
    console.log("Cancelar viaje:", tripId);
    toast.error("Funcionalidad de cancelar viaje en desarrollo");
    // TODO: Implementar lógica de cancelar viaje
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      {/* Header Bordo */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 3, mb: 3 }}>
        <Container maxWidth="sm">
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            Hola, {mockCurrentUser.firstName}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ py: 2, px: 2 }}>
        {/* CTA Principal - Uber style */}
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
                <TripCard
                  key={trip.id}
                  trip={trip}
                  variant="client"
                  onView={handleViewTrip}
                  onCancel={handleCancelTrip}
                />
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
