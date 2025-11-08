"use client";

import { Box, Typography } from "@mui/material";

interface TypingIndicatorProps {
  userName?: string;
}

/**
 * Typing indicator component
 * Shows animated dots to indicate that the other user is typing
 */
export function TypingIndicator({
  userName = "El otro usuario",
}: TypingIndicatorProps) {
  return (
    <Box display="flex" alignItems="center" gap={0.5} my={2}>
      <Typography variant="caption" color="text.secondary">
        {userName} está escribiendo
      </Typography>
      <Box display="flex" gap={0.3}>
        <TypingDot delay={0} />
        <TypingDot delay={0.15} />
        <TypingDot delay={0.3} />
      </Box>
    </Box>
  );
}

interface TypingDotProps {
  delay: number;
}

function TypingDot({ delay }: TypingDotProps) {
  return (
    <Box
      component="span"
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "text.secondary",
        animation: `typing 1.4s infinite`,
        animationDelay: `${delay}s`,
        "@keyframes typing": {
          "0%, 60%, 100%": {
            opacity: 0.5,
            transform: "translateY(0)",
          },
          "30%": {
            opacity: 1,
            transform: "translateY(-10px)",
          },
        },
      }}
    />
  );
}
