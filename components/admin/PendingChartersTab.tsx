"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Link,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Description as DocumentIcon,
} from "@mui/icons-material";
import { usePendingCharters } from "@/lib/hooks/queries/useAdminQueries";
import { useVerifyCharter } from "@/lib/hooks/mutations/useAdminMutations";
import type { User } from "@/lib/types/api";

export function PendingChartersTab() {
  const { data: pendingCharters = [], isLoading, error } = usePendingCharters();
  const verifyMutation = useVerifyCharter();

  const [selectedCharter, setSelectedCharter] = useState<User | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async (charter: User) => {
    await verifyMutation.mutateAsync({
      charterId: charter.id,
      status: "verified",
    });
  };

  const handleRejectClick = (charter: User) => {
    setSelectedCharter(charter);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedCharter || !rejectionReason.trim()) return;

    await verifyMutation.mutateAsync({
      charterId: selectedCharter.id,
      status: "rejected",
      rejectionReason: rejectionReason.trim(),
    });

    setRejectDialogOpen(false);
    setSelectedCharter(null);
    setRejectionReason("");
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress sx={{ color: "#dca621" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar los charters pendientes
      </Alert>
    );
  }

  if (pendingCharters.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          No hay charters pendientes de verificación
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Cuando un nuevo conductor se registre, aparecerá aquí para su
          aprobación.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" mb={3}>
        Charters Pendientes de Verificación ({pendingCharters.length})
      </Typography>

      <Stack spacing={2}>
        {pendingCharters.map((charter) => (
          <Card
            key={charter.id}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                borderColor: "#dca621",
              },
            }}
          >
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                alignItems={{ md: "center" }}
                justifyContent="space-between"
              >
                {/* Charter Info */}
                <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                  <Avatar
                    src={charter.avatar || undefined}
                    sx={{ width: 64, height: 64, bgcolor: "#dca621" }}
                  >
                    {charter.name?.charAt(0)?.toUpperCase()}
                  </Avatar>

                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {charter.name}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {charter.email}
                      </Typography>
                    </Stack>

                    {charter.number && (
                      <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {charter.number}
                        </Typography>
                      </Stack>
                    )}

                    {charter.originAddress && (
                      <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {charter.originAddress}
                        </Typography>
                      </Stack>
                    )}

                    <Typography variant="caption" color="text.secondary" mt={1} display="block">
                      Registrado: {new Date(charter.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                </Stack>

                {/* Documentation Links */}
                <Stack spacing={1} minWidth={200}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Documentación:
                  </Typography>
                  {charter.documentationFrontUrl ? (
                    <Link
                      href={charter.documentationFrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <DocumentIcon fontSize="small" />
                      Ver documento (frente)
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin documento frontal
                    </Typography>
                  )}
                  {charter.documentationBackUrl ? (
                    <Link
                      href={charter.documentationBackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <DocumentIcon fontSize="small" />
                      Ver documento (dorso)
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin documento dorsal
                    </Typography>
                  )}
                </Stack>

                {/* Actions */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleApprove(charter)}
                    disabled={verifyMutation.isPending}
                    sx={{
                      bgcolor: "#2e7d32",
                      "&:hover": { bgcolor: "#1b5e20" },
                    }}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => handleRejectClick(charter)}
                    disabled={verifyMutation.isPending}
                  >
                    Rechazar
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Rejection Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rechazar Charter</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ingresa el motivo del rechazo. Este mensaje será visible para el
            conductor.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Motivo del rechazo"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Ej: Documentación incompleta, imagen ilegible, etc."
            error={rejectionReason.trim() === ""}
            helperText={
              rejectionReason.trim() === ""
                ? "El motivo es obligatorio"
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmReject}
            color="error"
            variant="contained"
            disabled={!rejectionReason.trim() || verifyMutation.isPending}
          >
            {verifyMutation.isPending ? "Rechazando..." : "Confirmar Rechazo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
