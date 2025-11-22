"use client";

import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { Route, AttachMoney } from "@mui/icons-material";
import { useUserFeedback } from "@/lib/hooks/queries/useFeedbackQueries";
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

  // Fetch client rating
  const { data: clientFeedback } = useUserFeedback(match.userId);

  // Defensiva: validar que el match esté en estado válido
  const isValidState =
    match.status === "pending" || match.status === "searching";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: "1.1rem" }}>
        Nueva Solicitud
      </DialogTitle>

      <DialogContent sx={{ py: 1.5 }}>
        <Stack spacing={1.5}>
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

          {/* User Info - Compact */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              bgcolor: "action.hover",
              borderRadius: 1.5,
            }}
          >
            <Avatar
              src={match.user?.avatar || undefined}
              sx={{ width: 48, height: 48 }}
            >
              {match.user?.name?.[0]?.toUpperCase() || "U"}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {match.user?.name || "Cliente"}
              </Typography>
              {/* Rating */}
              {clientFeedback && clientFeedback.totalFeedbacks > 0 ? (
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                  <Rating
                    value={clientFeedback.averageRating}
                    readOnly
                    size="small"
                    precision={0.1}
                    sx={{ fontSize: "1rem" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {clientFeedback.averageRating.toFixed(1)} ({clientFeedback.totalFeedbacks})
                  </Typography>
                </Box>
              ) : (
                <Chip
                  label="Nuevo"
                  size="small"
                  color="secondary"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    mt: 0.5,
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Trip Summary - Compact */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: "background.default",
              borderRadius: 1.5,
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontSize: "0.7rem", fontWeight: 600 }}>
              📍 Origen → 🏁 Destino
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.85rem", lineHeight: 1.4, mb: 0.5 }}>
              {match.pickupAddress || "No especificado"}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.4 }}>
              {match.destinationAddress || "No especificado"}
            </Typography>
          </Box>

          {/* Key Metrics - Compact Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                bgcolor: "background.default",
                borderRadius: 1.5,
                textAlign: "center",
              }}
            >
              <Route sx={{ fontSize: 20, color: "primary.main", mb: 0.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
                {match.distanceKm?.toFixed(1) || "0"} km
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                Distancia
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.5,
                bgcolor: "background.default",
                borderRadius: 1.5,
                textAlign: "center",
              }}
            >
              <AttachMoney sx={{ fontSize: 20, color: "success.main", mb: 0.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem", color: "success.main" }}>
                {match.estimatedCredits || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                Créditos
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1.5, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={onReject}
          disabled={isLoading || !isValidState}
          variant="outlined"
          color="error"
          size="large"
          sx={{ flex: 1, minHeight: 48 }}
        >
          Rechazar
        </Button>

        <Button
          onClick={onAccept}
          disabled={isLoading || !isValidState}
          variant="contained"
          sx={{
            flex: 1,
            minHeight: 48,
            fontWeight: 700,
            bgcolor: "secondary.main",
            "&:hover": { bgcolor: "secondary.dark" }
          }}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? "Aceptando..." : "Aceptar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
