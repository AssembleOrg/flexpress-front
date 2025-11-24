"use client";

import { LocationSearching, MyLocation, TouchApp } from "@mui/icons-material";
import { Box, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";

const MotionPaper = motion.create(Paper);

export function InstructionBanner() {
  return (
    <MotionPaper
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.3,
        type: "spring",
        stiffness: 100,
      }}
      elevation={2}
      sx={{
        p: 2.5,
        mb: 3,
        bgcolor: "primary.main",
        color: "white",
        borderRadius: 2,
        border: "2px solid",
        borderColor: "secondary.main",
      }}
    >
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1}>
          <LocationSearching sx={{ fontSize: 28, color: "secondary.main" }} />
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 0.5, color: "secondary.main" }}
            >
              Paso 1: Marca tu zona
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Busca tu dirección aproximada
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            width: 40,
            height: 2,
            bgcolor: "rgba(255, 255, 255, 0.5)",
            display: { xs: "none", sm: "block" },
          }}
        />

        <Box display="flex" alignItems="center" gap={1}>
          <TouchApp sx={{ fontSize: 28, color: "secondary.main" }} />
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 0.5, color: "secondary.main" }}
            >
              Paso 2: Ajusta el pin
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Arrastra el marcador al lugar exacto
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            width: 40,
            height: 2,
            bgcolor: "rgba(255, 255, 255, 0.5)",
            display: { xs: "none", sm: "block" },
          }}
        />

        <Box display="flex" alignItems="center" gap={1}>
          <MyLocation sx={{ fontSize: 28, color: "secondary.main" }} />
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 0.5, color: "secondary.main" }}
            >
              Precisión exacta
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Tu domicilio o lugar específico
            </Typography>
          </Box>
        </Box>
      </Box>
    </MotionPaper>
  );
}
