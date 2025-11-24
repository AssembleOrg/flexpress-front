"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

/**
 * ConfirmCompletionModal
 *
 * Modal de confirmación para cuando el cliente confirma la recepción final.
 * ACCIÓN CRÍTICA: Marca el viaje como completado y transfiere créditos al charter.
 *
 * Props:
 * - open: Estado del modal
 * - onClose: Callback al cerrar
 * - onConfirm: Callback al confirmar (ejecuta la mutation)
 * - charterName: Nombre del transportista
 * - estimatedCredits: Créditos que se transferirán
 * - isLoading: Estado de carga durante la mutation
 */

interface ConfirmCompletionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  charterName: string;
  estimatedCredits: number;
  isLoading?: boolean;
}

export function ConfirmCompletionModal({
  open,
  onClose,
  onConfirm,
  charterName,
  estimatedCredits,
  isLoading = false,
}: ConfirmCompletionModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: "1.1rem" }}>
        ¿Confirmar Recepción?
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Stack spacing={2}>
          {/* Success Alert */}
          <Alert severity="success" icon={<CheckCircle />} sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              El transportista finalizó el viaje
            </Typography>
            <Typography variant="caption">
              Confirma que recibiste tu carga correctamente
            </Typography>
          </Alert>

          {/* Credits Info */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Créditos a transferir
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
              {estimatedCredits} → {charterName}
            </Typography>
          </Box>

          {/* Warning Info */}
          <Typography variant="caption" color="text.secondary">
            Al confirmar, los créditos serán transferidos y el viaje se
            marcará como completado. Si hay algún problema, usa el botón
            "Reportar Problema" antes de confirmar.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isLoading} variant="outlined">
          Cancelar
        </Button>

        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color="success"
          startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
        >
          {isLoading ? "Confirmando..." : "Confirmar Recepción"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
