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
import { useToggleAvailability } from "@/lib/hooks/mutations/useTravelMatchMutations";

export default function DriverDashboard() {
  const [isAvailable, setIsAvailable] = useState(false);
  const toggleMutation = useToggleAvailability();

  const handleAvailabilityChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newStatus = event.target.checked;
    setIsAvailable(newStatus);
    toggleMutation.mutate(newStatus);
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

        {/* Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              ℹ️ Cómo Funciona
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Cuando estés conectado (disponible), recibirás notificaciones en
              tiempo real de nuevas solicitudes de viaje que coincidan con tu
              ubicación y disponibilidad.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Acepta o rechaza las solicitudes según tus preferencias. ¡Buena
              suerte!
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
