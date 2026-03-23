"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Add, DirectionsCar, Edit, Upload } from "@mui/icons-material";
import { useMyVehicles } from "@/lib/hooks/queries/useVehicleQueries";
import {
  useCreateVehicleDocument,
  useToggleVehicleEnabled,
  useUpdateVehicle,
} from "@/lib/hooks/mutations/useVehicleMutations";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { PageTransition } from "@/components/ui/PageTransition";
import {
  DocumentReviewStatus,
  type Vehicle,
  type VehicleDocument,
  VerificationStatus,
  VehicleDocumentType,
} from "@/lib/types/api";
import { VEHICLE_BRANDS } from "@/lib/constants/vehicleBrands";

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
  const [editYear, setEditYear] = useState<string>(vehicle.year?.toString() ?? "");
  const [editAlias, setEditAlias] = useState(vehicle.alias ?? "");

  // Re-upload doc dialog state
  const [reuploadDoc, setReuploadDoc] = useState<VehicleDocument | null>(null);
  const [reuploadUrl, setReuploadUrl] = useState("");
  const [reuploadExpiry, setReuploadExpiry] = useState("");

  const handleToggle = () => {
    if (!isVerified) return;
    toggleMutation.mutate();
  };

  const handleEditSave = async () => {
    const payload: { brand?: string; model?: string; year?: number; alias?: string } = {};
    if (editBrand) payload.brand = editBrand;
    if (editModel) payload.model = editModel;
    if (editYear) payload.year = Number(editYear);
    if (editAlias) payload.alias = editAlias;
    await updateMutation.mutateAsync(payload);
    setEditOpen(false);
  };

  const handleReupload = async () => {
    if (!reuploadDoc || !reuploadUrl.trim()) return;
    await createDocMutation.mutateAsync({
      type: reuploadDoc.type,
      fileUrl: reuploadUrl.trim(),
      ...(reuploadExpiry ? { expiresAt: reuploadExpiry } : {}),
    });
    setReuploadDoc(null);
    setReuploadUrl("");
    setReuploadExpiry("");
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
      <Card variant="outlined">
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ fontFamily: "monospace", fontSize: "1.25rem", mb: 1 }}
              >
                {vehicle.plate}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                <Chip
                  label={statusLabel(vehicle.verificationStatus)}
                  color={statusColor(vehicle.verificationStatus)}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={vehicle.isEnabled ? "Disponible" : "No disponible"}
                  color={vehicle.isEnabled ? "success" : "default"}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {vehicle.brand || "Sin marca"} {vehicle.model && `- ${vehicle.model}`}
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
            <Box>
              {vehicle.rejectionReason && (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Motivo del rechazo:
                  </Typography>
                  <Typography variant="body2">{vehicle.rejectionReason}</Typography>
                </Alert>
              )}
              <Button
                variant="outlined"
                color="warning"
                size="small"
                startIcon={<Edit />}
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

          {/* Rejected documents — re-upload buttons */}
          {isRejected && (vehicle.documents?.length ?? 0) > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                Documentos
              </Typography>
              <Stack spacing={0.75}>
                {(vehicle.documents ?? []).map((doc) => (
                  <Stack key={doc.id} direction="row" alignItems="center" gap={1} flexWrap="wrap">
                    <Chip
                      label={docTypeLabel[doc.type] ?? doc.type}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={
                        doc.status === DocumentReviewStatus.APPROVED
                          ? "Aprobado"
                          : doc.status === DocumentReviewStatus.REJECTED
                          ? "Rechazado"
                          : "Pendiente"
                      }
                      size="small"
                      color={
                        doc.status === DocumentReviewStatus.APPROVED
                          ? "success"
                          : doc.status === DocumentReviewStatus.REJECTED
                          ? "error"
                          : "warning"
                      }
                    />
                    {doc.status === DocumentReviewStatus.REJECTED && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        startIcon={<Upload />}
                        sx={{ fontSize: "0.7rem", py: 0.25 }}
                        onClick={() => {
                          setReuploadDoc(doc);
                          setReuploadUrl("");
                          setReuploadExpiry("");
                        }}
                      >
                        Re-subir
                      </Button>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog (only for REJECTED vehicles) */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar vehículo — {vehicle.plate}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning" sx={{ fontSize: "0.8rem" }}>
              Al guardar, el vehículo volverá a estado <strong>Pendiente</strong> para re-verificación. La patente no puede modificarse.
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
                  <MenuItem key={b} value={b}>{b}</MenuItem>
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
      <Dialog open={!!reuploadDoc} onClose={() => setReuploadDoc(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Re-subir documento — {reuploadDoc ? (docTypeLabel[reuploadDoc.type] ?? reuploadDoc.type) : ""}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="URL del nuevo documento"
              size="small"
              value={reuploadUrl}
              onChange={(e) => setReuploadUrl(e.target.value)}
              placeholder="https://..."
              fullWidth
            />
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
            disabled={!reuploadUrl.trim() || createDocMutation.isPending}
          >
            {createDocMutation.isPending ? "Subiendo..." : "Subir"}
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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <CircularProgress />
        </Box>
      </AuthGuard>
    );
  }

  const canAddMore =
    vehicles.length === 0 ||
    (vehicles.length < 2 &&
      vehicles.every((v) => v.verificationStatus === VerificationStatus.VERIFIED));

  return (
    <AuthGuard message="Por favor inicia sesión">
      <PageTransition>
        <AuthNavbar />
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
              <Paper elevation={2} sx={{ p: 4, textAlign: "center", borderRadius: 2, bgcolor: "action.hover" }}>
                <DirectionsCar sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sin vehículos registrados
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
                    Tu vehículo está en revisión. Podrás agregar otro una vez que sea verificado.
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
