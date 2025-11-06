"use client";

import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

interface MatchExpirationTimerProps {
  expiresAt: string; // ISO timestamp
}

export function MatchExpirationTimer({ expiresAt }: MatchExpirationTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const expirationTime = new Date(expiresAt).getTime();
      const diff = expirationTime - now;

      if (diff <= 0) {
        setTimeRemaining("Expirado");
        setIsWarning(true);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        setIsWarning(minutes < 5);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: isWarning ? "warning.main" : "text.secondary",
        }}
      >
        ⏱️ Expira en: {timeRemaining}
      </Typography>
    </Box>
  );
}
