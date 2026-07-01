"use client";

import {
  AttachMoney,
  LocalShipping,
  Navigation,
  Person,
  Route,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { RatingDisplay } from "@/components/ui/RatingDisplay";
import { useUserFeedback } from "@/lib/hooks/queries/useFeedbackQueries";
import {
  useMyDrivers,
  useMyHelpers,
} from "@/lib/hooks/queries/useCharterPersonnelQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCreditPurchaseStore } from "@/lib/stores/creditPurchaseStore";
import { getCharterCreditCost } from "@/lib/utils/creditCost";
import { getDirectionsUrl } from "@/lib/utils/mapLinks";
import type { CharterAvailabilityState } from "@/lib/api/travelMatching";
import type { TravelMatch } from "@/lib/types/api";

interface AcceptMatchModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  match: TravelMatch | null;
  /** Config activa elegida al ponerse disponible: define quién ejecuta el viaje. */
  availability?: CharterAvailabilityState | null;
  isLoading?: boolean;
  error?: string | null;
}

export function AcceptMatchModal({
  open,
  onClose,
  onAccept,
  onReject,
  match,
  availability = null,
  isLoading = false,
  error = null,
}: AcceptMatchModalProps) {
  const { user } = useAuthStore();
  const { openModal: openCreditStore } = useCreditPurchaseStore();
  const { data: clientFeedback } = useUserFeedback(match?.userId ?? "");
  const { data: myDrivers = [] } = useMyDrivers();
  const { data: myHelpers = [] } = useMyHelpers();

  if (!match) return null;

  // Costo escalonado por distancia (misma tabla que el backend) y si el charter
  // tiene saldo para pagarlo. Si no alcanza, bloqueamos y ofrecemos la tienda.
  const charterCost = getCharterCreditCost(match.distanceKm);
  const currentCredits = user?.credits ?? 0;
  const hasEnoughCredits = currentCredits >= charterCost;

  // Coords para "Ver ruta": sólo mostramos el botón si las 4 existen.
  const pickupLat = Number.parseFloat(match.pickupLatitude);
  const pickupLng = Number.parseFloat(match.pickupLongitude);
  const destLat = Number.parseFloat(match.destinationLatitude);
  const destLng = Number.parseFloat(match.destinationLongitude);
  const canOpenRoute =
    Number.isFinite(pickupLat) &&
    Number.isFinite(pickupLng) &&
    Number.isFinite(destLat) &&
    Number.isFinite(destLng);

  const handleOpenRoute = () => {
    window.open(
      getDirectionsUrl(pickupLat, pickupLng, destLat, destLng),
      "_blank",
      "noopener",
    );
  };

  const handleBuyCredits = () => {
    onClose();
    openCreditStore();
  };

  // Resolver la identidad del ejecutor activo (lo que el cliente ya vio).
  const activeDriver = availability?.activeDriverId
    ? myDrivers.find((d) => d.id === availability.activeDriverId)
    : null;
  const activeDriverName = activeDriver
    ? `${activeDriver.firstName} ${activeDriver.lastName}`.trim()
    : `${user?.name ?? "Vos"} (titular)`;
  const activeHelperNames = (availability?.activeHelperIds ?? [])
    .map((id) => myHelpers.find((h) => h.id === id))
    .filter(Boolean)
    .map((h) => `${h!.firstName} ${h!.lastName}`.trim());

  const isValidState = match.status === "pending" || match.status === "searching";

  const handleAccept = () => {
    onAccept();
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

          {isValidState && !hasEnoughCredits && (
            <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 1, border: "1px solid", borderColor: "error.main" }}>
              <Typography variant="body2" color="error.dark" sx={{ mb: 1 }}>
                Necesitás {charterCost} créditos para aceptar este viaje. Tenés {currentCredits}.
              </Typography>
              <Button
                onClick={handleBuyCredits}
                variant="contained"
                size="small"
                fullWidth
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Comprar créditos
              </Button>
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
            {canOpenRoute && (
              <Button
                onClick={handleOpenRoute}
                startIcon={<Navigation sx={{ fontSize: 18 }} />}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mt: 1.25, textTransform: "none", fontWeight: 600 }}
              >
                Ver ruta en el mapa
              </Button>
            )}
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
                {charterCost} {charterCost === 1 ? "crédito" : "créditos"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                Costo al aceptar
              </Typography>
            </Box>
          </Box>

          {/* Ejecutor activo (read-only): se eligió al ponerse disponible.
              Es lo que el cliente ya vio al seleccionar este charter. */}
          <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <Person sx={{ fontSize: 18, color: "secondary.main" }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.7rem", fontWeight: 600 }}>
                Conduce
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }} noWrap>
                {activeDriverName}
              </Typography>
              {activeHelperNames.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }} noWrap>
                  Ayudantes: {activeHelperNames.join(", ")}
                </Typography>
              )}
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1.5, display: "flex", justifyContent: "space-between" }}>
        <Button onClick={onReject} disabled={isLoading || !isValidState} variant="outlined" color="error" size="large" sx={{ flex: 1, minHeight: 48 }}>
          Rechazar
        </Button>
        <Button
          onClick={handleAccept}
          disabled={isLoading || !isValidState || !hasEnoughCredits}
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
