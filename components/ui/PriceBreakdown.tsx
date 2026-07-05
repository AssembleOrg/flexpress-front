"use client";

import { AttachMoney } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

/** Formato de pesos argentinos sin decimales (ej: $33.000). */
export function formatArs(value: number): string {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

interface PriceBreakdownProps {
  /** Total aproximado del viaje (solo ida, con mínimo aplicado). */
  total: number;
  title?: string;
  /** Texto al pie. Si no se pasa, muestra "Aproximado". */
  footer?: string;
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
}: PriceBreakdownProps) {
  const footerText = footer ?? "Aproximado";

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

      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: "block", mt: 0.75, fontSize: "0.65rem" }}
      >
        Pueden aplicar recargos por espera
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
