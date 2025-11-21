"use client";

import {
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
import type { TravelMatch } from "@/lib/types/api";

/**
 * AcceptMatchModal
 *
 * Displayed to the charter when they want to accept a match.
 * Shows trip details and asks for confirmation.
 *
 * Props:
 * - open: Dialog open state
 * - onClose: Called when user clicks Cancel or closes dialog
 * - onAccept: Called when user clicks Accept (mutation handled by parent)
 * - onReject: Called when user clicks Reject (mutation handled by parent)
 * - match: TravelMatch object with trip details
 * - isLoading: Show loading state during acceptance
 * - error: Display error message if response fails
 */

interface AcceptMatchModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  match: TravelMatch | null;
  isLoading?: boolean;
  error?: string | null;
}

export function AcceptMatchModal({
  open,
  onClose,
  onAccept,
  onReject,
  match,
  isLoading = false,
  error = null,
}: AcceptMatchModalProps) {
  // Defensiva: si no hay match, no renderizar
  if (!match) {
    return null;
  }

  // Defensiva: validar que el match esté en estado válido
  const isValidState =
    match.status === "pending" || match.status === "searching";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Nueva Solicitud de Viaje
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Stack spacing={2}>
          {/* Error Message (si existe) */}
          {error && (
            <Box
              sx={{
                p: 2,
                bgcolor: "error.light",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "error.main",
              }}
            >
              <Typography variant="body2" color="error.dark">
                {error}
              </Typography>
            </Box>
          )}

          {/* Status Warning */}
          {!isValidState && (
            <Box
              sx={{
                p: 2,
                bgcolor: "warning.light",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "warning.main",
              }}
            >
              <Typography variant="body2" color="warning.dark">
                ⚠️ Este viaje ya ha sido procesado o no está disponible.
              </Typography>
            </Box>
          )}

          {/* User Info */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              👤 Datos del Usuario
            </Typography>

            <Stack spacing={1.5}>
              {/* Nombre del usuario */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Nombre
                </Typography>
                <Typography variant="body2">
                  {match.user?.name || "Usuario"}
                </Typography>
              </Box>

              {/* Email del usuario */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Correo
                </Typography>
                <Typography variant="body2">
                  {match.user?.email || "No especificado"}
                </Typography>
              </Box>
            </Stack>
          </Box>

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

              {/* Distancia y Créditos a Ganar */}
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Distancia Total
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {match.distanceKm?.toFixed(1) || "0"} km
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Créditos a Ganar
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "success.main" }}
                  >
                    {match.estimatedCredits || 0}
                  </Typography>
                </Box>
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

          {/* Info Message */}
          <Typography variant="caption" color="text.secondary" sx={{ p: 1 }}>
            ℹ️ Al aceptar, se habilitará un chat privado con el usuario para
            confirmar detalles del viaje.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onReject}
          disabled={isLoading || !isValidState}
          variant="outlined"
          color="error"
        >
          Rechazar
        </Button>

        <Button
          onClick={onAccept}
          disabled={isLoading || !isValidState}
          variant="contained"
          color="success"
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? "Aceptando..." : "Aceptar Viaje"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
