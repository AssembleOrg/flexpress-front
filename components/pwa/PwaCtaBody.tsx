"use client";

import {
  AddBoxOutlined as AddBoxOutlinedIcon,
  InstallMobile as InstallMobileIcon,
  IosShare as IosShareIcon,
  NotificationsActive as NotificationsActiveIcon,
} from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { PwaPromptMode } from "@/lib/hooks/usePwaPrompt";

const ORO = "#DCA621";
const BORDO = "#380116";

interface PwaCtaBodyProps {
  mode: Exclude<PwaPromptMode, null>;
  isIOS: boolean;
  isSubscribing: boolean;
  onInstall: () => void;
  onActivatePush: () => void;
  /** dark = sobre gradiente bordo (tarjeta flotante); light = sobre fondo claro (inline) */
  variant?: "dark" | "light";
  /** Oculta el encabezado (ícono + título) — útil inline donde ya hay contexto */
  hideHeader?: boolean;
}

/**
 * Cuerpo compartido del CTA de PWA (título + acción según plataforma).
 * Reutilizado por `InstallPrompt` (flotante, variant dark) y por la pantalla
 * "Cuenta en Verificación" (inline, variant light).
 */
export function PwaCtaBody({
  mode,
  isIOS,
  isSubscribing,
  onInstall,
  onActivatePush,
  variant = "dark",
  hideHeader = false,
}: PwaCtaBodyProps) {
  const dark = variant === "dark";

  const titleColor = dark ? "#fff" : BORDO;
  const subColor = dark ? "rgba(255,255,255,0.7)" : "#503933";
  const iconBoxBg = dark ? "rgba(220, 166, 33, 0.15)" : "rgba(56, 1, 22, 0.06)";
  const iconBoxBorder = dark
    ? "rgba(220, 166, 33, 0.4)"
    : "rgba(56, 1, 22, 0.15)";
  const iconColor = dark ? ORO : BORDO;
  const stepBg = dark ? "rgba(255,255,255,0.08)" : "rgba(56, 1, 22, 0.05)";
  const stepText = dark ? "rgba(255,255,255,0.9)" : "#212121";
  const footNote = dark ? "rgba(255,255,255,0.55)" : "#7a6a63";

  const ctaSx = {
    mt: 0.5,
    bgcolor: ORO,
    color: "#212121",
    fontWeight: 700,
    borderRadius: 2.5,
    py: 1.25,
    boxShadow: "0 4px 14px rgba(220, 166, 33, 0.35)",
    "&:hover": {
      bgcolor: "#B7850D",
      transform: "translateY(-1px)",
      boxShadow: "0 6px 18px rgba(220, 166, 33, 0.45)",
    },
  } as const;

  return (
    <>
      {!hideHeader && (
        <Stack direction="row" spacing={1.75} alignItems="center" mb={1.5}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              bgcolor: iconBoxBg,
              border: `1px solid ${iconBoxBorder}`,
              color: iconColor,
            }}
          >
            {mode === "install" ? (
              <InstallMobileIcon />
            ) : (
              <NotificationsActiveIcon />
            )}
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-playfair), serif",
                fontWeight: 700,
                fontSize: "1.15rem",
                lineHeight: 1.2,
                color: titleColor,
              }}
            >
              {mode === "install" ? "Instalá Flexpress" : "Activá tus avisos"}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.82rem",
                color: subColor,
                lineHeight: 1.35,
                mt: 0.25,
              }}
            >
              {mode === "install"
                ? "Acceso directo y notificaciones en tu inicio"
                : "Enterate al instante cuando aprobemos tu cuenta"}
            </Typography>
          </Box>
        </Stack>
      )}

      {mode === "install" && isIOS ? (
        // iOS: instrucciones manuales (Safari no dispara beforeinstallprompt)
        <>
          <Stack spacing={1} mb={2} mt={0.5}>
            <IosStep
              icon={<IosShareIcon sx={{ fontSize: 18 }} />}
              text="Tocá el botón Compartir en la barra de Safari"
              bg={stepBg}
              iconColor={iconColor}
              textColor={stepText}
            />
            <IosStep
              icon={<AddBoxOutlinedIcon sx={{ fontSize: 18 }} />}
              text='Elegí "Añadir a pantalla de inicio"'
              bg={stepBg}
              iconColor={iconColor}
              textColor={stepText}
            />
          </Stack>
          <Typography
            sx={{ fontSize: "0.75rem", color: footNote, textAlign: "center" }}
          >
            Después abrí Flexpress desde el ícono para recibir avisos.
          </Typography>
        </>
      ) : mode === "install" ? (
        // Android / Desktop: prompt nativo
        <Button
          fullWidth
          onClick={onInstall}
          startIcon={<InstallMobileIcon />}
          sx={ctaSx}
        >
          Instalar app
        </Button>
      ) : (
        // push: ya instalado, falta permiso
        <Button
          fullWidth
          onClick={onActivatePush}
          disabled={isSubscribing}
          startIcon={<NotificationsActiveIcon />}
          sx={ctaSx}
        >
          {isSubscribing ? "Activando…" : "Activar notificaciones"}
        </Button>
      )}
    </>
  );
}

function IosStep({
  icon,
  text,
  bg,
  iconColor,
  textColor,
}: {
  icon: React.ReactNode;
  text: string;
  bg: string;
  iconColor: string;
  textColor: string;
}) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1.5,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          bgcolor: bg,
          color: iconColor,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontSize: "0.85rem", color: textColor }}>
        {text}
      </Typography>
    </Stack>
  );
}
