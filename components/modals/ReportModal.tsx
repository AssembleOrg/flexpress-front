"use client";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useCreateReport } from "@/lib/hooks/mutations/useReportMutations";

export interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  reportedUserId: string;
  reportedUserName?: string;
}

/**
 * ReportModal Component
 *
 * Modal dialog for users to report inappropriate behavior or abuse from other users.
 * Features:
 * - Reason field (required, max 100 chars)
 * - Description field (optional, max 500 chars)
 * - Submit button disabled until reason is provided
 * - Loading state during submission
 * - Auto-closes on success
 *
 * Usage:
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <ReportModal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   conversationId="conv-123"
 *   reportedUserId="user-456"
 *   reportedUserName="Juan Pérez"
 * />
 * ```
 */
export function ReportModal({
  open,
  onClose,
  conversationId,
  reportedUserId,
  reportedUserName = "usuario",
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const createReportMutation = useCreateReport();
  const isSubmitting = createReportMutation.isPending;
  const isReasonProvided = reason.trim().length > 0;

  const handleSubmit = async () => {
    if (!isReasonProvided) return;

    const reportData = {
      conversationId,
      reportedId: reportedUserId,
      reason: reason.trim(),
      description: description.trim() || undefined,
    };

    createReportMutation.mutate(reportData, {
      onSuccess: () => {
        // Reset form and close modal
        setReason("");
        setDescription("");
        onClose();
      },
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reportar a {reportedUserName}</DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Reason Field */}
          <TextField
            label="Razón del reporte"
            placeholder="Ej: Acoso, contenido inapropiado, abuso"
            value={reason}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                setReason(e.target.value);
              }
            }}
            disabled={isSubmitting}
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            helperText={`${reason.length}/100 caracteres (requerido)`}
            error={!isReasonProvided && reason.length === 0 ? false : false}
            slotProps={{
              htmlInput: {
                maxLength: 100,
              },
            }}
          />

          {/* Description Field */}
          <TextField
            label="Descripción adicional (opcional)"
            placeholder="Proporciona más detalles sobre el incidente..."
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setDescription(e.target.value);
              }
            }}
            disabled={isSubmitting}
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            helperText={`${description.length}/500 caracteres`}
            slotProps={{
              htmlInput: {
                maxLength: 500,
              },
            }}
          />

          {/* Info Text */}
          <FormHelperText sx={{ fontSize: "0.75rem" }}>
            ⓘ Los reportes son revisados por nuestro equipo de moderación. Por
            favor sé específico y honesto.
          </FormHelperText>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isReasonProvided || isSubmitting}
          variant="contained"
          color="error"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} />
              Enviando...
            </>
          ) : (
            "Enviar Reporte"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
