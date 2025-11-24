import { Chip, type ChipProps } from "@mui/material";
import type { Trip } from "@/lib/types/trip";

interface StatusChipProps {
  status: Trip["status"];
  size?: ChipProps["size"];
}

const statusConfig: Record<Trip["status"], { label: string; color: "primary" | "warning" | "success" | "error" }> = {
  pending: {
    label: "Pendiente",
    color: "warning" as const,
  },
  charter_completed: {
    label: "Esperando Confirmación",
    color: "primary" as const,
  },
  completed: {
    label: "Finalizado",
    color: "success" as const,
  },
  cancelled: {
    label: "Cancelado",
    color: "error" as const,
  },
};

export default function StatusChip({
  status,
  size = "medium",
}: StatusChipProps) {
  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{
        fontWeight: 500,
        textTransform: "none",
      }}
    />
  );
}
