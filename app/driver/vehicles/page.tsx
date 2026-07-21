"use client";

import {
  Add,
  CancelRounded,
  CheckCircleRounded,
  DirectionsCar,
  Edit,
  HourglassTopRounded,
  Upload,
} from "@mui/icons-material";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { VEHICLE_BRANDS } from "@/lib/constants/vehicleBrands";
import {
  useCreateVehicleDocument,
  useToggleVehicleEnabled,
  useUpdateVehicle,
} from "@/lib/hooks/mutations/useVehicleMutations";
import { useMyVehicles } from "@/lib/hooks/queries/useVehicleQueries";
import {
  DocumentReviewStatus,
  VEHICLE_SIZE_LABELS,
  type Vehicle,
  type VehicleDocument,
  VehicleDocumentType,
  VerificationStatus,
} from "@/lib/types/api";
import { uploadToStorage } from "@/lib/upload";

// ─── Shared visual atoms (estilo macOS, alineado con /driver/personal) ───────

type SemColor = "success" | "warning" | "error" | "default";

function StatusPill({ color, label }: { color: SemColor; label: string }) {
  const theme = useTheme();
  const main =
    color === "default"
      ? theme.palette.text.disabled
      : theme.palette[color].main;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.1,
        py: 0.35,
        borderRadius: 999,
        bgcolor: alpha(main, 0.12),
        color: color === "default" ? "text.secondary" : `${color}.dark`,
        fontSize: "0.72rem",
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: main,
          flexShrink: 0,
        }}
      />
      {label}
    </Box>
  );
}

function docColor(status: DocumentReviewStatus): SemColor {
  if (status === DocumentReviewStatus.APPROVED) return "success";
  if (status === DocumentReviewStatus.REJECTED) return "error";
  return "warning";
}

function VehicleDocRow({
  label,
  status,
  onReupload,
}: {
  label: string;
  status: DocumentReviewStatus;
  onReupload?: () => void;
}) {
  const color = docColor(status);
  const Icon =
    status === DocumentReviewStatus.APPROVED
      ? CheckCircleRounded
      : status === DocumentReviewStatus.REJECTED
        ? CancelRounded
        : HourglassTopRounded;
  const statusText =
    status === DocumentReviewStatus.APPROVED
      ? "Aprobado"
      : status === DocumentReviewStatus.REJECTED
        ? "Rechazado"
        : "Pendiente";
  return (
    <Box
      sx={{
        py: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            color: `${color}.main`,
          }}
        >
          <Icon sx={{ fontSize: 16 }} />
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: `${color}.dark` }}
          >
            {statusText}
          </Typography>
        </Box>
        {status === DocumentReviewStatus.REJECTED && onReupload && (
          <Button
            size="small"
            variant="text"
            startIcon={<Upload sx={{ fontSize: 15 }} />}
            onClick={onReupload}
            sx={{ textTransform: "none", py: 0, minWidth: 0 }}
          >
            Re-subir
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ─── Per-vehicle card (hooks called at stable component level) ───────────────

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const toggleMutation = useToggleVehicleEnabled(vehicle.id);
  const updateMutation = useUpdateVehicle(vehicle.id);
  const createDocMutation = useCreateVehicleDocument(vehicle.id);

  const isRejected = vehicle.verificationStatus === VerificationStatus.REJECTED;
  const isVerified = vehicle.verificationStatus === VerificationStatus.VERIFIED;

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editBrand, setEditBrand] = useState(vehicle.brand ?? "");
  const [editModel, setEditModel] = useState(vehicle.model ?? "");
  const [editYear, setEditYear] = useState<string>(
    vehicle.year?.toString() ?? "",
  );
  const [editAlias, setEditAlias] = useState(vehicle.alias ?? "");

  // Re-upload doc dialog state
  const [reuploadDoc, setReuploadDoc] = useState<VehicleDocument | null>(null);
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);
  const [reuploadExpiry, setReuploadExpiry] = useState("");
  const [reuploadUploading, setReuploadUploading] = useState(false);

  const handleToggle = () => {
    if (!isVerified) return;
    toggleMutation.mutate();
  };

  const handleEditSave = async () => {
    const payload: {
      brand?: string;
      model?: string;
      year?: number;
      alias?: string;
    } = {};
    if (editBrand) payload.brand = editBrand;
    if (editModel) payload.model = editModel;
    if (editYear) payload.year = Number(editYear);
    if (editAlias) payload.alias = editAlias;
    await updateMutation.mutateAsync(payload);
    setEditOpen(false);
  };

  const handleReupload = async () => {
    if (!reuploadDoc || !reuploadFile) return;
    setReuploadUploading(true);
    try {
      // La foto es pública; el resto (cédula/seguro/vtv) privado.
      const scope =
        reuploadDoc.type === VehicleDocumentType.FOTO
          ? "vehicle-foto"
          : "vehicle-doc";
      const result = await uploadToStorage(scope, reuploadFile, vehicle.id);
      await createDocMutation.mutateAsync({
        type: reuploadDoc.type,
        fileUrl: result.key, // KEY (bucket privado): se muestra con URL firmada
        ...(reuploadExpiry ? { expiresAt: reuploadExpiry } : {}),
      });
      toast.success("Documento subido");
      setReuploadDoc(null);
      setReuploadFile(null);
      setReuploadExpiry("");
    } catch {
      toast.error("Error al subir el documento");
    } finally {
      setReuploadUploading(false);
    }
  };

  const statusColor = (s: VerificationStatus) => {
    if (s === VerificationStatus.VERIFIED) return "success";
    if (s === VerificationStatus.REJECTED) return "error";
    return "warning";
  };

  const statusLabel = (s: VerificationStatus) => {
    if (s === VerificationStatus.VERIFIED) return "Verificado";
    if (s === VerificationStatus.REJECTED) return "Rechazado";
    return "Pendiente";
  };

  const docTypeLabel: Record<VehicleDocumentType, string> = {
    [VehicleDocumentType.FOTO]: "Foto",
    [VehicleDocumentType.CEDULA]: "Cédula",
    [VehicleDocumentType.SEGURO]: "Seguro",
    [VehicleDocumentType.VTV]: "VTV",
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.2s ease",
          "&:hover": {
            boxShadow:
              "0 2px 4px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.09)",
          },
        }}
      >
        <CardContent sx={{ p: 2.25 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  fontFamily: "monospace",
                  fontSize: "1.2rem",
                  letterSpacing: "0.04em",
                }}
              >
                {vehicle.plate}
              </Typography>
              <Box
                sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 0.75 }}
              >
                <StatusPill
                  color={statusColor(vehicle.verificationStatus)}
                  label={statusLabel(vehicle.verificationStatus)}
                />
                <StatusPill
                  color={vehicle.isEnabled ? "success" : "default"}
                  label={vehicle.isEnabled ? "Disponible" : "No disponible"}
                />
                <StatusPill
                  color="default"
                  label={VEHICLE_SIZE_LABELS[vehicle.size]}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75 }}
              >
                {vehicle.brand || "Sin marca"}{" "}
                {vehicle.model && `- ${vehicle.model}`}
                {vehicle.year && ` (${vehicle.year})`}
              </Typography>
            </Box>

            <Stack alignItems="center" gap={0.5}>
              <Switch
                checked={vehicle.isEnabled}
                onChange={handleToggle}
                disabled={!isVerified || toggleMutation.isPending}
                size="medium"
              />
              {!isVerified && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textAlign: "center", fontSize: "0.7rem", maxWidth: 80 }}
                >
                  Solo si verificado
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Rejection info + Edit button */}
          {isRejected && (
            <Box sx={{ mt: 1.75 }}>
              {vehicle.rejectionReason && (
                <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Motivo del rechazo:
                  </Typography>
                  <Typography variant="body2">
                    {vehicle.rejectionReason}
                  </Typography>
                </Alert>
              )}
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<Edit />}
                sx={{ borderRadius: 2 }}
                onClick={() => {
                  setEditBrand(vehicle.brand ?? "");
                  setEditModel(vehicle.model ?? "");
                  setEditYear(vehicle.year?.toString() ?? "");
                  setEditAlias(vehicle.alias ?? "");
                  setEditOpen(true);
                }}
              >
                Editar vehículo
              </Button>
            </Box>
          )}

          {/* Rejected documents — re-upload en filas */}
          {isRejected && (vehicle.documents?.length ?? 0) > 0 && (
            <Box sx={{ mt: 1.75 }}>
              <Divider sx={{ mb: 1 }} />
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: 0.5 }}
              >
                Documentos
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {(vehicle.documents ?? []).map((doc, i) => (
                  <Box key={doc.id}>
                    {i > 0 && <Divider sx={{ opacity: 0.5 }} />}
                    <VehicleDocRow
                      label={docTypeLabel[doc.type] ?? doc.type}
                      status={doc.status}
                      onReupload={() => {
                        setReuploadDoc(doc);
                        setReuploadFile(null);
                        setReuploadExpiry("");
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog (only for REJECTED vehicles) */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar vehículo — {vehicle.plate}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning" sx={{ fontSize: "0.8rem" }}>
              Al guardar, el vehículo volverá a estado{" "}
              <strong>Pendiente</strong> para re-verificación. La patente no
              puede modificarse.
            </Alert>
            <FormControl fullWidth size="small">
              <InputLabel>Marca</InputLabel>
              <Select
                value={editBrand}
                label="Marca"
                onChange={(e) => setEditBrand(e.target.value)}
              >
                <MenuItem value="">Sin especificar</MenuItem>
                {VEHICLE_BRANDS.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Modelo"
              size="small"
              value={editModel}
              onChange={(e) => setEditModel(e.target.value)}
              fullWidth
            />
            <TextField
              label="Año"
              size="small"
              type="number"
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
              inputProps={{ min: 1980, max: new Date().getFullYear() + 1 }}
              fullWidth
            />
            <TextField
              label="Alias (opcional)"
              size="small"
              value={editAlias}
              onChange={(e) => setEditAlias(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Re-upload Document Dialog */}
      <Dialog
        open={!!reuploadDoc}
        onClose={() => setReuploadDoc(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Re-subir documento —{" "}
          {reuploadDoc
            ? (docTypeLabel[reuploadDoc.type] ?? reuploadDoc.type)
            : ""}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              sx={{ justifyContent: "flex-start", textTransform: "none" }}
            >
              {reuploadFile ? reuploadFile.name : "Seleccionar archivo"}
              <input
                type="file"
                accept="image/*,application/pdf"
                hidden
                onChange={(e) => setReuploadFile(e.target.files?.[0] ?? null)}
              />
            </Button>
            {(reuploadDoc?.type === VehicleDocumentType.SEGURO ||
              reuploadDoc?.type === VehicleDocumentType.VTV) && (
              <TextField
                label="Fecha de vencimiento (opcional)"
                size="small"
                type="date"
                value={reuploadExpiry}
                onChange={(e) => setReuploadExpiry(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReuploadDoc(null)}>Cancelar</Button>
          <Button
            onClick={handleReupload}
            variant="contained"
            disabled={
              !reuploadFile || reuploadUploading || createDocMutation.isPending
            }
          >
            {reuploadUploading || createDocMutation.isPending
              ? "Subiendo..."
              : "Subir"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VehiclesPage() {
  const router = useRouter();
  const { data: vehicles = [], isLoading } = useMyVehicles();

  if (isLoading) {
    return (
      <AuthGuard message="Por favor inicia sesión">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </AuthGuard>
    );
  }

  const canAddMore =
    vehicles.length === 0 ||
    (vehicles.length < 2 &&
      vehicles.every(
        (v) => v.verificationStatus === VerificationStatus.VERIFIED,
      ));

  return (
    <AuthGuard message="Por favor inicia sesión">
      <PageTransition>
        <Box
          sx={{
            bgcolor: "background.default",
            minHeight: "calc(100vh - 64px)",
            py: 4,
            pb: { xs: 12, md: 4 },
          }}
        >
          <Container maxWidth="md">
            <Box mb={4}>
              <Typography
                variant="h4"
                fontWeight={700}
                color="primary.main"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <DirectionsCar /> Mis Vehículos
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestiona tu flota de vehículos disponibles para operación
              </Typography>
            </Box>

            {vehicles.length === 0 ? (
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <DirectionsCar
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sin vehículos registrados
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Registra tu primer vehículo para comenzar a operar
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => router.push("/driver/onboarding/vehicle")}
                >
                  Registrar primer vehículo
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}

                {canAddMore && (
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => router.push("/driver/onboarding/vehicle")}
                    >
                      Agregar vehículo
                    </Button>
                  </Box>
                )}
                {!canAddMore && vehicles.length < 2 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Tu vehículo está en revisión. Podrás agregar otro una vez
                    que sea verificado.
                  </Alert>
                )}
              </Box>
            )}
          </Container>
        </Box>
        <BottomNavbar />
      </PageTransition>
    </AuthGuard>
  );
}
