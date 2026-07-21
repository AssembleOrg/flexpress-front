"use client";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";

/**
 * RejectReasonModal
 *
 * Modal genérico y reutilizable para rechazar una entidad con un motivo
 * obligatorio. El estado del textarea vive DENTRO del modal, de modo que
 * escribir no re-renderiza el árbol de la lista/card que lo abre.
 *
 * Props:
 * - open: Estado del modal
 * - onClose: Callback al cerrar/cancelar
 * - onConfirm: Callback al confirmar (recibe la razón ya trimmeada)
 * - title: Título del diálogo (ej. "Rechazar conductor")
 * - label: Label del textarea (default: "Motivo del rechazo")
 * - isLoading: Estado de carga durante la mutation
 */

interface RejectReasonModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  label?: string;
  isLoading?: boolean;
}

export function RejectReasonModal({
  open,
  onClose,
  onConfirm,
  title,
  label = "Motivo del rechazo",
  isLoading = false,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          label={label}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          autoFocus
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={!reason.trim() || isLoading}
          onClick={handleConfirm}
          startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
        >
          Confirmar rechazo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
