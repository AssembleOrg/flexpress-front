"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Alert,
  Avatar,
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
  IconButton,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Add, CheckCircle, Delete, Edit, Group, Person } from "@mui/icons-material";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { PageTransition } from "@/components/ui/PageTransition";
import {
  useMyDrivers,
  useMyHelpers,
} from "@/lib/hooks/queries/useCharterPersonnelQueries";
import {
  useCreateDriver,
  useUpdateDriver,
  useToggleDriverEnabled,
  useDeleteDriver,
  useUploadDriverDocument,
  useCreateHelper,
  useUpdateHelper,
  useToggleHelperEnabled,
  useDeleteHelper,
  useUploadHelperDocument,
} from "@/lib/hooks/mutations/useCharterPersonnelMutations";
import { uploadFiles } from "@/lib/uploadthing";
import {
  CharterDriverDocumentType,
  CharterHelperDocumentType,
  DocumentReviewStatus,
  DocumentSide,
  VerificationStatus,
  type CharterDriver,
  type CharterDriverDocument,
  type CharterHelper,
  type CharterHelperDocument,
} from "@/lib/types/api";

const MAX = 2;

function StatusChip({ status }: { status: VerificationStatus }) {
  const color =
    status === VerificationStatus.VERIFIED
      ? "success"
      : status === VerificationStatus.REJECTED
        ? "error"
        : "warning";
  const label =
    status === VerificationStatus.VERIFIED
      ? "Verificado"
      : status === VerificationStatus.REJECTED
        ? "Rechazado"
        : "Pendiente";
  return <Chip label={label} color={color} size="small" variant="outlined" />;
}

function DocStatusChip({ status }: { status: DocumentReviewStatus }) {
  const color =
    status === DocumentReviewStatus.APPROVED
      ? "success"
      : status === DocumentReviewStatus.REJECTED
        ? "error"
        : "warning";
  const label =
    status === DocumentReviewStatus.APPROVED
      ? "Aprobado"
      : status === DocumentReviewStatus.REJECTED
        ? "Rechazado"
        : "Pendiente";
  return <Chip label={label} color={color} size="small" />;
}

// ─── Driver Card ─────────────────────────────────────────────────────────────

function DriverCard({ driver }: { driver: CharterDriver }) {
  const update = useUpdateDriver(driver.id);
  const toggle = useToggleDriverEnabled(driver.id);
  const remove = useDeleteDriver(driver.id);
  const upload = useUploadDriverDocument(driver.id);

  const isRejected = driver.verificationStatus === VerificationStatus.REJECTED;
  const isVerified = driver.verificationStatus === VerificationStatus.VERIFIED;

  const [editOpen, setEditOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(driver.firstName);
  const [editLastName, setEditLastName] = useState(driver.lastName);
  const [editPhone, setEditPhone] = useState(driver.phone ?? "");

  const docTypeLabel = (type: CharterDriverDocumentType, side?: DocumentSide | null) => {
    if (type === CharterDriverDocumentType.DNI) {
      return `DNI ${side === DocumentSide.BACK ? "(dorso)" : "(frente)"}`;
    }
    return "Licencia";
  };

  const docs = driver.documents ?? [];
  const hasDniFront = docs.some(
    (d) => d.type === CharterDriverDocumentType.DNI && d.side === DocumentSide.FRONT && !d.rejectionReason,
  );
  const hasDniBack = docs.some(
    (d) => d.type === CharterDriverDocumentType.DNI && d.side === DocumentSide.BACK && !d.rejectionReason,
  );
  const hasLicense = docs.some((d) => d.type === CharterDriverDocumentType.LICENSE && !d.rejectionReason);

  const uploadDoc = async (
    type: CharterDriverDocumentType,
    side: DocumentSide | undefined,
    file: File,
  ) => {
    const [result] = await uploadFiles("personnelDocUploader", { files: [file] });
    await upload.mutateAsync({
      type,
      side,
      fileUrl: result.url,
    });
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}>
            <Avatar src={driver.photoUrl ?? undefined} sx={{ width: 56, height: 56 }}>
              {driver.firstName[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {driver.firstName} {driver.lastName}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                <StatusChip status={driver.verificationStatus} />
                <Chip
                  label={driver.isEnabled ? "Disponible" : "No disponible"}
                  color={driver.isEnabled ? "success" : "default"}
                  size="small"
                  variant="outlined"
                />
              </Box>
              {driver.phone && (
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  {driver.phone}
                </Typography>
              )}
            </Box>
            <Stack alignItems="center">
              <Switch
                checked={driver.isEnabled}
                onChange={() => toggle.mutate()}
                disabled={!isVerified || toggle.isPending}
                size="small"
              />
              <IconButton
                color="error"
                onClick={() => {
                  if (confirm(`¿Eliminar a ${driver.firstName}?`)) remove.mutate();
                }}
                disabled={remove.isPending}
                size="small"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {isRejected && driver.rejectionReason && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              <Typography variant="caption" fontWeight={600}>
                Motivo del rechazo:
              </Typography>
              <Typography variant="body2">{driver.rejectionReason}</Typography>
            </Alert>
          )}

          {isRejected && (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              startIcon={<Edit />}
              onClick={() => setEditOpen(true)}
              sx={{ mb: 1.5 }}
            >
              Editar datos
            </Button>
          )}

          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
            Documentos
          </Typography>
          <Stack spacing={1}>
            {docs.map((doc) => (
              <Box
                key={doc.id}
                sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
              >
                <Chip label={docTypeLabel(doc.type, doc.side)} size="small" variant="outlined" />
                <DocStatusChip status={doc.status} />
                {doc.status === DocumentReviewStatus.REJECTED && doc.rejectionReason && (
                  <Typography variant="caption" color="error.dark">
                    {doc.rejectionReason}
                  </Typography>
                )}
              </Box>
            ))}

            {!hasDniFront && (
              <DocUploadButton
                label="Subir DNI (frente)"
                onUpload={(f) => uploadDoc(CharterDriverDocumentType.DNI, DocumentSide.FRONT, f)}
              />
            )}
            {!hasDniBack && (
              <DocUploadButton
                label="Subir DNI (dorso)"
                onUpload={(f) => uploadDoc(CharterDriverDocumentType.DNI, DocumentSide.BACK, f)}
              />
            )}
            {!hasLicense && (
              <DocUploadButton
                label="Subir Licencia"
                onUpload={(f) => uploadDoc(CharterDriverDocumentType.LICENSE, undefined, f)}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar conductor</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning" sx={{ fontSize: "0.8rem" }}>
              Al guardar, el conductor volverá a estado <strong>Pendiente</strong>.
            </Alert>
            <TextField
              label="Nombre"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Apellido"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Teléfono"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              size="small"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={update.isPending}
            onClick={async () => {
              await update.mutateAsync({
                firstName: editFirstName,
                lastName: editLastName,
                phone: editPhone || undefined,
              });
              setEditOpen(false);
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Helper Card ─────────────────────────────────────────────────────────────

function HelperCard({ helper }: { helper: CharterHelper }) {
  const update = useUpdateHelper(helper.id);
  const toggle = useToggleHelperEnabled(helper.id);
  const remove = useDeleteHelper(helper.id);
  const upload = useUploadHelperDocument(helper.id);

  const isRejected = helper.verificationStatus === VerificationStatus.REJECTED;
  const isVerified = helper.verificationStatus === VerificationStatus.VERIFIED;

  const [editOpen, setEditOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(helper.firstName);
  const [editLastName, setEditLastName] = useState(helper.lastName);

  const docs = helper.documents ?? [];
  const hasFront = docs.some((d) => d.side === DocumentSide.FRONT && !d.rejectionReason);
  const hasBack = docs.some((d) => d.side === DocumentSide.BACK && !d.rejectionReason);

  const uploadDoc = async (side: DocumentSide, file: File) => {
    const [result] = await uploadFiles("personnelDocUploader", { files: [file] });
    await upload.mutateAsync({
      type: CharterHelperDocumentType.DNI,
      side,
      fileUrl: result.url,
    });
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}>
            <Avatar src={helper.photoUrl ?? undefined} sx={{ width: 56, height: 56 }}>
              {helper.firstName[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {helper.firstName} {helper.lastName}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                <StatusChip status={helper.verificationStatus} />
                <Chip
                  label={helper.isEnabled ? "Disponible" : "No disponible"}
                  color={helper.isEnabled ? "success" : "default"}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
            <Stack alignItems="center">
              <Switch
                checked={helper.isEnabled}
                onChange={() => toggle.mutate()}
                disabled={!isVerified || toggle.isPending}
                size="small"
              />
              <IconButton
                color="error"
                onClick={() => {
                  if (confirm(`¿Eliminar a ${helper.firstName}?`)) remove.mutate();
                }}
                disabled={remove.isPending}
                size="small"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {isRejected && helper.rejectionReason && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              <Typography variant="caption" fontWeight={600}>
                Motivo del rechazo:
              </Typography>
              <Typography variant="body2">{helper.rejectionReason}</Typography>
            </Alert>
          )}

          {isRejected && (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              startIcon={<Edit />}
              onClick={() => setEditOpen(true)}
              sx={{ mb: 1.5 }}
            >
              Editar datos
            </Button>
          )}

          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
            Documentos
          </Typography>
          <Stack spacing={1}>
            {docs.map((doc) => (
              <Box key={doc.id} sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`DNI ${doc.side === DocumentSide.BACK ? "(dorso)" : "(frente)"}`}
                  size="small"
                  variant="outlined"
                />
                <DocStatusChip status={doc.status} />
                {doc.status === DocumentReviewStatus.REJECTED && doc.rejectionReason && (
                  <Typography variant="caption" color="error.dark">
                    {doc.rejectionReason}
                  </Typography>
                )}
              </Box>
            ))}

            {!hasFront && (
              <DocUploadButton label="Subir DNI (frente)" onUpload={(f) => uploadDoc(DocumentSide.FRONT, f)} />
            )}
            {!hasBack && (
              <DocUploadButton label="Subir DNI (dorso)" onUpload={(f) => uploadDoc(DocumentSide.BACK, f)} />
            )}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar ayudante</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning" sx={{ fontSize: "0.8rem" }}>
              Al guardar, el ayudante volverá a estado <strong>Pendiente</strong>.
            </Alert>
            <TextField
              label="Nombre"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Apellido"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              size="small"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={update.isPending}
            onClick={async () => {
              await update.mutateAsync({
                firstName: editFirstName,
                lastName: editLastName,
              });
              setEditOpen(false);
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Doc Upload Button ───────────────────────────────────────────────────────

function DocUploadButton({
  label,
  onUpload,
}: {
  label: string;
  onUpload: (file: File) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
      toast.success(`${label} subido`);
    } catch {
      toast.error(`Error al subir`);
    } finally {
      setUploading(false);
    }
  };
  return (
    <Button variant="outlined" size="small" component="label" disabled={uploading}>
      {uploading ? "Subiendo..." : label}
      <input type="file" accept="image/*" hidden onChange={handle} />
    </Button>
  );
}

// ─── New Driver / Helper Dialogs ─────────────────────────────────────────────

function NewDriverDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateDriver();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const [result] = await uploadFiles("personnelDocUploader", { files: [file] });
      setPhotoUrl(result.url);
      toast.success("Foto subida");
    } catch {
      toast.error("Error al subir foto");
    } finally {
      setPhotoUploading(false);
    }
  };

  const reset = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    setPhotoUrl("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo conductor</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Después de crearlo, subí DNI (frente y dorso) y licencia desde su card.
          </Typography>
          <TextField label="Nombre *" value={firstName} onChange={(e) => setFirstName(e.target.value)} size="small" fullWidth />
          <TextField label="Apellido *" value={lastName} onChange={(e) => setLastName(e.target.value)} size="small" fullWidth />
          <TextField label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} size="small" fullWidth />
          <Box>
            <Button variant="outlined" component="label" disabled={photoUploading} startIcon={photoUrl ? <CheckCircle color="success" /> : undefined}>
              {photoUploading ? "Subiendo..." : photoUrl ? "Foto subida" : "Subir foto (opcional)"}
              <input type="file" accept="image/*" hidden onChange={handlePhoto} />
            </Button>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { reset(); onClose(); }}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!firstName.trim() || !lastName.trim() || create.isPending}
          onClick={async () => {
            await create.mutateAsync({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phone: phone.trim() || undefined,
              photoUrl: photoUrl || undefined,
            });
            reset();
            onClose();
          }}
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function NewHelperDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateHelper();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const [result] = await uploadFiles("personnelDocUploader", { files: [file] });
      setPhotoUrl(result.url);
      toast.success("Foto subida");
    } catch {
      toast.error("Error al subir foto");
    } finally {
      setPhotoUploading(false);
    }
  };

  const reset = () => {
    setFirstName("");
    setLastName("");
    setPhotoUrl("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo ayudante</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Después de crearlo, subí el DNI (frente y dorso) desde su card.
          </Typography>
          <TextField label="Nombre *" value={firstName} onChange={(e) => setFirstName(e.target.value)} size="small" fullWidth />
          <TextField label="Apellido *" value={lastName} onChange={(e) => setLastName(e.target.value)} size="small" fullWidth />
          <Box>
            <Button variant="outlined" component="label" disabled={photoUploading} startIcon={photoUrl ? <CheckCircle color="success" /> : undefined}>
              {photoUploading ? "Subiendo..." : photoUrl ? "Foto subida" : "Subir foto (opcional)"}
              <input type="file" accept="image/*" hidden onChange={handlePhoto} />
            </Button>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { reset(); onClose(); }}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!firstName.trim() || !lastName.trim() || create.isPending}
          onClick={async () => {
            await create.mutateAsync({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              photoUrl: photoUrl || undefined,
            });
            reset();
            onClose();
          }}
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PersonalPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialTab = params.get("tab") === "helpers" ? 1 : 0;
  const [tab, setTab] = useState(initialTab);
  const [newDriverOpen, setNewDriverOpen] = useState(false);
  const [newHelperOpen, setNewHelperOpen] = useState(false);

  const { data: drivers = [], isLoading: loadingDrivers } = useMyDrivers();
  const { data: helpers = [], isLoading: loadingHelpers } = useMyHelpers();

  const driversCount = drivers.length;
  const helpersCount = helpers.length;
  const canAddDriver = driversCount < MAX;
  const canAddHelper = helpersCount < MAX;

  return (
    <AuthGuard message="Por favor inicia sesión">
      <PageTransition>
        <AuthNavbar />
        <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 4, pb: { xs: 12, md: 4 } }}>
          <Container maxWidth="md">
            <Box mb={3}>
              <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Group /> Mi Personal
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Conductores extras y ayudantes que podés asignar al aceptar un viaje. Máximo {MAX} de cada uno.
              </Typography>
            </Box>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }} variant="fullWidth">
              <Tab label={`Conductores (${driversCount}/${MAX})`} icon={<Person />} iconPosition="start" />
              <Tab label={`Ayudantes (${helpersCount}/${MAX})`} icon={<Group />} iconPosition="start" />
            </Tabs>

            {tab === 0 && (
              <Box>
                {loadingDrivers ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : drivers.length === 0 ? (
                  <Paper elevation={2} sx={{ p: 4, textAlign: "center", borderRadius: 2, bgcolor: "action.hover" }}>
                    <Person sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Sin conductores extras
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Registrá un conductor para asignarlo a tus viajes
                    </Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setNewDriverOpen(true)}>
                      Agregar conductor
                    </Button>
                  </Paper>
                ) : (
                  <Stack spacing={2}>
                    {drivers.map((d) => (
                      <DriverCard key={d.id} driver={d} />
                    ))}
                    {canAddDriver && (
                      <Box sx={{ textAlign: "center", mt: 1 }}>
                        <Button variant="outlined" startIcon={<Add />} onClick={() => setNewDriverOpen(true)}>
                          Agregar conductor
                        </Button>
                      </Box>
                    )}
                    {!canAddDriver && (
                      <Alert severity="info">Llegaste al máximo de {MAX} conductores. Eliminá uno si necesitás agregar otro.</Alert>
                    )}
                  </Stack>
                )}
              </Box>
            )}

            {tab === 1 && (
              <Box>
                {loadingHelpers ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : helpers.length === 0 ? (
                  <Paper elevation={2} sx={{ p: 4, textAlign: "center", borderRadius: 2, bgcolor: "action.hover" }}>
                    <Group sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Sin ayudantes
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Registrá un ayudante para asignarlo a tus viajes
                    </Typography>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setNewHelperOpen(true)}>
                      Agregar ayudante
                    </Button>
                  </Paper>
                ) : (
                  <Stack spacing={2}>
                    {helpers.map((h) => (
                      <HelperCard key={h.id} helper={h} />
                    ))}
                    {canAddHelper && (
                      <Box sx={{ textAlign: "center", mt: 1 }}>
                        <Button variant="outlined" startIcon={<Add />} onClick={() => setNewHelperOpen(true)}>
                          Agregar ayudante
                        </Button>
                      </Box>
                    )}
                    {!canAddHelper && (
                      <Alert severity="info">Llegaste al máximo de {MAX} ayudantes.</Alert>
                    )}
                  </Stack>
                )}
              </Box>
            )}
          </Container>
        </Box>
        <BottomNavbar />

        <NewDriverDialog open={newDriverOpen} onClose={() => setNewDriverOpen(false)} />
        <NewHelperDialog open={newHelperOpen} onClose={() => setNewHelperOpen(false)} />
      </PageTransition>
    </AuthGuard>
  );
}
