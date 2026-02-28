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
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  DirectionsCar,
} from "@mui/icons-material";
import { usePendingCharters } from "@/lib/hooks/queries/useAdminQueries";
import { useVerifyCharter, useVerifyVehicle } from "@/lib/hooks/mutations/useAdminMutations";
import type { PendingCharterReviewItem, Vehicle } from "@/lib/types/api";
import { DocumentReviewStatus } from "@/lib/types/api";
import { MobileCharterVerificationCard } from "./mobile/MobileCharterVerificationCard";
import { useTheme, useMediaQuery } from "@mui/material";

export function PendingChartersTab() {
  const { data: pendingCharters = [], isLoading, error } = usePendingCharters();
  const verifyMutation = useVerifyCharter();
  const verifyVehicleMutation = useVerifyVehicle();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Charter reject dialog
  const [selectedCharter, setSelectedCharter] = useState<PendingCharterReviewItem | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Vehicle reject dialog
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleRejectDialogOpen, setVehicleRejectDialogOpen] = useState(false);
  const [vehicleRejectionReason, setVehicleRejectionReason] = useState("");

  const handleApprove = async (charter: PendingCharterReviewItem) => {
    await verifyMutation.mutateAsync({
      charterId: charter.id,
      status: "verified",
    });
  };

  const handleRejectClick = (charter: PendingCharterReviewItem) => {
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

  const handleApproveVehicle = async (vehicle: Vehicle) => {
    await verifyVehicleMutation.mutateAsync({
      vehicleId: vehicle.id,
      status: "verified",
    });
  };

  const handleRejectVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleRejectionReason("");
    setVehicleRejectDialogOpen(true);
  };

  const handleConfirmRejectVehicle = async () => {
    if (!selectedVehicle || !vehicleRejectionReason.trim()) return;

    await verifyVehicleMutation.mutateAsync({
      vehicleId: selectedVehicle.id,
      status: "rejected",
      rejectionReason: vehicleRejectionReason.trim(),
    });

    setVehicleRejectDialogOpen(false);
    setSelectedVehicle(null);
    setVehicleRejectionReason("");
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
        {pendingCharters.map((charter) =>
          isMobile ? (
            <MobileCharterVerificationCard
              key={charter.id}
              charter={charter}
              onApprove={handleApprove}
              onReject={handleRejectClick}
              onApproveVehicle={handleApproveVehicle}
              onRejectVehicle={handleRejectVehicleClick}
            />
          ) : (
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

                {/* Documentación: DNI + Vehículos */}
                <Stack spacing={2} minWidth={300} maxWidth={480}>
                  {/* DNI del conductor */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      DNI del conductor ({(charter as any).userDocuments?.length ?? 0} docs)
                    </Typography>
                    {((charter as any).userDocuments?.length ?? 0) === 0 ? (
                      <Alert severity="warning" sx={{ py: 0.5 }}>Sin documentos de identidad</Alert>
                    ) : (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {(charter as any).userDocuments.map((doc: any) => (
                          <Box key={doc.id} sx={{ position: "relative" }}>
                            <Box
                              component="a"
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={doc.fileUrl}
                                alt={`DNI ${doc.side ?? ""}`}
                                style={{
                                  width: 100,
                                  height: 70,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                  border: `2px solid ${doc.status === DocumentReviewStatus.APPROVED ? "#2e7d32" : doc.status === DocumentReviewStatus.REJECTED ? "#d32f2f" : "#dca621"}`,
                                  cursor: "pointer",
                                }}
                              />
                            </Box>
                            <Chip
                              label={doc.side === "front" ? "Frente" : "Dorso"}
                              size="small"
                              sx={{ position: "absolute", bottom: 2, left: 2, fontSize: 9, height: 16 }}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Vehículos */}
                  {((charter as any).vehicles?.length ?? 0) > 0 ? (
                    ((charter as any).vehicles ?? []).map((vehicle: any, idx: number) => (
                      <Box key={vehicle.id}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5} flexWrap="wrap">
                          <DirectionsCar fontSize="small" color="action" />
                          <Typography variant="subtitle2" color="text.secondary">
                            Vehículo {idx + 1}: {vehicle.plate}
                            {vehicle.alias ? ` (${vehicle.alias})` : ""}
                          </Typography>
                          <Chip
                            label={
                              vehicle.verificationStatus === "verified"
                                ? "Aprobado"
                                : vehicle.verificationStatus === "rejected"
                                ? "Rechazado"
                                : "Pendiente"
                            }
                            size="small"
                            color={vehicle.verificationStatus === "verified" ? "success" : vehicle.verificationStatus === "rejected" ? "error" : "warning"}
                            sx={{ height: 18, fontSize: 10 }}
                          />
                          {vehicle.verificationStatus !== "verified" && (
                            <Stack direction="row" spacing={0.5}>
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                sx={{ fontSize: 11, py: 0, px: 1, minWidth: 0 }}
                                onClick={() => handleApproveVehicle(vehicle)}
                                disabled={verifyVehicleMutation.isPending}
                              >
                                Aprobar
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                sx={{ fontSize: 11, py: 0, px: 1, minWidth: 0 }}
                                onClick={() => handleRejectVehicleClick(vehicle)}
                                disabled={verifyVehicleMutation.isPending}
                              >
                                Rechazar
                              </Button>
                            </Stack>
                          )}
                        </Stack>
                        {(vehicle.documents?.length ?? 0) === 0 ? (
                          <Alert severity="warning" sx={{ py: 0.5 }}>Sin documentos del vehículo</Alert>
                        ) : (
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {(vehicle.documents ?? []).map((doc: any) => (
                              <Box
                                key={doc.id}
                                component="a"
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textDecoration: "none" }}
                              >
                                <img
                                  src={doc.fileUrl}
                                  alt={doc.type}
                                  style={{
                                    width: 80,
                                    height: 60,
                                    objectFit: "cover",
                                    borderRadius: 4,
                                    border: `2px solid ${doc.status === DocumentReviewStatus.APPROVED ? "#2e7d32" : doc.status === DocumentReviewStatus.REJECTED ? "#d32f2f" : "#dca621"}`,
                                    cursor: "pointer",
                                  }}
                                />
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))
                  ) : (
                    <Alert severity="warning" sx={{ py: 0.5 }}>Sin vehículos registrados</Alert>
                  )}
                </Stack>

                {/* Actions — Charter */}
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
          )
        )}
      </Stack>

      {/* Charter Rejection Dialog */}
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

      {/* Vehicle Rejection Dialog */}
      <Dialog
        open={vehicleRejectDialogOpen}
        onClose={() => setVehicleRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Rechazar Vehículo
          {selectedVehicle && (
            <Typography variant="body2" color="text.secondary">
              {selectedVehicle.plate}{selectedVehicle.alias ? ` — ${selectedVehicle.alias}` : ""}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ingresa el motivo del rechazo. Este mensaje será visible para el conductor.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Motivo del rechazo"
            value={vehicleRejectionReason}
            onChange={(e) => setVehicleRejectionReason(e.target.value)}
            placeholder="Ej: Seguro vencido, cédula ilegible, etc."
            error={vehicleRejectionReason.trim() === ""}
            helperText={
              vehicleRejectionReason.trim() === ""
                ? "El motivo es obligatorio"
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVehicleRejectDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmRejectVehicle}
            color="error"
            variant="contained"
            disabled={!vehicleRejectionReason.trim() || verifyVehicleMutation.isPending}
          >
            {verifyVehicleMutation.isPending ? "Rechazando..." : "Confirmar Rechazo"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
