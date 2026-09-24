"use client";

import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Box, Typography } from "@mui/material";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import type { Message } from "@/lib/types/api";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean; // true if this message is from the current user
  senderAvatar?: string; // Avatar URL of the sender (only shown for other user)
  senderName?: string; // Name of sender for avatar fallback
  /** Primer mensaje de un grupo consecutivo del mismo emisor */
  isFirstInGroup?: boolean;
  /** Último mensaje del grupo: lleva avatar y hora */
  isLastInGroup?: boolean;
}

const RADIUS = 20;
const TIGHT = 6;

export const bubbleEnter = {
  animation: "bubbleIn 180ms ease-out",
  "@keyframes bubbleIn": {
    from: { opacity: 0, transform: "translateY(4px)" },
    to: { opacity: 1, transform: "none" },
  },
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
};

/**
 * Burbuja de chat estilo iOS: agrupa mensajes consecutivos (radios "pegados"),
 * muestra avatar y hora sólo en el último del grupo.
 */
export function MessageBubble({
  message,
  isOwn,
  senderAvatar,
  senderName,
  isFirstInGroup = true,
  isLastInGroup = true,
}: MessageBubbleProps) {
  // Validar estructura del mensaje
  if (!message?.content || !message?.createdAt) {
    console.warn("⚠️ [MessageBubble] Mensaje con datos incompletos:", message);
    return null;
  }

  const formatTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      if (Number.isNaN(date.getTime())) {
        console.warn("⚠️ [MessageBubble] createdAt inválido:", createdAt);
        return "";
      }
      return date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Esquinas del lado del emisor se "pegan" dentro del grupo
  const top = isFirstInGroup ? RADIUS : TIGHT;
  const bottom = isLastInGroup ? RADIUS : TIGHT;
  const borderRadius = isOwn
    ? `${RADIUS}px ${top}px ${bottom}px ${RADIUS}px`
    : `${top}px ${RADIUS}px ${RADIUS}px ${bottom}px`;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: 1,
        mt: isFirstInGroup ? 1 : 0.25,
        ...bubbleEnter,
      }}
    >
      {/* Avatar sólo en el último del grupo; el resto reserva el espacio */}
      {!isOwn &&
        (isLastInGroup ? (
          <SignedAvatar
            value={senderAvatar}
            alt={senderName || "Usuario"}
            sx={{
              width: 28,
              height: 28,
              bgcolor: "secondary.main",
              color: "primary.main",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            {senderName?.[0]?.toUpperCase() || "U"}
          </SignedAvatar>
        ) : (
          <Box sx={{ width: 28, flexShrink: 0 }} />
        ))}

      <Box
        sx={{
          maxWidth: { xs: "78%", md: "65%" },
          borderRadius,
          px: 1.75,
          py: 1,
          overflowWrap: "anywhere",
          ...(isOwn
            ? {
                background: "linear-gradient(135deg, #380116 0%, #5a0a2f 100%)",
                color: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(56, 1, 22, 0.18)",
              }
            : {
                bgcolor: "#FFFFFF",
                color: "text.primary",
                border: "1px solid rgba(56, 1, 22, 0.06)",
                boxShadow: "0 1px 2px rgba(56, 1, 22, 0.06)",
              }),
        }}
      >
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "pre-wrap",
            color: "inherit",
            fontSize: "0.95rem",
            lineHeight: 1.4,
          }}
        >
          {message.content}
        </Typography>

        {isLastInGroup && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 0.4,
              mt: 0.25,
              opacity: isOwn ? 0.85 : 0.6,
            }}
          >
            <Typography
              component="span"
              sx={{ fontSize: "0.68rem", color: "inherit", lineHeight: 1 }}
            >
              {formatTime(message.createdAt)}
            </Typography>
            {isOwn &&
              (message.isRead ? (
                <DoneAllIcon
                  aria-label="Leído"
                  sx={{ fontSize: 14, color: "secondary.light" }}
                />
              ) : (
                <DoneIcon aria-label="Enviado" sx={{ fontSize: 14 }} />
              ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
