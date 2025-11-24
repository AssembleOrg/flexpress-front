"use client";

import { Flag, LocationOn } from "@mui/icons-material";
import { Avatar, Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const MotionBox = motion.create(Box);

interface RouteTimelineProps {
  originInput: ReactNode;
  destinationInput: ReactNode;
}

export function RouteTimeline({
  originInput,
  destinationInput,
}: RouteTimelineProps) {
  return (
    <Box sx={{ position: "relative", pl: { xs: 0, sm: 1 } }}>
      {/* Origen */}
      <MotionBox
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, type: "spring" }}
        sx={{ position: "relative", mb: 4 }}
      >
        <Box display="flex" alignItems="flex-start" gap={2}>
          {/* Ícono circular animado */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              type: "spring",
              stiffness: 150,
            }}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 48,
                height: 48,
                boxShadow: "0 4px 12px rgba(56, 1, 22, 0.3)",
              }}
            >
              <LocationOn sx={{ fontSize: 28 }} />
            </Avatar>
          </motion.div>

          {/* Input de origen */}
          <Box flex={1}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                display: "block",
                mb: 1,
              }}
            >
              Punto de Origen
            </Typography>
            {originInput}
          </Box>
        </Box>

        {/* Línea conectora vertical */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: 23, sm: 24 },
            top: 56,
            width: 3,
            height: 60,
            bgcolor: "secondary.main",
            borderRadius: 1.5,
            zIndex: -1,
          }}
        />
      </MotionBox>

      {/* Destino */}
      <MotionBox
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
        sx={{ position: "relative" }}
      >
        <Box display="flex" alignItems="flex-start" gap={2}>
          {/* Ícono circular animado */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              type: "spring",
              stiffness: 150,
            }}
          >
            <Avatar
              sx={{
                bgcolor: "secondary.main",
                width: 48,
                height: 48,
                color: "primary.main",
                boxShadow: "0 4px 12px rgba(220, 166, 33, 0.4)",
              }}
            >
              <Flag sx={{ fontSize: 28 }} />
            </Avatar>
          </motion.div>

          {/* Input de destino */}
          <Box flex={1}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                color: "secondary.main",
                display: "block",
                mb: 1,
              }}
            >
              Punto de Destino
            </Typography>
            {destinationInput}
          </Box>
        </Box>
      </MotionBox>
    </Box>
  );
}
