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
        px: 1.5,
        py: 1.25,
        mb: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
        borderLeft: "3px solid",
        borderLeftColor: "secondary.main",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <MailOutline sx={{ fontSize: 20, color: "secondary.dark" }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: "0.82rem" }}
        >
          Confirmá tu email
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.72rem", display: "block" }}
        >
          {sentTo
            ? `Revisá ${sentTo} (y la carpeta de spam).`
            : `Te mandamos un link a ${user.email}.`}
        </Typography>
      </Box>
      <Button
        size="small"
        variant="text"
        color="primary"
        onClick={resend}
        disabled={sending}
        sx={{ fontWeight: 700, flexShrink: 0 }}
      >
        {sending ? <CircularProgress size={16} /> : "Reenviar"}
      </Button>
    </Box>
  );
}
