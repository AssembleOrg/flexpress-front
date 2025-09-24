import { LocationOn, Route } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import type { Trip } from "@/lib/types/trip";
import StatusChip from "./StatusChip";
import UserProfile from "./UserProfile";

interface TripCardProps {
  trip: Trip;
  variant?: "client" | "driver" | "admin";
  onAccept?: (tripId: string) => void;
  onView?: (tripId: string) => void;
  onCancel?: (tripId: string) => void;
}

export default function TripCard({
  trip,
  variant = "client",
  onAccept,
  onView,
  onCancel,
}: TripCardProps) {
  const isDriverView = variant === "driver";
  const isClientView = variant === "client";
  const isAdminView = variant === "admin";

  const displayUser = isClientView ? trip.driver : trip.client;
  const showPrice = trip.finalPrice || trip.suggestedPrice;

  return (
    <Card
      sx={{
        mb: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        {/* Header con estado */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <StatusChip status={trip.status} />
          <Typography
            variant="h5"
            component="span"
            sx={{
              fontWeight: 700,
              color: "secondary.main",
            }}
          >
            ${showPrice.toLocaleString()}
          </Typography>
        </Box>

        {/* Ubicaciones */}
        <Box mb={2}>
          <Box display="flex" alignItems="center" mb={1}>
            <LocationOn sx={{ color: "primary.main", mr: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Origen: {trip.origin}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Route sx={{ color: "primary.main", mr: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Destino: {trip.destination}
            </Typography>
          </Box>
        </Box>

        {/* Descripción */}
        {trip.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, fontStyle: "italic" }}
          >
            "{trip.description}"
          </Typography>
        )}

        {/* Usuario (conductor o cliente) */}
        {displayUser && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <UserProfile
                user={{
                  firstName: displayUser.firstName,
                  lastName: displayUser.lastName,
                  avatar: displayUser.avatar,
                  rating: displayUser.rating,
                }}
                subtitle={isClientView ? "Conductor" : "Cliente"}
              />
            </Box>
          </>
        )}

        {/* Botones de acción */}
        <Box display="flex" gap={1} mt={2}>
          {isDriverView && trip.status === "searching" && onAccept && (
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              onClick={() => onAccept(trip.id)}
              sx={{ fontWeight: 600 }}
            >
              Aceptar Viaje
            </Button>
          )}

          {(isClientView || isAdminView) && onView && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => onView(trip.id)}
              sx={{ flexGrow: 1 }}
            >
              Ver Detalles
            </Button>
          )}

          {trip.status === "negotiating" && onView && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => onView(trip.id)}
              sx={{ flexGrow: 1, fontWeight: 600 }}
            >
              Ir al Chat
            </Button>
          )}

          {(trip.status === "searching" || trip.status === "negotiating") &&
            onCancel && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => onCancel(trip.id)}
                size="small"
              >
                Cancelar
              </Button>
            )}
        </Box>
      </CardContent>
    </Card>
  );
}
