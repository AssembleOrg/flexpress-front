"use client";

import {
  Box,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { AuthNavbar } from "@/components/layout/AuthNavbar";

export default function DriverDashboard() {
  const [isAvailable, setIsAvailable] = useState(false);
  const availableTrips: { id: string }[] = [];

  const handleAvailabilityChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newStatus = event.target.checked;
    setIsAvailable(newStatus);
    // TODO: Conectar con API en Fase 4
  };

  const _handleAcceptTrip = (_tripId: string) => {
    // TODO: Implementar en Fase 3
  };

  const _handleViewTrip = (_tripId: string) => {
    // TODO: Implementar en Fase 4
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <AuthNavbar />

      <Container maxWidth="sm" sx={{ py: 4, px: 2 }}>
        {/* Status Toggle - Uber Driver Style */}
        <Card sx={{ mb: 3, overflow: "visible" }}>
          <CardContent sx={{ p: 3, textAlign: "center", position: "relative" }}>
            {/* Status indicator */}
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor: isAvailable ? "success.main" : "grey.400",
                position: "absolute",
                top: 16,
                right: 16,
              }}
            />

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {isAvailable ? "Estás en línea" : "Estás desconectado"}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={isAvailable}
                  onChange={handleAvailabilityChange}
                  size="medium"
                  color="secondary"
                />
              }
              label={
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {isAvailable ? "Conectado" : "Desconectado"}
                </Typography>
              }
              labelPlacement="top"
              sx={{ mb: 2 }}
            />

            <Typography variant="caption" color="text.secondary">
              {isAvailable
                ? "Recibiendo solicitudes de viajes"
                : "Actívate para empezar a ganar"}
            </Typography>
          </CardContent>
        </Card>

        {/* Earnings Summary - Quick Stats */}
        {isAvailable && (
          <Box display="flex" gap={2} mb={3}>
            <Card sx={{ flex: 1, p: 2, textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "success.main" }}
              >
                $1,250
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Esta semana
              </Typography>
            </Card>
            <Card sx={{ flex: 1, p: 2, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                0
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Viajes completados
              </Typography>
            </Card>
          </Box>
        )}

        {/* Trip Requests */}
        <Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Solicitudes
            </Typography>
            {isAvailable && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "success.main",
                    animation: "pulse 2s infinite",
                  }}
                />
                <Typography variant="caption" color="success.main">
                  Buscando...
                </Typography>
              </Box>
            )}
          </Box>

          {!isAvailable ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" sx={{ mb: 1, opacity: 0.5 }}>
                📴
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Actívate para empezar a recibir viajes
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Las solicitudes aparecerán cuando estés disponible
              </Typography>
            </Box>
          ) : availableTrips.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                🔍
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Buscando solicitudes cerca de ti
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Te notificaremos cuando aparezcan nuevas
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {availableTrips.map((trip) => (
                <Card key={trip.id}>
                  <CardContent>
                    <Typography variant="body2">Viaje disponible</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
