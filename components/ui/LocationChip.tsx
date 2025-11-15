import { Chip } from "@mui/material";
import { LocationOn } from "@mui/icons-material";

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
    <Chip
      icon={<LocationOn />}
      label={`${config.label}: ${truncatedAddress}`}
      size="small"
      variant="outlined"
      onClick={onClick}
      sx={{
        backgroundColor: config.bgcolor,
        color: config.color,
        borderColor: config.borderColor,
        fontWeight: 500,
        cursor: onClick ? "pointer" : "default",
        "& .MuiChip-icon": {
          color: config.color,
        },
        ...(onClick && {
          "&:hover": {
            opacity: 0.8,
            transform: "scale(1.05)",
            transition: "all 0.2s ease-in-out",
          },
        }),
      }}
    />
  );
}
