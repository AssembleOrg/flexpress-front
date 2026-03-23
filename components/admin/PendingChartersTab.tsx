"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Cancel as RejectIcon,
  CheckCircle as ApproveIcon,
  DirectionsCar,
  Email as EmailIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { usePendingCharters, usePendingVehicles } from "@/lib/hooks/queries/useAdminQueries";
import { useVerifyCharter, useVerifyVehicle } from "@/lib/hooks/mutations/useAdminMutations";
import type { PendingCharterReviewItem, Vehicle } from "@/lib/types/api";
import { DocumentReviewStatus, VerificationStatus } from "@/lib/types/api";
import { MobileCharterVerificationCard } from "./mobile/MobileCharterVerificationCard";
import { useTheme, useMediaQuery } from "@mui/material";

// ─── Doc type labels ──────────────────────────────────────────────────────────
const DOC_TYPE_LABEL: Record<string, string> = {
  foto: "Foto",
  cedula: "Cédula",
  seguro: "Seguro",
  vtv: "VTV",
  front: "Frente",
  back: "Dorso",
};

function docStatusColor(status: DocumentReviewStatus) {
  if (status === DocumentReviewStatus.APPROVED) return "#2e7d32";
  if (status === DocumentReviewStatus.REJECTED) return "#d32f2f";
  return "#dca621";
}

// ─── Vehicle section inside accordion ────────────────────────────────────────
interface VehicleSectionProps {
  vehicle: Vehicle;
  index: number;
  onApprove: (v: Vehicle) => void;
  onReject: (v: Vehicle) => void;
  isPending: boolean;
}

function VehicleSection({ vehicle, index, onApprove, onReject, isPending }: VehicleSectionProps) {
  const isVerified = vehicle.verificationStatus === VerificationStatus.VERIFIED;
  const isRejected = vehicle.verificationStatus === VerificationStatus.REJECTED;

  return (
    <Box sx={{ mt: index > 0 ? 2 : 0 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={1} flexWrap="wrap">
        <DirectionsCar fontSize="small" color="action" />
        <Typography variant="subtitle2" fontWeight={600}>
          Vehículo {index + 1}: {vehicle.plate}
          {vehicle.brand ? ` — ${vehicle.brand}` : ""}
          {vehicle.model ? ` ${vehicle.model}` : ""}
          {vehicle.alias ? ` (${vehicle.alias})` : ""}
        </Typography>
        <Chip
          label={
            isVerified ? "Aprobado" : isRejected ? "Rechazado" : "Pendiente"
          }
          size="small"
          color={isVerified ? "success" : isRejected ? "error" : "warning"}
          sx={{ height: 20, fontSize: "0.7rem" }}
        />
      </Stack>

      {/* Vehicle docs grid */}
      {(vehicle.documents?.length ?? 0) === 0 ? (
        <Alert severity="warning" sx={{ py: 0.5, mb: 1 }}>Sin documentos del vehículo</Alert>
      ) : (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 1.5 }}>
          {(vehicle.documents ?? []).map((doc) => (
            <Tooltip key={doc.id} title={DOC_TYPE_LABEL[doc.type] ?? doc.type}>
              <Box sx={{ position: "relative" }}>
                <Box
                  component="a"
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: "block", textDecoration: "none" }}
                >
                  <img
                    src={doc.fileUrl}
                    alt={doc.type}
                    style={{
                      width: 100,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: `2px solid ${docStatusColor(doc.status)}`,
                      cursor: "pointer",
                      display: "block",
                    }}
                  />
                </Box>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ position: "absolute", bottom: 4, left: 4 }}
                >
                  <Chip
                    label={DOC_TYPE_LABEL[doc.type] ?? doc.type}
                    size="small"
                    sx={{ height: 16, fontSize: "0.6rem", bgcolor: "rgba(0,0,0,0.55)", color: "#fff" }}
                  />
                </Stack>
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}

      {/* Vehicle action buttons */}
      {!isVerified && (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() => onApprove(vehicle)}
            disabled={isPending}
            sx={{ fontSize: "0.75rem", bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
          >
            Aprobar vehículo
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() => onReject(vehicle)}
            disabled={isPending}
            sx={{ fontSize: "0.75rem" }}
          >
            Rechazar
          </Button>
        </Stack>
      )}
    </Box>
  );
}

// ─── Standalone vehicle card (verified charter, pending vehicle) ──────────────
interface StandaloneVehicleCardProps {
  vehicle: Vehicle;
  onApprove: (v: Vehicle) => void;
  onReject: (v: Vehicle) => void;
  isPending: boolean;
}

function StandaloneVehicleCard({ vehicle, onApprove, onReject, isPending }: StandaloneVehicleCardProps) {
  const docCount = vehicle.documents?.length ?? 0;

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        "&:hover": { borderColor: "#dca621" },
        transition: "border-color 0.2s",
      }}
    >
      <Accordion disableGutters elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5, minHeight: 56 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" flex={1} mr={1}>
            <DirectionsCar fontSize="small" color="action" />
            <Typography variant="subtitle1" fontWeight={700}>
              {vehicle.plate}
              {vehicle.brand ? ` — ${vehicle.brand}` : ""}
              {vehicle.model ? ` ${vehicle.model}` : ""}
              {vehicle.year ? ` (${vehicle.year})` : ""}
            </Typography>
            <Chip label="Pendiente" size="small" color="warning" sx={{ fontSize: "0.65rem", height: 20 }} />
            {vehicle.charter && (
              <>
                <PersonIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>{vehicle.charter.name}</strong>
                </Typography>
                <Chip label="Verificado ✓" size="small" color="success" sx={{ fontSize: "0.65rem", height: 20 }} />
              </>
            )}
            <Typography variant="caption" color="text.secondary">
              {docCount} doc{docCount !== 1 ? "s" : ""}
            </Typography>
          </Stack>
        </AccordionSummary>

        <AccordionDetails sx={{ px: 2.5, pb: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
          {docCount === 0 ? (
            <Alert severity="warning" sx={{ py: 0.5, mb: 2 }}>Sin documentos del vehículo</Alert>
          ) : (
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
              {(vehicle.documents ?? []).map((doc) => (
                <Tooltip key={doc.id} title={DOC_TYPE_LABEL[doc.type] ?? doc.type}>
                  <Box sx={{ position: "relative" }}>
                    <Box
                      component="a"
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: "block", textDecoration: "none" }}
                    >
                      <img
                        src={doc.fileUrl}
                        alt={doc.type}
                        style={{
                          width: 100,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: `2px solid ${docStatusColor(doc.status)}`,
                          cursor: "pointer",
                          display: "block",
                        }}
                      />
                    </Box>
                    <Chip
                      label={DOC_TYPE_LABEL[doc.type] ?? doc.type}
                      size="small"
                      sx={{ position: "absolute", bottom: 4, left: 4, height: 16, fontSize: "0.6rem", bgcolor: "rgba(0,0,0,0.55)", color: "#fff" }}
                    />
                  </Box>
                </Tooltip>
              ))}
            </Box>
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="error"
              startIcon={<RejectIcon />}
              onClick={() => onReject(vehicle)}
              disabled={isPending}
              size="small"
            >
              Rechazar
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<ApproveIcon />}
              onClick={() => onApprove(vehicle)}
              disabled={isPending}
              size="small"
              sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
            >
              Aprobar vehículo
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}

// ─── Desktop charter card ─────────────────────────────────────────────────────
interface DesktopCharterCardProps {
  charter: PendingCharterReviewItem;
  onApprove: (c: PendingCharterReviewItem) => void;
  onReject: (c: PendingCharterReviewItem) => void;
  onApproveVehicle: (v: Vehicle) => void;
  onRejectVehicle: (v: Vehicle) => void;
  verifyPending: boolean;
  verifyVehiclePending: boolean;
}

function DesktopCharterCard({
  charter,
  onApprove,
  onReject,
  onApproveVehicle,
  onRejectVehicle,
  verifyPending,
  verifyVehiclePending,
}: DesktopCharterCardProps) {
  const pendingVehicles = (charter.vehicles ?? []).filter(
    (v) => v.verificationStatus !== VerificationStatus.VERIFIED,
  );

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        "&:hover": { borderColor: "#dca621" },
        transition: "border-color 0.2s",
      }}
    >
      {/* Card header — charter identity */}
      <Box sx={{ p: 2.5, pb: 1.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            src={charter.avatar || undefined}
            sx={{ width: 56, height: 56, bgcolor: "#dca621", flexShrink: 0 }}
          >
            {charter.name?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" mb={0.5}>
              <Typography variant="h6" fontWeight={700}>
                {charter.name}
              </Typography>
              {pendingVehicles.length > 0 && (
                <Chip
                  label={`${pendingVehicles.length} vehículo${pendingVehicles.length > 1 ? "s" : ""} pendiente${pendingVehicles.length > 1 ? "s" : ""}`}
                  size="small"
                  color="warning"
                  sx={{ fontSize: "0.7rem" }}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <EmailIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">{charter.email}</Typography>
              </Stack>
              {charter.number && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">{charter.number}</Typography>
                </Stack>
              )}
              {charter.originAddress && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">{charter.originAddress}</Typography>
                </Stack>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              Registrado:{" "}
              {new Date(charter.createdAt).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Box>

          {/* Charter-level actions */}
          <Stack direction="row" spacing={1} flexShrink={0}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<RejectIcon />}
              onClick={() => onReject(charter)}
              disabled={verifyPending}
              size="small"
            >
              Rechazar conductor
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<ApproveIcon />}
              onClick={() => onApprove(charter)}
              disabled={verifyPending}
              size="small"
              sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
            >
              Aprobar conductor ✓
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Expandable docs section */}
      <Accordion disableGutters elevation={0} sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2.5, minHeight: 44 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" fontWeight={600}>
              DNI del conductor ({charter.userDocuments?.length ?? 0} docs)
            </Typography>
            <DirectionsCar fontSize="small" color="action" />
            <Typography variant="body2" fontWeight={600}>
              {charter.vehicles?.length ?? 0} vehículo(s)
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
          {/* DNI docs */}
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Documentos de identidad
          </Typography>
          {(charter.userDocuments?.length ?? 0) === 0 ? (
            <Alert severity="warning" sx={{ py: 0.5, mb: 2 }}>Sin documentos de identidad</Alert>
          ) : (
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
              {(charter.userDocuments ?? []).map((doc) => (
                <Tooltip key={doc.id} title={`DNI ${DOC_TYPE_LABEL[doc.side ?? ""] ?? doc.side ?? ""}`}>
                  <Box sx={{ position: "relative" }}>
                    <Box
                      component="a"
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: "block", textDecoration: "none" }}
                    >
                      <img
                        src={doc.fileUrl}
                        alt={`DNI ${doc.side ?? ""}`}
                        style={{
                          width: 120,
                          height: 84,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: `2px solid ${docStatusColor(doc.status)}`,
                          cursor: "pointer",
                          display: "block",
                        }}
                      />
                    </Box>
                    <Chip
                      label={DOC_TYPE_LABEL[doc.side ?? ""] ?? doc.side}
                      size="small"
                      sx={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        height: 16,
                        fontSize: "0.6rem",
                        bgcolor: "rgba(0,0,0,0.55)",
                        color: "#fff",
                      }}
                    />
                  </Box>
                </Tooltip>
              ))}
            </Box>
          )}

          {/* Vehicles */}
          {(charter.vehicles?.length ?? 0) > 0 ? (
            <>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
                Vehículos registrados
              </Typography>
              <Stack spacing={2.5}>
                {(charter.vehicles ?? []).map((vehicle, idx) => (
                  <VehicleSection
                    key={vehicle.id}
                    vehicle={vehicle}
                    index={idx}
                    onApprove={onApproveVehicle}
                    onReject={onRejectVehicle}
                    isPending={verifyVehiclePending}
                  />
                ))}
              </Stack>
            </>
          ) : (
            <>
              <Divider sx={{ mb: 2 }} />
              <Alert severity="warning" sx={{ py: 0.5 }}>Sin vehículos registrados</Alert>
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}

// ─── Main tab component ───────────────────────────────────────────────────────

export function PendingChartersTab() {
  const { data: pendingCharters = [], isLoading, error } = usePendingCharters();
  const { data: pendingVehicles = [] } = usePendingVehicles();
  const verifyMutation = useVerifyCharter();
  const verifyVehicleMutation = useVerifyVehicle();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Charter reject dialog
  const [selectedCharter, setSelectedCharter] = useState<PendingCharterReviewItem | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Charter approve confirmation dialog
  const [approveCharter, setApproveCharter] = useState<PendingCharterReviewItem | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [isApprovingAll, setIsApprovingAll] = useState(false);

  // Vehicle reject dialog
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleRejectDialogOpen, setVehicleRejectDialogOpen] = useState(false);
  const [vehicleRejectionReason, setVehicleRejectionReason] = useState("");

  // Vehicle approve confirmation dialog
  const [approveVehicle, setApproveVehicle] = useState<Vehicle | null>(null);
  const [approveVehicleDialogOpen, setApproveVehicleDialogOpen] = useState(false);

  const handleApproveClick = (charter: PendingCharterReviewItem) => {
    setApproveCharter(charter);
    setApproveDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!approveCharter) return;
    setIsApprovingAll(true);
    try {
      await verifyMutation.mutateAsync({ charterId: approveCharter.id, status: "verified" });
      const pendingVehicles = (approveCharter.vehicles ?? []).filter(
        (v) => v.verificationStatus !== VerificationStatus.VERIFIED,
      );
      for (const v of pendingVehicles) {
        await verifyVehicleMutation.mutateAsync({ vehicleId: v.id, status: "verified" });
      }
    } finally {
      setIsApprovingAll(false);
      setApproveDialogOpen(false);
      setApproveCharter(null);
    }
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

  const handleApproveVehicleClick = (vehicle: Vehicle) => {
    setApproveVehicle(vehicle);
    setApproveVehicleDialogOpen(true);
  };

  const handleConfirmApproveVehicle = async () => {
    if (!approveVehicle) return;
    await verifyVehicleMutation.mutateAsync({ vehicleId: approveVehicle.id, status: "verified" });
    setApproveVehicleDialogOpen(false);
    setApproveVehicle(null);
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

  if (pendingCharters.length === 0 && pendingVehicles.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          No hay charters pendientes de verificación
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Cuando un nuevo conductor se registre, aparecerá aquí para su aprobación.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Section 1: New charters pending verification */}
      {pendingCharters.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={700} mb={3}>
            Conductores nuevos pendientes ({pendingCharters.length})
          </Typography>
          <Stack spacing={2}>
            {pendingCharters.map((charter) =>
              isMobile ? (
                <MobileCharterVerificationCard
                  key={charter.id}
                  charter={charter}
                  onApprove={handleApproveClick}
                  onReject={handleRejectClick}
                  onApproveVehicle={handleApproveVehicleClick}
                  onRejectVehicle={handleRejectVehicleClick}
                />
              ) : (
                <DesktopCharterCard
                  key={charter.id}
                  charter={charter}
                  onApprove={handleApproveClick}
                  onReject={handleRejectClick}
                  onApproveVehicle={handleApproveVehicleClick}
                  onRejectVehicle={handleRejectVehicleClick}
                  verifyPending={verifyMutation.isPending}
                  verifyVehiclePending={verifyVehicleMutation.isPending}
                />
              ),
            )}
          </Stack>
        </>
      )}

      {/* Section 2: Pending vehicles from already-verified charters */}
      {pendingVehicles.length > 0 && (
        <Box mt={pendingCharters.length > 0 ? 5 : 0}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" fontWeight={700} mb={3}>
            Vehículos pendientes de conductores verificados ({pendingVehicles.length})
          </Typography>
          <Stack spacing={2}>
            {pendingVehicles.map((vehicle) => (
              <StandaloneVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onApprove={handleApproveVehicleClick}
                onReject={handleRejectVehicleClick}
                isPending={verifyVehicleMutation.isPending}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Approve Charter Confirmation */}
      <Dialog open={approveDialogOpen} onClose={() => !isApprovingAll && setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar aprobación del conductor</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            ¿Aprobar al conductor <strong>{approveCharter?.name}</strong>? Podrá operar en la plataforma.
          </Typography>

          {/* Vehicle list */}
          {(approveCharter?.vehicles?.length ?? 0) > 0 ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Vehículos del conductor:
              </Typography>
              <Stack spacing={0.75} mb={1.5}>
                {(approveCharter?.vehicles ?? []).map((v) => {
                  const isVerified = v.verificationStatus === VerificationStatus.VERIFIED;
                  const isRejected = v.verificationStatus === VerificationStatus.REJECTED;
                  return (
                    <Stack key={v.id} direction="row" spacing={1} alignItems="center">
                      <DirectionsCar fontSize="small" color="action" />
                      <Typography variant="body2" flex={1}>
                        {v.plate}{v.brand ? ` — ${v.brand}` : ""}{v.model ? ` ${v.model}` : ""}
                      </Typography>
                      <Chip
                        label={isVerified ? "Aprobado" : isRejected ? "Rechazado" : "Pendiente"}
                        size="small"
                        color={isVerified ? "success" : isRejected ? "error" : "warning"}
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    </Stack>
                  );
                })}
              </Stack>
              {(() => {
                const pendingCount = (approveCharter?.vehicles ?? []).filter(
                  (v) => v.verificationStatus !== VerificationStatus.VERIFIED,
                ).length;
                return pendingCount > 0 ? (
                  <Alert severity="warning" sx={{ py: 0.5 }}>
                    Se aprobará el conductor y {pendingCount} vehículo{pendingCount > 1 ? "s" : ""} pendiente{pendingCount > 1 ? "s" : ""}.
                  </Alert>
                ) : (
                  <Alert severity="success" sx={{ py: 0.5 }}>
                    No hay vehículos pendientes — solo se aprobará el conductor.
                  </Alert>
                );
              })()}
            </Box>
          ) : (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              Sin vehículos registrados — solo se aprobará el conductor.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)} disabled={isApprovingAll}>Cancelar</Button>
          <Button
            onClick={handleConfirmApprove}
            variant="contained"
            color="success"
            disabled={isApprovingAll}
            sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
          >
            {isApprovingAll ? "Aprobando..." : "Aprobar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Charter Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rechazar conductor — {selectedCharter?.name}</DialogTitle>
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
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Ej: Documentación incompleta, imagen ilegible, etc."
            error={rejectionReason.trim() === ""}
            helperText={rejectionReason.trim() === "" ? "El motivo es obligatorio" : ""}
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

      {/* Approve Vehicle Confirmation */}
      <Dialog open={approveVehicleDialogOpen} onClose={() => setApproveVehicleDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar aprobación de vehículo</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Aprobar el vehículo <strong>{approveVehicle?.plate}</strong>
            {approveVehicle?.brand ? ` — ${approveVehicle.brand}` : ""}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveVehicleDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmApproveVehicle}
            variant="contained"
            color="success"
            disabled={verifyVehicleMutation.isPending}
            sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
          >
            {verifyVehicleMutation.isPending ? "Aprobando..." : "Aprobar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Vehicle Dialog */}
      <Dialog
        open={vehicleRejectDialogOpen}
        onClose={() => setVehicleRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Rechazar vehículo — {selectedVehicle?.plate}
          {selectedVehicle?.alias ? ` (${selectedVehicle.alias})` : ""}
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
            helperText={vehicleRejectionReason.trim() === "" ? "El motivo es obligatorio" : ""}
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
