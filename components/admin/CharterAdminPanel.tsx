"use client";

import { useState } from "react";
import {
  Badge,
  Block,
  CheckCircle,
  DirectionsCar,
  Group,
  Person,
  Warning,
} from "@mui/icons-material";
import {
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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAdminCharterDetail } from "@/lib/hooks/queries/useAdminQueries";
import { useUpdateAccountStatus } from "@/lib/hooks/mutations/useAdminMutations";

interface CharterAdminPanelProps {
  charterId: string;
}

type AccountStatus = "active" | "warned" | "banned";

/**
 * Panel admin consolidado de una cuenta charter (estética iOS, condensado).
 * El admin ve TODO de la cuenta (vehículos + conductores + ayudantes + docs +
 * config activa) y sanciona a NIVEL CUENTA: el titular es la unidad punible —
 * si un conductor se equivoca, la responsabilidad recae sobre el titular.
 */
export function CharterAdminPanel({ charterId }: CharterAdminPanelProps) {
  const { data: detail, isLoading } = useAdminCharterDetail(charterId);
  const updateStatus = useUpdateAccountStatus();

  const [dialog, setDialog] = useState<null | AccountStatus>(null);
  const [note, setNote] = useState("");

  const status: AccountStatus = (detail?.accountStatus ?? "active") as AccountStatus;

  const handleConfirm = () => {
    if (!dialog) return;
    updateStatus.mutate(
      { charterId, status: dialog, note: dialog === "active" ? undefined : note },
      {
        onSuccess: () => {
          setDialog(null);
          setNote("");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress size={28} />
        </CardContent>
      </Card>
    );
  }

  if (!detail) return null;

  const active = detail.charterAvailability;

  return (
    <>
      {/* Estado de cuenta + sanción */}
      <Card sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Estado de la cuenta
            </Typography>
            <AccountStatusChip status={status} />
          </Box>

          {detail.accountStatusNote && status !== "active" && (
            <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2, mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                MOTIVO
              </Typography>
              <Typography variant="body2">{detail.accountStatusNote}</Typography>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            La sanción es a nivel cuenta: rating y reportes pertenecen al titular.
            Un error de un conductor recae sobre el titular.
          </Typography>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {/* Volver a active: "Quitar advertencia" desde warned (la cuenta
                nunca estuvo bloqueada) o "Reactivar" desde banned. */}
            {status === "warned" && (
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => setDialog("active")}
              >
                Quitar advertencia
              </Button>
            )}
            {status === "banned" && (
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => setDialog("active")}
              >
                Reactivar
              </Button>
            )}
            {status !== "warned" && (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<Warning />}
                onClick={() => setDialog("warned")}
              >
                Advertir
              </Button>
            )}
            {status !== "banned" && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Block />}
                onClick={() => setDialog("banned")}
              >
                Bloquear cuenta
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Config activa actual */}
      {active && (
        <Card sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              Operando ahora
            </Typography>
            {active.isAvailable ? (
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  <strong>Conductor:</strong>{" "}
                  {active.activeDriver
                    ? `${active.activeDriver.firstName} ${active.activeDriver.lastName}`
                    : "Titular"}
                </Typography>
                <Typography variant="body2">
                  <strong>Vehículo:</strong>{" "}
                  {active.vehicle
                    ? `${[active.vehicle.brand, active.vehicle.model].filter(Boolean).join(" ")} · ${active.vehicle.plate ?? ""}`
                    : "—"}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No está disponible en este momento.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documentos del titular (DNI) */}
      <Card sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Badge />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Documentos del titular
            </Typography>
            <Chip label={detail.userDocuments?.length ?? 0} size="small" sx={{ ml: "auto" }} />
          </Box>
          {(detail.userDocuments?.length ?? 0) === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Sin documentos de identidad.
            </Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {detail.userDocuments?.map((doc) => (
                <Box key={doc.id} sx={{ textAlign: "center" }}>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={doc.fileUrl}
                      alt={`DNI ${doc.side ?? ""}`}
                      style={{
                        width: 120,
                        height: 84,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: `2px solid ${docStatusColor(doc.status)}`,
                        display: "block",
                      }}
                    />
                  </a>
                  <Typography variant="caption" color="text.secondary">
                    {doc.side === "front" ? "Frente" : doc.side === "back" ? "Dorso" : doc.type}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Vehículos */}
      <EntitySection
        title="Vehículos"
        icon={<DirectionsCar />}
        empty="Sin vehículos."
        items={(detail.vehicles ?? []).map((v: any) => ({
          id: v.id,
          title: [v.brand, v.model].filter(Boolean).join(" ") || "Vehículo",
          subtitle: v.plate,
          status: v.verificationStatus,
          isEnabled: v.isEnabled,
          documents: v.documents ?? [],
        }))}
      />

      {/* Conductores */}
      <EntitySection
        title="Conductores"
        icon={<Person />}
        empty="Sin conductores extra."
        items={(detail.charterDrivers ?? []).map((d) => ({
          id: d.id,
          title: `${d.firstName} ${d.lastName}`,
          subtitle: d.phone ?? undefined,
          status: d.verificationStatus,
          isEnabled: d.isEnabled,
          documents: d.documents ?? [],
        }))}
      />

      {/* Ayudantes */}
      <EntitySection
        title="Ayudantes"
        icon={<Group />}
        empty="Sin ayudantes."
        items={(detail.charterHelpers ?? []).map((h) => ({
          id: h.id,
          title: `${h.firstName} ${h.lastName}`,
          status: h.verificationStatus,
          isEnabled: h.isEnabled,
          documents: h.documents ?? [],
        }))}
      />

      {/* Diálogo de sanción */}
      <Dialog open={dialog !== null} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {dialog === "active"
            ? status === "warned"
              ? "Quitar advertencia"
              : "Reactivar cuenta"
            : dialog === "warned"
              ? "Advertir cuenta"
              : "Bloquear cuenta"}
        </DialogTitle>
        <DialogContent>
          {dialog !== "active" ? (
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={2}
              label="Motivo (visible para el charter)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              sx={{ mt: 1 }}
            />
          ) : (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {status === "warned"
                ? "Se quitará la advertencia de la cuenta."
                : "La cuenta volverá a operar normalmente."}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialog(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color={dialog === "banned" ? "error" : dialog === "warned" ? "warning" : "success"}
            disabled={
              updateStatus.isPending || (dialog !== "active" && note.trim() === "")
            }
            onClick={handleConfirm}
          >
            {updateStatus.isPending ? "Aplicando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Color por estado de verificación/revisión (cubre verified/approved,
// rejected y pending) para los bordes de las miniaturas de documentos.
function docStatusColor(s: string): string {
  if (s === "verified" || s === "approved") return "#2e7d32";
  if (s === "rejected") return "#d32f2f";
  return "#dca621";
}

function AccountStatusChip({ status }: { status: AccountStatus }) {
  const map = {
    active: { label: "Activa", color: "success" as const, icon: <CheckCircle /> },
    warned: { label: "Advertida", color: "warning" as const, icon: <Warning /> },
    banned: { label: "Bloqueada", color: "error" as const, icon: <Block /> },
  };
  const cfg = map[status];
  return <Chip icon={cfg.icon} label={cfg.label} color={cfg.color} sx={{ fontWeight: 700 }} />;
}

interface EntityItem {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  isEnabled: boolean;
  documents: Array<{ id: string; type: string; side?: string | null; fileUrl: string; status: string }>;
}

function EntitySection({
  title,
  icon,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  items: EntityItem[];
  empty: string;
}) {
  const statusColor = docStatusColor;

  return (
    <Card sx={{ mt: 3, borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Chip label={items.length} size="small" sx={{ ml: "auto" }} />
        </Box>

        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {empty}
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {items.map((it) => (
              <Box key={it.id} sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: it.documents.length ? 1 : 0, flexWrap: "wrap" }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {it.title}
                    </Typography>
                    {it.subtitle && (
                      <Typography variant="caption" color="text.secondary">
                        {it.subtitle}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={it.status}
                    size="small"
                    sx={{ bgcolor: statusColor(it.status), color: "#fff", textTransform: "capitalize" }}
                  />
                  {!it.isEnabled && (
                    <Chip label="Deshabilitado" size="small" variant="outlined" color="default" />
                  )}
                </Box>
                {it.documents.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {it.documents.map((doc) => (
                      <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={doc.fileUrl}
                          alt={`${doc.type} ${doc.side ?? ""}`}
                          style={{
                            width: 96,
                            height: 70,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: `2px solid ${statusColor(doc.status)}`,
                            display: "block",
                          }}
                        />
                      </a>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
