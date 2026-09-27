"use client";

import { MailOutline } from "@mui/icons-material";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { getApiErrorMessage } from "@/lib/utils/apiError";

/**
 * Recordatorio para confirmar el email. No bloquea nada: solo aparece mientras
 * el backend informa `emailVerifiedAt: null` (una sesión vieja sin el campo no
 * lo muestra hasta refrescar el perfil).
 */
export function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (!user || user.emailVerifiedAt !== null) return null;

  const resend = async () => {
    setSending(true);
    try {
      await authApi.resendEmailVerification();
      setSentTo(user.email);
      toast.success("Te mandamos el mail de confirmación");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "No pudimos enviar el mail. Probá más tarde.",
        ),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.25,
        pr: 1.5,
        mb: 2,
        borderRadius: "16px",
        bgcolor: "#F5F2E8",
        border: "1px solid rgba(220,166,33,0.35)",
        boxShadow:
          "0 1px 2px rgba(56,1,22,0.04), 0 8px 20px -12px rgba(56,1,22,0.18)",
        "@keyframes bannerIn": {
          from: { opacity: 0, transform: "translateY(-6px)" },
          to: { opacity: 1, transform: "none" },
        },
        animation: "bannerIn 0.35s ease-out both",
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.main",
          color: "secondary.main",
        }}
      >
        <MailOutline sx={{ fontSize: 19 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            fontSize: "0.85rem",
            color: "primary.main",
          }}
        >
          Confirmá tu email
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.74rem",
            display: "block",
            color: "#6B5E5E",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {sentTo
            ? `Revisá ${sentTo} (y la carpeta de spam).`
            : `Te mandamos un link a ${user.email}.`}
        </Typography>
      </Box>
      <Button
        size="small"
        variant="contained"
        color="secondary"
        disableElevation
        onClick={resend}
        disabled={sending || !!sentTo}
        sx={{
          flexShrink: 0,
          minWidth: 84,
          borderRadius: 999,
          px: 1.75,
          fontWeight: 700,
          fontSize: "0.78rem",
          textTransform: "none",
          color: "primary.main",
          "&.Mui-disabled": {
            bgcolor: "rgba(220,166,33,0.18)",
            color: "primary.main",
          },
        }}
      >
        {sending ? (
          <CircularProgress size={14} color="inherit" />
        ) : sentTo ? (
          "Enviado ✓"
        ) : (
          "Reenviar"
        )}
      </Button>
    </Box>
  );
}
