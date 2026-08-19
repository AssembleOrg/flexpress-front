"use client";

import { AttachMoney } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

/** Formato de pesos argentinos sin decimales (ej: $33.000). */
export function formatArs(value: number): string {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

/**
 * KM aproximado para mostrar (medimos en línea recta × factor, nunca es
 * exacto). Ej: 16.6 → "≈16.6 km".
 */
export function formatKmApprox(km: number): string {
  return `≈${km.toFixed(1)} km`;
}

// Factor de circuito con el que el backend calcula distancia/precio (ver
// STREET_DISTANCE_FACTOR en distance.util.ts). El rango mostrado reescala ese
// valor a los extremos 1.3–1.4.
const BASE_FACTOR = 1.35;
const MIN_FACTOR = 1.3;
const MAX_FACTOR = 1.4;

/**
 * Rango estimado a partir de un valor calculado con BASE_FACTOR. Como el km y
 * el precio son aproximados, mostramos un rango reescalando a los extremos
 * 1.3–1.4. Ej: estimatedRange(1350) → { min: 1300, max: 1400 }.
 */
export function estimatedRange(value: number): { min: number; max: number } {
  return {
    min: (value * MIN_FACTOR) / BASE_FACTOR,
    max: (value * MAX_FACTOR) / BASE_FACTOR,
  };
}

interface PriceBreakdownProps {
  /** Total aproximado del viaje (solo ida, con mínimo aplicado). */
  total: number;
  title?: string;
  /** Texto al pie. Si no se pasa, muestra "Aproximado". */
  footer?: string;
  /** Estimado del tramo de vuelta (50%). Solo informativo, no suma al total. */
  returnArs?: number | null;
  /** Si el charter cobra el viaje de vuelta (muestra la línea de vuelta). */
  chargesReturnTrip?: boolean;
}

/**
 * Caja del estimado del viaje en pesos (informativo). Muestra solo el total
 * aproximado (por km) + nota de posibles recargos por espera. Branding:
 * oro/verde sobre fondo suave. Reutilizada en la card del cliente, el modal de
 * confirmación y el preview del charter en settings.
 */
export function PriceBreakdown({
  total,
  title = "Estimado del viaje",
  footer,
  returnArs,
  chargesReturnTrip,
}: PriceBreakdownProps) {
  const footerText = footer ?? "Aproximado";
  const { min, max } = estimatedRange(total);
  const showReturn = chargesReturnTrip && (returnArs ?? 0) > 0;

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 2,
        bgcolor: "success.50",
        border: "1px solid",
        borderColor: "success.100",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AttachMoney
            sx={{ fontSize: 16, color: "success.main", flexShrink: 0 }}
          />
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight={800}
          color="success.dark"
          lineHeight={1.1}
          sx={{ textAlign: "right" }}
        >
          {formatArs(min)} – {formatArs(max)}
        </Typography>
      </Box>

      {showReturn && (
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 1,
            mt: 0.75,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            + Vuelta (aprox.)
          </Typography>
          <Typography variant="caption" fontWeight={700} color="success.dark">
            {formatArs(returnArs as number)}
          </Typography>
        </Box>
      )}

      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: "block", mt: 0.75, fontSize: "0.65rem" }}
      >
        {showReturn
          ? "La vuelta se coordina con el chófer. Pueden aplicar recargos por espera"
          : "Pueden aplicar recargos por espera"}
      </Typography>

      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: "block", mt: 0.25, fontSize: "0.65rem" }}
      >
        {footerText}
      </Typography>
    </Box>
  );
}
