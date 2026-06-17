"use client";

import { AttachMoney } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";

/** Formato de pesos argentinos sin decimales (ej: $33.000). */
export function formatArs(value: number): string {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

interface PriceBreakdownProps {
  total: number;
  ida: number | null;
  wait: number | null;
  ret: number | null;
  /** km del tramo ida (charter→pickup→destino), para el label. */
  idaKm?: number | null;
  /** km del tramo de vuelta, para el label. */
  returnKm?: number | null;
  /** Precio por km del charter, mostrado como referencia al pie. */
  pricePerKm?: number | null;
  title?: string;
  /** Texto al pie. Si no se pasa, se arma con pricePerKm. */
  footer?: string;
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={600}>
        {formatArs(value)}
      </Typography>
    </Box>
  );
}

/**
 * Caja de desglose del estimado del viaje en pesos (informativo).
 * Branding: oro/verde sobre fondo suave. Reutilizada en la card del cliente,
 * el modal de confirmación y el preview del charter en settings.
 */
export function PriceBreakdown({
  total,
  ida,
  wait,
  ret,
  idaKm,
  returnKm,
  pricePerKm,
  title = "Estimado del viaje",
  footer,
}: PriceBreakdownProps) {
  const footerText =
    footer ??
    (pricePerKm != null ? `Aproximado · ${formatArs(pricePerKm)}/km` : "Aproximado");

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
          <AttachMoney sx={{ fontSize: 16, color: "success.main", flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight={800}
          color="success.dark"
          lineHeight={1.1}
        >
          {formatArs(total)}
        </Typography>
      </Box>

      <Stack spacing={0.25} sx={{ mt: 0.75 }}>
        {ida != null && (
          <PriceRow
            label={`Viaje${idaKm != null ? ` (${idaKm.toFixed(1)} km)` : ""}`}
            value={ida}
          />
        )}
        {wait != null && wait > 0 && (
          <PriceRow label="Espera / carga (30 min)" value={wait} />
        )}
        {ret != null && ret > 0 && (
          <PriceRow
            label={`Vuelta 50%${returnKm != null ? ` (${returnKm.toFixed(1)} km)` : ""}`}
            value={ret}
          />
        )}
      </Stack>

      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: "block", mt: 0.5, fontSize: "0.65rem" }}
      >
        {footerText}
      </Typography>
    </Box>
  );
}
