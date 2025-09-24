import { Chip, type ChipProps } from "@mui/material";
import type { Trip } from "@/lib/types/trip";

interface StatusChipProps {
  status: Trip["status"];
  size?: ChipProps["size"];
}

const statusConfig = {
  searching: {
    label: "Buscando Conductor",
    color: "info" as const,
  },
  negotiating: {
    label: "Negociando",
    color: "warning" as const,
  },
  confirmed: {
    label: "Confirmado",
    color: "primary" as const,
  },
  in_progress: {
    label: "En Viaje",
    color: "warning" as const,
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
