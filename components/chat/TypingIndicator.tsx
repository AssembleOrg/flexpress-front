"use client";

import { Box } from "@mui/material";
import { bubbleEnter } from "@/components/chat/MessageBubble";
import { SignedAvatar } from "@/components/ui/SignedAvatar";

interface TypingIndicatorProps {
  userName?: string;
  userAvatar?: string;
}

/**
 * Indicador "escribiendo…" con el mismo estilo que la burbuja ajena.
 */
export function TypingIndicator({
  userName = "Usuario",
  userAvatar,
}: TypingIndicatorProps) {
  return (
    <Box
      role="status"
      aria-label={`${userName} está escribiendo`}
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-end",
        gap: 1,
        mt: 1,
        ...bubbleEnter,
      }}
    >
      <SignedAvatar
        value={userAvatar}
        alt={userName}
        sx={{
          width: 28,
          height: 28,
          bgcolor: "secondary.main",
          color: "primary.main",
          fontSize: "0.8rem",
          fontWeight: 700,
        }}
      >
        {userName[0]?.toUpperCase()}
      </SignedAvatar>

      <Box
        sx={{
          borderRadius: "20px 20px 20px 6px",
          px: 1.75,
          height: 36,
          bgcolor: "#FFFFFF",
          border: "1px solid rgba(56, 1, 22, 0.06)",
          boxShadow: "0 1px 2px rgba(56, 1, 22, 0.06)",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <TypingDot delay={0} />
        <TypingDot delay={0.15} />
        <TypingDot delay={0.3} />
      </Box>
    </Box>
  );
}

function TypingDot({ delay }: { delay: number }) {
  return (
    <Box
      component="span"
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: "text.secondary",
        animation: "typing 1.2s infinite ease-in-out",
        animationDelay: `${delay}s`,
        "@keyframes typing": {
          "0%, 60%, 100%": { opacity: 0.35, transform: "translateY(0)" },
          "30%": { opacity: 1, transform: "translateY(-4px)" },
        },
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      }}
    />
  );
}
