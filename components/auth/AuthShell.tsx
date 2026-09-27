"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import type { ReactNode } from "react";
import Logo from "@/components/ui/Logo";

const GOLD = "#DCA621";
const WINE = "#380116";
const CREAM = "#F5F2E8";

const fadeUp = {
  "@keyframes authFadeUp": {
    from: { opacity: 0, transform: "translateY(12px)" },
    to: { opacity: 1, transform: "none" },
  },
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
};

const glow = (size: number, alpha: number) => ({
  content: '""',
  position: "absolute",
  width: size,
  height: size,
  borderRadius: "50%",
  background: `radial-gradient(circle, rgba(220,166,33,${alpha}) 0%, transparent 70%)`,
  pointerEvents: "none",
  zIndex: 0,
});

/**
 * Pantallas de auth sin sesión (recuperar/restablecer contraseña, confirmar
 * email): fondo bordó de marca, logo y una card de vidrio centrada.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
        background: `linear-gradient(160deg, ${WINE} 0%, #4b011d 100%)`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        px: 2,
        pt: "max(32px, env(safe-area-inset-top))",
        pb: "max(32px, env(safe-area-inset-bottom))",
        "&::before": { ...glow(440, 0.1), top: -160, left: -160 },
        "&::after": { ...glow(340, 0.07), bottom: -120, right: -120 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          ...fadeUp,
          animation: "authFadeUp 0.5s ease-out both",
        }}
      >
        <Logo size={84} variant="white" />
      </Box>

      <Card
        elevation={0}
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
          borderRadius: "24px",
          bgcolor: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.06), 0 24px 48px -12px rgba(20,0,8,0.5)",
          ...fadeUp,
          animation: "authFadeUp 0.5s 0.08s ease-out both",
          // Hairline dorada arriba: detalle de marca, no un borde de color.
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 32,
            right: 32,
            height: 2,
            borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            bgcolor: "#FBF9F4",
            transition: "box-shadow 0.2s",
            "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(56,1,22,0.08)" },
          },
          "& .MuiButton-containedSecondary": {
            borderRadius: "14px",
            py: 1.5,
            color: WINE,
            fontWeight: 700,
            textTransform: "none",
            fontSize: "1rem",
            boxShadow: "0 6px 16px -6px rgba(220,166,33,0.7)",
            transition: "transform 0.15s, box-shadow 0.2s",
            "&:active": { transform: "scale(0.98)" },
          },
        }}
      >
        <CardContent
          sx={{ p: { xs: 3, sm: 4 }, "&:last-child": { pb: { xs: 3, sm: 4 } } }}
        >
          {children}
        </CardContent>
      </Card>
    </Box>
  );
}

/** Medallón crema con anillo dorado para el ícono de estado. */
export function AuthBadge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "error";
}) {
  return (
    <Box
      sx={{
        width: 72,
        height: 72,
        mx: "auto",
        mb: 2,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: CREAM,
        color: tone === "error" ? "error.dark" : WINE,
        boxShadow: `0 0 0 1px rgba(220,166,33,0.45), 0 0 0 7px rgba(220,166,33,0.1)`,
        "& svg": { fontSize: 34 },
        "@keyframes authPop": {
          from: { opacity: 0, transform: "scale(0.6)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        animation: "authPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      }}
    >
      {children}
    </Box>
  );
}

/** Título serif + bajada, centrados. */
export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <Box sx={{ textAlign: "center", mb: 3 }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: "var(--font-playfair), serif",
          fontWeight: 700,
          fontSize: "1.6rem",
          lineHeight: 1.25,
          color: WINE,
          mb: subtitle ? 1 : 0,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          sx={{ color: "#6B5E5E", fontSize: "0.95rem", lineHeight: 1.55 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

/** Link secundario ("Volver a iniciar sesión"), discreto y centrado. */
export const authLinkStyle = {
  color: WINE,
  fontWeight: 600,
  fontSize: "0.9rem",
  textDecoration: "none",
} as const;
