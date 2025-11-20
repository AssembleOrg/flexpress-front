"use client";

import { Avatar, Box } from "@mui/material";

interface TypingIndicatorProps {
  userName?: string;
  userAvatar?: string;
}

/**
 * Typing indicator component
 * Shows animated dots to indicate that the other user is typing
 * Now with avatar support for better visual
 */
export function TypingIndicator({
  userName = "Usuario",
  userAvatar,
}: TypingIndicatorProps) {
  return (
    <Box
      display="flex"
      justifyContent="flex-start"
      mb={1}
      alignItems="flex-end"
      gap={1}
    >
      {/* Avatar */}
      <Avatar
        src={userAvatar}
        alt={userName}
        sx={{
          width: 32,
          height: 32,
          bgcolor: "secondary.main",
          color: "primary.main",
          fontSize: "0.875rem",
          fontWeight: 700,
        }}
      >
        {userName[0]}
      </Avatar>

      {/* Typing bubble with animated dots */}
      <Box
        sx={{
          borderRadius: 2,
          px: 2,
          py: 1.5,
          backgroundColor: "grey.200",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          minHeight: 40,
        }}
      >
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
