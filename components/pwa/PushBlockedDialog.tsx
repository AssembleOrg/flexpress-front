"use client";

import { NotificationsOffRounded } from "@mui/icons-material";
import { Box, Button, Dialog, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { detectIOS, detectStandalone } from "@/lib/hooks/usePwaInstall";

const BORDO = "#380116";
const ORO = "#DCA621";
const CREMA = "#F5F2E8";

interface PushBlockedDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Pasos para reactivar el permiso según dónde corre la app. */
function getSteps(): string[] {
  if (typeof navigator === "undefined") return [];
  if (detectIOS()) {
    return [
      "Abrí Ajustes en tu iPhone",
      "Entrá en Notificaciones → Flexpress",
      "Activá Permitir notificaciones",
    ];
  }
  if (/Android/i.test(navigator.userAgent) && detectStandalone()) {
    return [
      "Mantené presionado el ícono de Flexpress",
      "Tocá Información de la app → Notificaciones",
      "Activá Permitir notificaciones",
    ];
  }
  return [
    "Tocá el candado junto a la dirección del sitio",
    "Buscá Notificaciones",
    "Elegí Permitir y volvé a abrir Flexpress",
  ];
}

/**
 * Aviso al ponerse disponible con las notificaciones bloqueadas. No bloquea:
 * el charter ya quedó en línea; solo le explica que así no se va a enterar de
 * los pedidos y cómo reactivarlas (el navegador no permite volver a pedirlo).
 */
export function PushBlockedDialog({ open, onClose }: PushBlockedDialogProps) {
  const steps = useMemo(getSteps, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "24px",
            bgcolor: CREMA,
            boxShadow: "0 24px 60px rgba(56, 1, 22, 0.28)",
            overflow: "hidden",
          },
        },
      }}
    >
      <Box sx={{ px: 3, pt: 3.5, pb: 3, textAlign: "center" }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: "auto",
            mb: 2,
            borderRadius: "20px",
            display: "grid",
            placeItems: "center",
            background: `linear-gradient(145deg, ${BORDO} 0%, #5a0b2a 100%)`,
            boxShadow: "0 10px 24px rgba(56, 1, 22, 0.3)",
            color: ORO,
          }}
        >
          <NotificationsOffRounded sx={{ fontSize: 30 }} />
        </Box>

        <Typography
          sx={{
            fontFamily: "var(--font-playfair), serif",
            fontWeight: 700,
            fontSize: "1.3rem",
            lineHeight: 1.2,
            color: BORDO,
          }}
        >
          Tus avisos están apagados
        </Typography>
        <Typography
          sx={{
            mt: 1,
            fontSize: "0.9rem",
            lineHeight: 1.45,
            color: "#503933",
          }}
        >
          Ya estás en línea, pero sin notificaciones no te vas a enterar cuando
          un cliente te elija.
        </Typography>

        <Box
          sx={{
            mt: 2.5,
            bgcolor: "#fff",
            borderRadius: "16px",
            textAlign: "left",
            boxShadow: "0 1px 2px rgba(56, 1, 22, 0.06)",
          }}
        >
          {steps.map((step, i) => (
            <Stack
              key={step}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                px: 2,
                py: 1.5,
                borderTop:
                  i === 0 ? "none" : "0.5px solid rgba(56, 1, 22, 0.1)",
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(56, 1, 22, 0.07)",
                  color: BORDO,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </Box>
              <Typography sx={{ fontSize: "0.88rem", color: "#212121" }}>
                {step}
              </Typography>
            </Stack>
          ))}
        </Box>

        <Button
          fullWidth
          onClick={onClose}
          sx={{
            mt: 3,
            py: 1.4,
            borderRadius: "14px",
            bgcolor: ORO,
            color: "#212121",
            fontWeight: 700,
            textTransform: "none",
            fontSize: "0.98rem",
            boxShadow: "0 6px 16px rgba(220, 166, 33, 0.35)",
            "&:hover": { bgcolor: "#B7850D" },
          }}
        >
          Entendido
        </Button>
      </Box>
    </Dialog>
  );
}
