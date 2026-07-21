"use client";

import { Close as CloseIcon } from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { TripDetailsCard } from "@/components/trip/TripDetailsCard";
import type { Trip } from "@/lib/types/api";
import { formatDateTime } from "@/lib/utils/formatDate";

interface TripDetailModalProps {
  trip: Trip | null;
  open: boolean;
  onClose: () => void;
}

// Mapea el status del viaje a etiqueta + color del chip de TripDetailsCard.
function getStatusChip(status: Trip["status"]): {
  label: string;
  color: "primary" | "success" | "warning" | "error";
} {
  switch (status) {
    case "completed":
      return { label: "Completado", color: "success" };
    case "charter_completed":
      return { label: "Esperando cliente", color: "warning" };
    case "cancelled":
      return { label: "Cancelado", color: "error" };
    default:
      return { label: "Pendiente", color: "primary" };
  }
}

/**
 * Modal de detalle de viaje para el panel admin. Reutiliza TripDetailsCard
 * (origen/destino, carga, equipo, status) sin la parte de reportes.
 * Se abre desde la tabla de viajes (botón "Ver detalles" en desktop, tap en
 * la card en mobile).
 */
export function TripDetailModal({ trip, open, onClose }: TripDetailModalProps) {
  if (!trip) return null;

  const match = trip.travelMatch;
  const snapshot = match?.personnel?.snapshot;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "3px solid #dca621",
          pb: 1.5,
        }}
      >
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Viaje
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            #{trip.id.substring(0, 8)}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TripDetailsCard
          origin={match?.pickupAddress ?? trip.address}
          destination={match?.destinationAddress ?? "—"}
          scheduledDate={
            trip.scheduledDate ? formatDateTime(trip.scheduledDate) : undefined
          }
          cargo={trip.cargoDescription ?? match?.cargoDescription}
          status={getStatusChip(trip.status)}
          personnel={
            snapshot?.driver
              ? { driver: snapshot.driver, helpers: snapshot.helpers ?? [] }
              : null
          }
        />

        {/* Cliente y conductor titular del viaje */}
        <Box sx={{ mt: 1, px: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Cliente
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {trip.user?.name ?? "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Conductor (titular)
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {trip.charter?.name ?? "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Fecha de creación
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {formatDateTime(trip.createdAt)}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
