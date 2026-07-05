import {
  ArrowForward as ArrowIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import Link from "next/link";
import type { Trip } from "@/lib/types/api";

interface MobileTripAdminCardProps {
  trip: Trip;
  onClick?: () => void;
}

export function MobileTripAdminCard({
  trip,
  onClick,
}: MobileTripAdminCardProps) {
  const truncatedId = trip.id.substring(0, 8);
  const truncatedAddress =
    trip.address.length > 30
      ? trip.address.substring(0, 30) + "..."
      : trip.address;
  const cargo = trip.cargoDescription ?? trip.travelMatch?.cargoDescription;
  const snapshot = trip.travelMatch?.personnel?.snapshot;
  const helpersCount = snapshot?.helpers?.length ?? 0;

  // Evita que los <Link> internos (perfiles) abran el modal de detalle.
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 2,
        borderLeft: "4px solid",
        borderLeftColor: "secondary.main",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.1s ease",
        "&:active": onClick ? { transform: "scale(0.99)" } : undefined,
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1}>
          {/* Trip ID + affordance */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize="0.75rem"
            >
              ID: {truncatedId}...
            </Typography>
            {onClick && (
              <ChevronRightIcon sx={{ fontSize: 20, color: "#b7850d" }} />
            )}
          </Stack>

          {/* User → Charter with arrow */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2" fontSize="0.85rem">
              Usuario:{" "}
              {trip.user ? (
                <Link
                  href={`/admin/users/${trip.user.id}`}
                  onClick={stop}
                  style={{
                    color: "#380116",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  {trip.user.name}
                </Link>
              ) : (
                "N/A"
              )}
            </Typography>

            <ArrowIcon sx={{ fontSize: 16, color: "text.secondary" }} />

            <Typography variant="body2" fontSize="0.85rem">
              Conductor:{" "}
              {trip.charter ? (
                <Link
                  href={`/admin/users/${trip.charter.id}`}
                  onClick={stop}
                  style={{
                    color: "#380116",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  {trip.charter.name}
                </Link>
              ) : (
                "N/A"
              )}
            </Typography>
          </Stack>

          {/* Address truncated */}
          <Typography variant="body2" fontSize="0.85rem" color="text.secondary">
            Dirección: {truncatedAddress}
          </Typography>

          {/* Carga */}
          {cargo && (
            <Typography
              variant="body2"
              fontSize="0.85rem"
              color="text.secondary"
            >
              Carga:{" "}
              {cargo.length > 40 ? cargo.substring(0, 40) + "..." : cargo}
            </Typography>
          )}

          {/* Equipo */}
          {snapshot?.driver && (
            <Typography
              variant="body2"
              fontSize="0.85rem"
              color="text.secondary"
            >
              Equipo: {snapshot.driver.name}
              {helpersCount > 0 &&
                ` +${helpersCount} ayudante${helpersCount > 1 ? "s" : ""}`}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
