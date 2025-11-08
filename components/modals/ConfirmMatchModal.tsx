"use client";

import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { AvailableCharter, TravelMatch } from "@/lib/types/api";

/**
 * ConfirmMatchModal
 *
 * Displayed to the user after selecting a charter.
 * Shows confirmation details before proceeding to chat.
 *
 * Props:
 * - open: Dialog open state
 * - onClose: Called when user clicks Cancel
 * - onConfirm: Called when user clicks Confirm (navigation handled by parent)
 * - match: TravelMatch object with trip details
 * - selectedCharter: AvailableCharter object with charter details
 * - isLoading: Show loading state during confirmation
 * - userCredits: User's available credits for validation
 */

interface ConfirmMatchModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  match: TravelMatch | null;
  selectedCharter: AvailableCharter | null;
  isLoading?: boolean;
  userCredits?: number;
}

export function ConfirmMatchModal({
  open,
  onClose,
  onConfirm,
  match,
  selectedCharter,
  isLoading = false,
  userCredits = 0,
}: ConfirmMatchModalProps) {
  // Defensiva: si no hay datos necesarios, no renderizar
  if (!match || !selectedCharter) {
    return null;
  }

  // Validación de créditos
  const estimatedCredits = selectedCharter.estimatedCredits || 0;
  const hasEnoughCredits = userCredits >= estimatedCredits;
  const creditsDifference = estimatedCredits - userCredits;
  const creditsAfter = userCredits - estimatedCredits;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Confirmar Selección de Chófer
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {/* Charter Info Section */}
        <Stack spacing={3}>
          {/* Charter Card */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          >
            {/* Avatar */}
            <Avatar
              src={selectedCharter.charterAvatar || undefined}
              sx={{ width: 56, height: 56 }}
            >
              {selectedCharter.charterName?.charAt(0).toUpperCase()}
            </Avatar>

            {/* Charter Details */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {selectedCharter.charterName || "Chófer"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCharter.charterEmail}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Trip Details */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Detalles del Viaje
            </Typography>

            <Stack spacing={1.5}>
              {/* Origen */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Origen
                </Typography>
                <Typography variant="body2">
                  {match.pickupAddress || "No especificado"}
                </Typography>
              </Box>

              {/* Destino */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Destino
                </Typography>
                <Typography variant="body2">
                  {match.destinationAddress || "No especificado"}
                </Typography>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              {/* Distancia y Créditos */}
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Distancia Total
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedCharter.totalDistance?.toFixed(1) || "0"} km
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Créditos Estimados
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    {selectedCharter.estimatedCredits || 0}
                  </Typography>
                </Box>
              </Box>

              {/* Distancia del Chófer al Pickup */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Distancia del Chófer a tu Pickup
                </Typography>
                <Typography variant="body2">
                  {selectedCharter.distanceToPickup?.toFixed(1) || "0"} km
                </Typography>
              </Box>

              {/* Trabajadores (si aplica) */}
              {match.workersCount && match.workersCount > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Número de Trabajadores
                  </Typography>
                  <Typography variant="body2">{match.workersCount}</Typography>
                </Box>
              )}

              {/* Fecha Programada (si aplica) */}
              {match.scheduledDate && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fecha Programada
                  </Typography>
                  <Typography variant="body2">
                    {new Date(match.scheduledDate).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Credits Validation Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              💳 Resumen de Créditos
            </Typography>

            <Stack spacing={1.5}>
              {/* Credits Needed */}
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Créditos Necesarios
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {estimatedCredits}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tus Créditos Disponibles
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: hasEnoughCredits ? "success.main" : "error.main",
                    }}
                  >
                    {userCredits}
                  </Typography>
                </Box>
              </Box>

              {/* Credit Status Alert */}
              {hasEnoughCredits ? (
                <Alert severity="success" sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    ✅ Créditos Suficientes
                  </Typography>
                  <Typography variant="caption">
                    Te quedarán {creditsAfter} créditos después de esta
                    transacción
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="error" sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    ❌ Créditos Insuficientes
                  </Typography>
                  <Typography variant="caption">
                    Te faltan {creditsDifference} créditos para continuar
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Info Message */}
          <Typography variant="caption" color="text.secondary" sx={{ p: 1 }}>
            ℹ️ Al confirmar, el chófer será notificado y podrá aceptar o rechazar
            tu solicitud. Podrán comunicarse por chat mientras se confirma.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isLoading} variant="outlined">
          Cancelar
        </Button>

        <Button
          onClick={onConfirm}
          disabled={isLoading || !hasEnoughCredits}
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? "Confirmando..." : "Confirmar Selección"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
