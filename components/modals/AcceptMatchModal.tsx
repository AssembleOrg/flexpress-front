"use client";

import { useState, useEffect } from "react";
import { AttachMoney, LocalShipping, Person, Route } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { RatingDisplay } from "@/components/ui/RatingDisplay";
import { useUserFeedback } from "@/lib/hooks/queries/useFeedbackQueries";
import {
  useMyDrivers,
  useMyHelpers,
} from "@/lib/hooks/queries/useCharterPersonnelQueries";
import type { TravelMatch } from "@/lib/types/api";

interface AcceptMatchModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: (selection: { driverId?: string; helperIds?: string[] }) => void;
  onReject: () => void;
  match: TravelMatch | null;
  isLoading?: boolean;
  error?: string | null;
}

const SELF_DRIVER_VALUE = "__self__";

export function AcceptMatchModal({
  open,
  onClose,
  onAccept,
  onReject,
  match,
  isLoading = false,
  error = null,
}: AcceptMatchModalProps) {
  if (!match) return null;

  const { data: clientFeedback } = useUserFeedback(match.userId);
  const { data: myDrivers = [] } = useMyDrivers();
  const { data: myHelpers = [] } = useMyHelpers();

  const availableDrivers = myDrivers.filter(
    (d) => d.verificationStatus === "verified" && d.isEnabled,
  );
  const availableHelpers = myHelpers.filter(
    (h) => h.verificationStatus === "verified" && h.isEnabled,
  );

  const [driverSelection, setDriverSelection] = useState<string>(SELF_DRIVER_VALUE);
  const [selectedHelperIds, setSelectedHelperIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setDriverSelection(SELF_DRIVER_VALUE);
      setSelectedHelperIds([]);
    }
  }, [open]);

  const maxHelpers = match.workersCount ?? 0;
  const showDriverPicker = availableDrivers.length > 0;
  const showHelperPicker = availableHelpers.length > 0 && maxHelpers > 0;

  const toggleHelper = (id: string) => {
    setSelectedHelperIds((current) => {
      if (current.includes(id)) {
        return current.filter((x) => x !== id);
      }
      if (current.length >= maxHelpers) {
        return current;
      }
      return [...current, id];
    });
  };

  const isValidState = match.status === "pending" || match.status === "searching";

  const handleAccept = () => {
    const driverId = driverSelection !== SELF_DRIVER_VALUE ? driverSelection : undefined;
    const helperIds = selectedHelperIds.length > 0 ? selectedHelperIds : undefined;
    onAccept({ driverId, helperIds });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: "1.1rem" }}>
        Nueva Solicitud
      </DialogTitle>

      <DialogContent sx={{ py: 1.5 }}>
        <Stack spacing={1.5}>
          {error && (
            <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 1, border: "1px solid", borderColor: "error.main" }}>
              <Typography variant="body2" color="error.dark">{error}</Typography>
            </Box>
          )}

          {!isValidState && (
            <Box sx={{ p: 2, bgcolor: "warning.light", borderRadius: 1, border: "1px solid", borderColor: "warning.main" }}>
              <Typography variant="body2" color="warning.dark">
                ⚠️ Este viaje ya ha sido procesado o no está disponible.
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, bgcolor: "action.hover", borderRadius: 1.5 }}>
            <Avatar src={match.user?.avatar || undefined} sx={{ width: 48, height: 48 }}>
              {match.user?.name?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {match.user?.name || "Cliente"}
              </Typography>
              <Box mt={0.5}>
                <RatingDisplay
                  averageRating={clientFeedback?.averageRating || 0}
                  totalReviews={clientFeedback?.totalCount || 0}
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          {(match.cargoDescription || (match.workersCount ?? 0) > 0) && (
            <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                <LocalShipping sx={{ fontSize: 18, color: "secondary.main" }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                  Qué mueve
                </Typography>
              </Box>
              {match.cargoDescription && (
                <Typography variant="body2" sx={{ fontSize: "0.9rem", lineHeight: 1.4, mb: (match.workersCount ?? 0) > 0 ? 1 : 0 }}>
                  {match.cargoDescription}
                </Typography>
              )}
              {(match.workersCount ?? 0) > 0 && (
                <Chip
                  label={`Pide ${match.workersCount} ayudante${match.workersCount > 1 ? "s" : ""}`}
                  size="small"
                  color="secondary"
                  sx={{ fontWeight: 700, height: 24 }}
                />
              )}
            </Box>
          )}

          <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontSize: "0.7rem", fontWeight: 600 }}>
              Origen → Destino
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.85rem", lineHeight: 1.4, mb: 0.5 }}>
              {match.pickupAddress || "No especificado"}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.4 }}>
              {match.destinationAddress || "No especificado"}
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5, textAlign: "center" }}>
              <Route sx={{ fontSize: 20, color: "primary.main", mb: 0.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
                {match.distanceKm?.toFixed(1) || "0"} km
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                Distancia
              </Typography>
            </Box>

            <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5, textAlign: "center" }}>
              <AttachMoney sx={{ fontSize: 20, color: "warning.main", mb: 0.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem", color: "warning.main" }}>
                2
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                Costo al aceptar
              </Typography>
            </Box>
          </Box>

          {!showDriverPicker && (
            <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
              <Person sx={{ fontSize: 18, color: "secondary.main" }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.7rem", fontWeight: 600 }}>
                  Conductor
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                  Conduce: vos (titular)
                </Typography>
              </Box>
            </Box>
          )}

          {showDriverPicker && (
            <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 0.5 }}>
                  ¿Quién conduce?
                </FormLabel>
                <RadioGroup
                  value={driverSelection}
                  onChange={(e) => setDriverSelection(e.target.value)}
                >
                  <FormControlLabel
                    value={SELF_DRIVER_VALUE}
                    control={<Radio size="small" />}
                    label="Yo (titular)"
                  />
                  {availableDrivers.map((d) => (
                    <FormControlLabel
                      key={d.id}
                      value={d.id}
                      control={<Radio size="small" />}
                      label={`${d.firstName} ${d.lastName}`}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {showHelperPicker && (
            <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 0.5 }}>
                  Ayudantes (máx {maxHelpers})
                </FormLabel>
                <Stack>
                  {availableHelpers.map((h) => {
                    const checked = selectedHelperIds.includes(h.id);
                    const disabled = !checked && selectedHelperIds.length >= maxHelpers;
                    return (
                      <FormControlLabel
                        key={h.id}
                        control={
                          <Checkbox
                            size="small"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleHelper(h.id)}
                          />
                        }
                        label={`${h.firstName} ${h.lastName}`}
                      />
                    );
                  })}
                </Stack>
              </FormControl>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1.5, display: "flex", justifyContent: "space-between" }}>
        <Button onClick={onReject} disabled={isLoading || !isValidState} variant="outlined" color="error" size="large" sx={{ flex: 1, minHeight: 48 }}>
          Rechazar
        </Button>
        <Button
          onClick={handleAccept}
          disabled={isLoading || !isValidState}
          variant="contained"
          sx={{ flex: 1, minHeight: 48, fontWeight: 700, bgcolor: "secondary.main", "&:hover": { bgcolor: "secondary.dark" } }}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? "Aceptando..." : "Aceptar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
