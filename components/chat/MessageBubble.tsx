"use client";

import { Box, Typography } from "@mui/material";
import type { Message } from "@/lib/types/api";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean; // true if this message is from the current user
}

/**
 * Message bubble component for chat
 * Shows different styles for own messages vs other user's messages
 */
export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
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

  // Note: Message type from api.ts doesn't include status property
  // Status tracking (sent/delivered/failed) is not currently supported by the backend
  // If needed in the future, extend the Message type in lib/types/api.ts

  return (
    <Box
      display="flex"
      justifyContent={isOwn ? "flex-end" : "flex-start"}
      mb={1}
      alignItems="flex-end"
      gap={1}
    >
      <Box
        sx={{
          maxWidth: "70%",
          borderRadius: 2,
          px: 2,
          py: 1,
          backgroundColor: isOwn ? "primary.main" : "grey.200",
          color: isOwn ? "primary.contrastText" : "text.primary",
          wordBreak: "break-word",
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
          {message.content}
        </Typography>
        <Box
          display="flex"
          alignItems="center"
          gap={0.5}
          mt={0.5}
          justifyContent={isOwn ? "flex-end" : "flex-start"}
        >
          <Typography
            variant="caption"
            sx={{
              color: isOwn ? "primary.contrastText" : "text.secondary",
              opacity: 0.7,
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
