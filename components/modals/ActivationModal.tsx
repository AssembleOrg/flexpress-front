"use client";

import { DirectionsCar, Group, Person } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import {
  useMyDrivers,
  useMyHelpers,
} from "@/lib/hooks/queries/useCharterPersonnelQueries";
import { useMyVehicles } from "@/lib/hooks/queries/useVehicleQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import { VerificationStatus } from "@/lib/types/api";

export interface ActivationSelection {
  vehicleId: string;
  activeDriverId: string | null; // null = titular
  activeHelperIds: string[];
}

interface ActivationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selection: ActivationSelection) => void;
  isLoading?: boolean;
  /** Config previa para precargar (ej: reactivación). */
  initial?: Partial<ActivationSelection> | null;
}

const SELF_DRIVER = "__self__";

/**
 * Modal de activación de disponibilidad (estética iOS, info condensada).
 * El charter elige quién representa hoy a la cuenta: conductor (titular o
 * extra) + su vehículo + ayudantes. Conductor extra y vehículo van de la mano.
 */
export function ActivationModal({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  initial = null,
}: ActivationModalProps) {
  const { user } = useAuthStore();
  const { data: vehicles = [] } = useMyVehicles();
  const { data: drivers = [] } = useMyDrivers();
  const { data: helpers = [] } = useMyHelpers();

  const verifiedVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) => v.verificationStatus === VerificationStatus.VERIFIED,
      ),
    [vehicles],
  );
  const availableDrivers = useMemo(
    () =>
      drivers.filter((d) => d.verificationStatus === "verified" && d.isEnabled),
    [drivers],
  );
  const availableHelpers = useMemo(
    () =>
      helpers.filter((h) => h.verificationStatus === "verified" && h.isEnabled),
    [helpers],
  );

  const [driverSel, setDriverSel] = useState<string>(SELF_DRIVER);
  const [vehicleId, setVehicleId] = useState<string>("");
  const [helperIds, setHelperIds] = useState<string[]>([]);

  // Precargar al abrir: config previa, o defaults sensatos (titular + único vehículo).
  useEffect(() => {
    if (!open) return;
    setDriverSel(initial?.activeDriverId ?? SELF_DRIVER);
    setVehicleId(
      initial?.vehicleId ??
        (verifiedVehicles.length === 1 ? verifiedVehicles[0].id : ""),
    );
    setHelperIds(initial?.activeHelperIds ?? []);
  }, [open, initial, verifiedVehicles]);

  const toggleHelper = (id: string) => {
    setHelperIds((cur) =>
      cur.includes(id)
        ? cur.filter((x) => x !== id)
        : cur.length >= 2
          ? cur
          : [...cur, id],
    );
  };

  const canConfirm = vehicleId !== "" && !isLoading;

  const handleConfirm = () => {
    if (!vehicleId) return;
    onConfirm({
      vehicleId,
      activeDriverId: driverSel === SELF_DRIVER ? null : driverSel,
      activeHelperIds: helperIds,
    });
  };

  const sectionSx = {
    p: 1.5,
    bgcolor: "background.default",
    borderRadius: 2,
  } as const;
  const labelSx = {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.3px",
    textTransform: "uppercase" as const,
    color: "text.secondary",
    mb: 1,
    display: "block",
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem", pb: 1 }}>
        Ponerte disponible
      </DialogTitle>
      <DialogContent sx={{ py: 1 }}>
        <Stack spacing={1.5}>
          {/* Conductor */}
          <Box sx={sectionSx}>
            <Box component="span" sx={labelSx}>
              <Person sx={{ fontSize: 13, mr: 0.5, verticalAlign: "-2px" }} />
              ¿Quién conduce?
            </Box>
            <Stack spacing={0.75}>
              <SelectableRow
                selected={driverSel === SELF_DRIVER}
                onClick={() => setDriverSel(SELF_DRIVER)}
                avatar={user?.avatar ?? undefined}
                title={`${user?.name ?? "Vos"}`}
                subtitle="Titular"
              />
              {availableDrivers.map((d) => (
                <SelectableRow
                  key={d.id}
                  selected={driverSel === d.id}
                  onClick={() => setDriverSel(d.id)}
                  avatar={d.photoUrl ?? undefined}
                  title={`${d.firstName} ${d.lastName}`}
                  subtitle="Conductor"
                />
              ))}
            </Stack>
          </Box>

          {/* Vehículo (obligatorio, va de la mano del conductor) */}
          <Box sx={sectionSx}>
            <Box component="span" sx={labelSx}>
              <DirectionsCar
                sx={{ fontSize: 13, mr: 0.5, verticalAlign: "-2px" }}
              />
              Vehículo
            </Box>
            {verifiedVehicles.length === 0 ? (
              <Typography variant="body2" color="error">
                No tenés vehículos verificados.
              </Typography>
            ) : (
              <Stack spacing={0.75}>
                {verifiedVehicles.map((v) => (
                  <SelectableRow
                    key={v.id}
                    selected={vehicleId === v.id}
                    onClick={() => setVehicleId(v.id)}
                    icon={<DirectionsCar />}
                    title={
                      [v.brand, v.model].filter(Boolean).join(" ") || "Vehículo"
                    }
                    subtitle={v.plate}
                    mono
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Ayudantes (opcional, máx 2) */}
          {availableHelpers.length > 0 && (
            <Box sx={sectionSx}>
              <Box component="span" sx={labelSx}>
                <Group sx={{ fontSize: 13, mr: 0.5, verticalAlign: "-2px" }} />
                Ayudantes (máx 2)
              </Box>
              <Stack spacing={0.25}>
                {availableHelpers.map((h) => {
                  const checked = helperIds.includes(h.id);
                  const disabled = !checked && helperIds.length >= 2;
                  return (
                    <Box
                      key={h.id}
                      onClick={() => !disabled && toggleHelper(h.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 0.5,
                        cursor: disabled ? "default" : "pointer",
                        opacity: disabled ? 0.5 : 1,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={checked}
                        disabled={disabled}
                        sx={{ p: 0.5 }}
                      />
                      <Typography variant="body2">{`${h.firstName} ${h.lastName}`}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{ flex: 1, minHeight: 46 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="secondary"
          disabled={!canConfirm}
          startIcon={isLoading ? <CircularProgress size={18} /> : undefined}
          sx={{ flex: 1, minHeight: 46, fontWeight: 700 }}
        >
          {isLoading ? "Activando..." : "Activar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface SelectableRowProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string | null;
  avatar?: string;
  icon?: React.ReactNode;
  mono?: boolean;
}

function SelectableRow({
  selected,
  onClick,
  title,
  subtitle,
  avatar,
  icon,
  mono = false,
}: SelectableRowProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        p: 1,
        borderRadius: 1.5,
        cursor: "pointer",
        border: "1.5px solid",
        borderColor: selected ? "secondary.main" : "transparent",
        bgcolor: selected ? "action.selected" : "action.hover",
        transition: "all 0.15s ease",
      }}
    >
      <SignedAvatar
        value={avatar}
        sx={{ width: 30, height: 30, fontSize: "0.8rem" }}
      >
        {icon ?? title.charAt(0)}
      </SignedAvatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            lineHeight: 1.2,
            fontFamily: mono ? "monospace" : undefined,
          }}
          noWrap
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: "0.7rem",
              fontFamily: mono ? "monospace" : undefined,
            }}
            noWrap
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {selected && (
        <Chip
          label="✓"
          size="small"
          color="secondary"
          sx={{ height: 20, minWidth: 20, "& .MuiChip-label": { px: 0.5 } }}
        />
      )}
    </Box>
  );
}
