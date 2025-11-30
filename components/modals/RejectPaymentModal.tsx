"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

/**
 * RejectPaymentModal
 *
 * Modal para que el admin rechace una solicitud de pago con razón obligatoria.
 *
 * Props:
 * - open: Estado del modal
 * - onClose: Callback al cerrar
 * - onConfirm: Callback al confirmar (recibe la razón del rechazo)
 * - userName: Nombre del usuario que solicita el pago
 * - credits: Cantidad de créditos que NO serán acreditados
 * - isLoading: Estado de carga durante la mutation
 */

interface RejectPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userName: string;
  credits: number;
  isLoading?: boolean;
}

export function RejectPaymentModal({
  open,
  onClose,
  onConfirm,
  userName,
  credits,
  isLoading = false,
}: RejectPaymentModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("La razón del rechazo es obligatoria");
      return;
    }
    onConfirm(reason);
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: "1.1rem" }}>
        Rechazar Pago
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Stack spacing={2}>
          {/* Warning Alert */}
          <Alert severity="warning" sx={{ py: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Rechazar solicitud de {userName}
            </Typography>
            <Typography variant="caption">
              {credits} créditos NO serán acreditados
            </Typography>
          </Alert>

          {/* Reason Input */}
          <TextField
            label="Razón del rechazo *"
            placeholder="Ej: Comprobante ilegible, monto incorrecto, etc."
            multiline
            rows={3}
            fullWidth
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            error={!!error}
            helperText={error || "Este mensaje será visible para el usuario"}
            required
            autoFocus
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={isLoading} variant="outlined">
          Cancelar
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={isLoading || !reason.trim()}
          variant="contained"
          color="error"
          startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
        >
          {isLoading ? "Rechazando..." : "Rechazar Pago"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
