"use client";

import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { Warning } from "@mui/icons-material";

/**
 * ConfirmTripModal
 *
 * Modal de confirmación para cuando el cliente confirma el viaje.
 * ACCIÓN CRÍTICA: Deduce créditos del usuario y marca el viaje como confirmado.
 *
 * Props:
 * - open: Estado del modal
 * - onClose: Callback al cerrar
 * - onConfirm: Callback al confirmar (ejecuta la mutation)
 * - estimatedCredits: Créditos que se deducirán
 * - userCredits: Créditos actuales del usuario
 * - isLoading: Estado de carga durante la mutation
 */

interface ConfirmTripModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmTripModal({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmTripModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: "1.1rem" }}>
        ¿Confirmar Viaje?
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Stack spacing={2}>
          {/* Warning Alert */}
          <Alert severity="warning" icon={<Warning />} sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              ¿Estás listo para iniciar el viaje?
            </Typography>
            <Typography variant="caption">
              Esta acción es irreversible
            </Typography>
          </Alert>

          {/* Info */}
          <Typography variant="caption" color="text.secondary">
            El transportista será notificado para iniciar el servicio.
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
        >
          {isLoading ? <CircularProgress size={18} sx={{ color: "inherit" }} /> : "Confirmar Viaje"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
