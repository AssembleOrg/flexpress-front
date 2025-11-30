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
 * ApprovePaymentModal
 *
 * Modal de confirmación para que el admin apruebe una solicitud de pago.
 * ACCIÓN CRÍTICA: Acredita créditos al usuario inmediatamente.
 *
 * Props:
 * - open: Estado del modal
 * - onClose: Callback al cerrar
 * - onConfirm: Callback al confirmar (ejecuta la mutation)
 * - userName: Nombre del usuario que solicita el pago
 * - credits: Cantidad de créditos a acreditar
 * - amount: Monto en ARS transferido
 * - isLoading: Estado de carga durante la mutation
 */

interface ApprovePaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  credits: number;
  amount: number;
  isLoading?: boolean;
}

export function ApprovePaymentModal({
  open,
  onClose,
  onConfirm,
  userName,
  credits,
  amount,
  isLoading = false,
}: ApprovePaymentModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: "1.1rem" }}>
        ¿Aprobar Pago?
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Stack spacing={2}>
          {/* Info Alert */}
          <Alert severity="info" icon={<CheckCircle />} sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Aprobar pago de {userName}
            </Typography>
            <Typography variant="caption">
              Los créditos se acreditarán inmediatamente
            </Typography>
          </Alert>

          {/* Payment Details */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Detalles del pago
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              Usuario: {userName}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              Créditos: {credits}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Monto: ${amount.toLocaleString("es-AR")}
            </Typography>
          </Box>
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
          {isLoading ? "Aprobando..." : "Aprobar y Acreditar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
