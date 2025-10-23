"use client";

import { Chip } from "@mui/material";
import { motion } from "framer-motion";
import type { TravelMatchStatus } from "@/lib/types/api";

interface StatusChipProps {
  status: TravelMatchStatus;
}

const statusConfig: Record<
  TravelMatchStatus,
  {
    label: string;
    color:
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning";
  }
> = {
  searching: { label: "Buscando", color: "info" },
  pending: { label: "Pendiente", color: "warning" },
  accepted: { label: "Aceptado", color: "success" },
  rejected: { label: "Rechazado", color: "error" },
  completed: { label: "Completado", color: "success" },
  cancelled: { label: "Cancelado", color: "error" },
  expired: { label: "Expirado", color: "default" },
};

export function StatusChipNew({ status }: StatusChipProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Chip label={config.label} color={config.color} size="small" />
    </motion.div>
  );
}
