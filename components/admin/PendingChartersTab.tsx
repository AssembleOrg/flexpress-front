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
  IconButton,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Description as DocumentIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  OpenInNew as OpenInNewIcon,
  AttachFile as AttachFileIcon,
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

  // Estado para lazy loading de imágenes
  const [expandedCharterId, setExpandedCharterId] = useState<string | null>(null);

  // Estados para el modal de imágenes DNI (ambas imágenes)
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedCharterForModal, setSelectedCharterForModal] = useState<User | null>(null);

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

  const handleToggleImages = (charterId: string) => {
    setExpandedCharterId(prev => prev === charterId ? null : charterId);
  };

  const handleImageClick = (charter: User) => {
    setSelectedCharterForModal(charter);
    setImageModalOpen(true);
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

                {/* DNI Images - Lazy Loading */}
                <Stack spacing={2} minWidth={300}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Documentación DNI:
                  </Typography>

                  {expandedCharterId === charter.id ? (
                    // Mostrar imágenes (solo cuando se expandió)
                    <>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Front */}
                        {charter.documentationFrontUrl ? (
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" display="block" gutterBottom>
                              Frente
                            </Typography>
                            <Box
                              onClick={() => handleImageClick(charter)}
                              sx={{
                                cursor: "pointer",
                                position: "relative",
                                "&:hover": {
                                  opacity: 0.8,
                                  "& .overlay": {
                                    opacity: 1,
                                  },
                                },
                              }}
                            >
                              <img
                                src={charter.documentationFrontUrl}
                                alt="DNI Frente"
                                style={{
                                  width: "100%",
                                  maxHeight: 120,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                  border: "1px solid #ddd",
                                }}
                              />
                              <Box
                                className="overlay"
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  bgcolor: "rgba(0, 0, 0, 0.5)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 1,
                                  opacity: 0,
                                  transition: "opacity 0.2s",
                                }}
                              >
                                <ZoomInIcon sx={{ color: "white", fontSize: 32 }} />
                              </Box>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" display="block" gutterBottom color="text.secondary">
                              Frente
                            </Typography>
                            <Box
                              sx={{
                                border: "2px dashed",
                                borderColor: "error.light",
                                borderRadius: 1,
                                p: 2,
                                textAlign: "center",
                                bgcolor: "error.lighter",
                                minHeight: 120,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Stack spacing={1} alignItems="center">
                                <DocumentIcon sx={{ fontSize: 32, color: "error.main" }} />
                                <Typography variant="caption" color="error.main" fontWeight={600}>
                                  Sin documento frontal
                                </Typography>
                              </Stack>
                            </Box>
                          </Box>
                        )}

                        {/* Back */}
                        {charter.documentationBackUrl ? (
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" display="block" gutterBottom>
                              Dorso
                            </Typography>
                            <Box
                              onClick={() => handleImageClick(charter)}
                              sx={{
                                cursor: "pointer",
                                position: "relative",
                                "&:hover": {
                                  opacity: 0.8,
                                  "& .overlay": {
                                    opacity: 1,
                                  },
                                },
                              }}
                            >
                              <img
                                src={charter.documentationBackUrl}
                                alt="DNI Dorso"
                                style={{
                                  width: "100%",
                                  maxHeight: 120,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                  border: "1px solid #ddd",
                                }}
                              />
                              <Box
                                className="overlay"
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  bgcolor: "rgba(0, 0, 0, 0.5)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 1,
                                  opacity: 0,
                                  transition: "opacity 0.2s",
                                }}
                              >
                                <ZoomInIcon sx={{ color: "white", fontSize: 32 }} />
                              </Box>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" display="block" gutterBottom color="text.secondary">
                              Dorso
                            </Typography>
                            <Box
                              sx={{
                                border: "2px dashed",
                                borderColor: "error.light",
                                borderRadius: 1,
                                p: 2,
                                textAlign: "center",
                                bgcolor: "error.lighter",
                                minHeight: 120,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Stack spacing={1} alignItems="center">
                                <DocumentIcon sx={{ fontSize: 32, color: "error.main" }} />
                                <Typography variant="caption" color="error.main" fontWeight={600}>
                                  Sin documento dorsal
                                </Typography>
                              </Stack>
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {/* Botón para ocultar imágenes */}
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => setExpandedCharterId(null)}
                        sx={{ alignSelf: "flex-start" }}
                      >
                        Ocultar Imágenes
                      </Button>
                    </>
                  ) : (
                    // Mostrar botón para cargar imágenes
                    <Button
                      variant="outlined"
                      startIcon={<AttachFileIcon />}
                      onClick={() => handleToggleImages(charter.id)}
                      size="small"
                      sx={{
                        alignSelf: "flex-start",
                        borderColor: charter.documentationFrontUrl || charter.documentationBackUrl ? "success.main" : "divider",
                        color: charter.documentationFrontUrl || charter.documentationBackUrl ? "success.main" : "text.primary",
                        "&:hover": {
                          borderColor: charter.documentationFrontUrl || charter.documentationBackUrl ? "success.dark" : "primary.main",
                          bgcolor: charter.documentationFrontUrl || charter.documentationBackUrl ? "success.lighter" : "action.hover",
                        },
                      }}
                    >
                      Ver Adjuntados ({
                        [charter.documentationFrontUrl, charter.documentationBackUrl]
                          .filter(Boolean).length
                      })
                    </Button>
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

      {/* Image Modal - Ambas Imágenes Lado a Lado */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                DNI de {selectedCharterForModal?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCharterForModal?.email}
              </Typography>
            </Box>
            <IconButton onClick={() => setImageModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedCharterForModal && (
            <Box sx={{ display: 'flex', gap: 3, py: 2 }}>
              {/* Frente */}
              {selectedCharterForModal.documentationFrontUrl && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Frente del DNI
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "grey.100",
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 400,
                    }}
                  >
                    <img
                      src={selectedCharterForModal.documentationFrontUrl}
                      alt="DNI Frente"
                      style={{
                        width: '100%',
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        borderRadius: 8,
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Dorso */}
              {selectedCharterForModal.documentationBackUrl && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                    Dorso del DNI
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "grey.100",
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 400,
                    }}
                  >
                    <img
                      src={selectedCharterForModal.documentationBackUrl}
                      alt="DNI Dorso"
                      style={{
                        width: '100%',
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        borderRadius: 8,
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedCharterForModal?.documentationFrontUrl && (
            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={() => window.open(selectedCharterForModal.documentationFrontUrl ?? undefined, "_blank")}
            >
              Abrir Frente en Nueva Pestaña
            </Button>
          )}
          {selectedCharterForModal?.documentationBackUrl && (
            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={() => window.open(selectedCharterForModal.documentationBackUrl ?? undefined, "_blank")}
            >
              Abrir Dorso en Nueva Pestaña
            </Button>
          )}
          <Button onClick={() => setImageModalOpen(false)} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
