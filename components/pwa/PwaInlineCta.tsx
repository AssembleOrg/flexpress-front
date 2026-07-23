"use client";

import { Box } from "@mui/material";
import { PwaCtaBody } from "@/components/pwa/PwaCtaBody";
import { usePwaPrompt } from "@/lib/hooks/usePwaPrompt";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * CTA de instalación/notificaciones embebido (no flotante), pensado para la
 * pantalla "Cuenta en Verificación". Reusa la lógica de `usePwaPrompt` y el
 * cuerpo `PwaCtaBody` en variante clara. Se auto-oculta si ya está instalado y
 * con push concedido (mode === null).
 */
export function PwaInlineCta() {
  const { isAuthenticated } = useAuthStore();
  const { mode, isIOS, isSubscribing, install, activatePush } =
    usePwaPrompt(isAuthenticated);

  if (mode === null) return null;

  return (
    <Box
      sx={{
        mt: 3,
        mb: 1,
        p: 2.25,
        textAlign: "left",
        borderRadius: 3,
        bgcolor: "rgba(56, 1, 22, 0.03)",
        border: "1px solid rgba(56, 1, 22, 0.1)",
      }}
    >
      <PwaCtaBody
        mode={mode}
        isIOS={isIOS}
        isSubscribing={isSubscribing}
        onInstall={install}
        onActivatePush={activatePush}
        variant="light"
      />
    </Box>
  );
}
