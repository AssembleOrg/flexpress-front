"use client";

import { Close as CloseIcon } from "@mui/icons-material";
import { Box, IconButton, Slide } from "@mui/material";
import { useEffect, useState } from "react";
import { PwaCtaBody } from "@/components/pwa/PwaCtaBody";
import { usePwaPrompt } from "@/lib/hooks/usePwaPrompt";
import { useAuthStore } from "@/lib/stores/authStore";

const DISMISS_KEY = "fp_install_prompt_dismissed";
const BORDO = "#380116";

/**
 * Tarjeta flotante (bottom sheet) para instalar el PWA y activar notificaciones.
 * Estética iOS-premium, branding Flexpress. Global, aparece tras login en
 * cualquier página. La lógica de qué ofrecer vive en `usePwaPrompt` y el cuerpo
 * en `PwaCtaBody` (compartidos con el CTA inline de la pantalla pendiente).
 */
export function InstallPrompt() {
  const { isAuthenticated } = useAuthStore();
  const { mode, isIOS, isSubscribing, install, activatePush } =
    usePwaPrompt(isAuthenticated);

  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(
      typeof window !== "undefined" &&
        localStorage.getItem(DISMISS_KEY) === "1",
    );
  }, []);

  useEffect(() => {
    setOpen(isAuthenticated && !dismissed && mode !== null);
  }, [isAuthenticated, dismissed, mode]);

  if (!open || mode === null) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
    setOpen(false);
  };

  const handleInstall = async () => {
    if (await install()) setOpen(false);
  };

  const handleActivatePush = async () => {
    if (await activatePush()) setOpen(false);
  };

  return (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Box
        role="dialog"
        aria-label="Instalar Flexpress"
        sx={{
          position: "fixed",
          zIndex: (t) => t.zIndex.snackbar + 1,
          left: { xs: 12, sm: "auto" },
          right: { xs: 12, sm: 24 },
          bottom: { xs: 12, sm: 24 },
          width: { xs: "auto", sm: 380 },
          maxWidth: "calc(100vw - 24px)",
          borderRadius: 4,
          overflow: "hidden",
          color: "#fff",
          background: `linear-gradient(155deg, ${BORDO} 0%, #4b011d 100%)`,
          border: "1px solid rgba(220, 166, 33, 0.25)",
          boxShadow:
            "0 12px 40px rgba(56, 1, 22, 0.45), 0 2px 8px rgba(0,0,0,0.25)",
          backdropFilter: "saturate(180%) blur(6px)",
        }}
      >
        {/* Barra superior con "grabber" tipo iOS + cerrar */}
        <Box sx={{ position: "relative", pt: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 4,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.28)",
              mx: "auto",
            }}
          />
          <IconButton
            onClick={handleDismiss}
            aria-label="Cerrar"
            size="small"
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              color: "rgba(255,255,255,0.7)",
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ px: 2.5, pb: 2.5, pt: 1 }}>
          <PwaCtaBody
            mode={mode}
            isIOS={isIOS}
            isSubscribing={isSubscribing}
            onInstall={handleInstall}
            onActivatePush={handleActivatePush}
            variant="dark"
          />
        </Box>
      </Box>
    </Slide>
  );
}
