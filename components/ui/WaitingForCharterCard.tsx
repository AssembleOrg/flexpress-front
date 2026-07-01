"use client";

import { DirectionsCar, NotificationsActive } from "@mui/icons-material";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { motion } from "framer-motion";
import type { AvailableCharter } from "@/lib/types/api";
import { VEHICLE_SIZE_LABELS } from "@/lib/types/api";

interface WaitingForCharterCardProps {
  charter: AvailableCharter;
  /** Hora límite formateada (ej. "11:34"). Viene del backend. */
  expirationLabel: string | null;
  /** Minutos restantes (estado existente, refresco del backend). */
  minutesLeft: number;
  onCancel: () => void;
  isCancelling: boolean;
}

const MotionBox = motion(Box);

/**
 * Tarjeta premium (estética iOS) para el estado "esperando confirmación del
 * chófer". Reemplaza el antiguo <Alert> genérico de MUI.
 *
 * NOTA: no calcula tiempo — la cuenta atrás viene del backend vía props
 * (`minutesLeft` y `expirationLabel`). El umbral de urgencia es solo visual.
 */
export function WaitingForCharterCard({
  charter,
  expirationLabel,
  minutesLeft,
  onCancel,
  isCancelling,
}: WaitingForCharterCardProps) {
  const isUrgent = minutesLeft > 0 && minutesLeft < 5;
  const accent = isUrgent ? "#E74C3C" : "#DCA621"; // rojo error / oro brillante

  const vehicle = [charter.vehicleBrand, charter.vehicleModel]
    .filter(Boolean)
    .join(" ");

  return (
    <MotionBox
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        position: "relative",
        mb: 3,
        overflow: "hidden",
        borderRadius: 4,
        p: { xs: 2, md: 2.5 },
        background:
          "linear-gradient(160deg, #FFFFFF 0%, #FFFFFF 55%, rgba(56,1,22,0.035) 100%)",
        border: "1px solid rgba(56,1,22,0.08)",
        boxShadow: "0 10px 34px rgba(56,1,22,0.12)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Franja de acento superior (oro / rojo si urgente) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      {/* Cabecera: avatar + nombre + estado en vivo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Avatar
            src={charter.charterAvatar || undefined}
            alt={charter.charterName}
            sx={{
              width: 52,
              height: 52,
              border: "2px solid rgba(220,166,33,0.45)",
              fontWeight: 700,
            }}
          >
            {charter.charterName.charAt(0)}
          </Avatar>
          {/* Dot pulsante estilo iOS (en vivo) */}
          <Box
            sx={{
              position: "absolute",
              bottom: 1,
              right: 1,
              width: 13,
              height: 13,
              borderRadius: "50%",
              bgcolor: accent,
              border: "2px solid #FFFFFF",
              animation: "fpWaitPulse 1.6s ease-in-out infinite",
              "@keyframes fpWaitPulse": {
                "0%": { boxShadow: `0 0 0 0 ${accent}66` },
                "70%": { boxShadow: `0 0 0 7px ${accent}00` },
                "100%": { boxShadow: `0 0 0 0 ${accent}00` },
              },
            }}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            noWrap
            sx={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.2 }}
          >
            {charter.charterName}
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}
          >
            <NotificationsActive
              sx={{ fontSize: 14, color: "text.secondary", flexShrink: 0 }}
            />
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              Esperando confirmación
            </Typography>
          </Box>
          {vehicle && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}
            >
              <DirectionsCar
                sx={{ fontSize: 14, color: "text.secondary", flexShrink: 0 }}
              />
              <Typography variant="caption" noWrap sx={{ color: "text.secondary" }}>
                {vehicle}
                {charter.vehicleSize
                  ? ` · ${VEHICLE_SIZE_LABELS[charter.vehicleSize]}`
                  : ""}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Countdown destacado */}
      <Box
        sx={{
          mt: 2,
          py: 1.5,
          px: 2,
          borderRadius: 3,
          textAlign: "center",
          bgcolor: isUrgent ? "rgba(231,76,60,0.06)" : "rgba(220,166,33,0.07)",
          border: `1px solid ${accent}26`,
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: "2rem", md: "2.25rem" },
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            color: accent,
          }}
        >
          {minutesLeft > 0 ? `${minutesLeft} min` : "—"}
        </Typography>
        {expirationLabel && (
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 0.5, color: "text.secondary" }}
          >
            Vence a las <strong>{expirationLabel}</strong>
          </Typography>
        )}
      </Box>

      {/* Pie: nota + cancelar */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 1.5,
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        Te avisaremos aquí cuando acepte tu solicitud.
      </Typography>

      <Button
        onClick={onCancel}
        disabled={isCancelling}
        fullWidth
        sx={{
          mt: 1.5,
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
          color: "text.secondary",
          bgcolor: "rgba(56,1,22,0.04)",
          "&:hover": {
            bgcolor: "rgba(231,76,60,0.08)",
            color: "error.main",
          },
        }}
      >
        {isCancelling ? "Cancelando…" : "Cancelar solicitud"}
      </Button>
    </MotionBox>
  );
}
