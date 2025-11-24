"use client";

import { LocationOn } from "@mui/icons-material";
import { Chip } from "@mui/material";
import { motion } from "framer-motion";

const MotionChip = motion.create(Chip);

interface LocationChipProps {
  type: "pickup" | "destination";
  address: string;
  maxLength?: number;
  onClick?: () => void;
}

const locationConfig = {
  pickup: {
    label: "Origen",
    bgcolor: "#E3F2FD",
    color: "#1976D2",
    borderColor: "#1976D2",
  },
  destination: {
    label: "Destino",
    bgcolor: "#FFF4E5",
    color: "#ED6C02",
    borderColor: "#ED6C02",
  },
};

export function LocationChip({
  type,
  address,
  maxLength = 30,
  onClick,
}: LocationChipProps) {
  const config = locationConfig[type];
  const truncatedAddress =
    address.length > maxLength ? `${address.slice(0, maxLength)}...` : address;

  return (
    <MotionChip
      icon={<LocationOn />}
      label={`${config.label}: ${truncatedAddress}`}
      size="small"
      variant="outlined"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 15,
        mass: 0.5,
      }}
      whileHover={
        onClick
          ? {
              scale: 1.08,
              y: -2,
              transition: { duration: 0.2 },
            }
          : {}
      }
      whileTap={onClick ? { scale: 0.95 } : {}}
      sx={{
        backgroundColor: config.bgcolor,
        color: config.color,
        borderColor: config.borderColor,
        fontWeight: 500,
        cursor: onClick ? "pointer" : "default",
        "& .MuiChip-icon": {
          color: config.color,
        },
      }}
    />
  );
}
