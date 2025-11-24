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
import { Info } from "@mui/icons-material";

/**
 * FinalizeTripModal
 *
 * Modal de confirmación para cuando el charter finaliza el viaje.
 * ACCIÓN CRÍTICA: Marca el viaje como "charter_completed" y espera confirmación del cliente.
 *
 * Props:
 * - open: Estado del modal
 * - onClose: Callback al cerrar
 * - onConfirm: Callback al confirmar (ejecuta la mutation)
 * - clientName: Nombre del cliente
 * - estimatedCredits: Créditos que se ganarán al completar
 * - isLoading: Estado de carga durante la mutation
 */

interface FinalizeTripModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
  estimatedCredits: number;
  isLoading?: boolean;
}

export function FinalizeTripModal({
  open,
  onClose,
  onConfirm,
  clientName,
  estimatedCredits,
  isLoading = false,
}: FinalizeTripModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: "1.1rem" }}>
        ¿Finalizar Viaje?
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Stack spacing={2}>
          {/* Info Alert */}
          <Alert severity="info" icon={<Info />} sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Esperarás confirmación del cliente
            </Typography>
            <Typography variant="caption">
              El cliente debe confirmar la recepción para completar el viaje
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
              Créditos pendientes
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "success.main" }}>
              +{estimatedCredits} pts
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Se acreditarán cuando {clientName} confirme
            </Typography>
          </Box>

          {/* Warning Info */}
          <Typography variant="caption" color="text.secondary">
            Al finalizar, el cliente recibirá una notificación para confirmar
            la entrega. Los créditos se transferirán automáticamente después de
            su confirmación.
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
          sx={{
            bgcolor: "success.main",
            "&:hover": { bgcolor: "success.dark" }
          }}
          startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
        >
          {isLoading ? "Finalizando..." : "Finalizar Viaje"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
