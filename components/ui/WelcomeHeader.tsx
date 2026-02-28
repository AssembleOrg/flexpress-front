"use client";

import { Avatar, Box, Chip, Tooltip, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const MotionBox = motion.create(Box);

interface WelcomeHeaderProps {
  userName?: string;
  userRole?: "client" | "charter";
  greeting?: string;
}

export function WelcomeHeader({ userName, userRole, greeting }: WelcomeHeaderProps) {
  const router = useRouter();
  const firstName = userName?.split(" ")[0] || "Usuario";
  const initial = userName?.[0]?.toUpperCase() || "?";
  const roleLabel = userRole === "charter" ? "Chófer" : "Cliente";

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      sx={{ mb: 3 }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
        >
          <Tooltip title="Ver perfil" arrow placement="right">
            <Avatar
              onClick={() => router.push("/profile")}
              sx={{
                width: 56,
                height: 56,
                bgcolor: "primary.main",
                fontSize: "1.5rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 12px rgba(56, 1, 22, 0.2)",
                },
              }}
            >
              {initial}
            </Avatar>
          </Tooltip>
        </motion.div>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            {greeting ?? `Hola, ${firstName}`}
          </Typography>
          <Chip
            label={roleLabel}
            size="small"
            color="secondary"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>
    </MotionBox>
  );
}
