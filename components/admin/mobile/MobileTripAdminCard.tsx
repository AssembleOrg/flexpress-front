import Link from "next/link";
import { Card, CardContent, Typography, Stack } from "@mui/material";
import { ArrowForward as ArrowIcon } from "@mui/icons-material";
import type { Trip } from "@/lib/types/api";

interface MobileTripAdminCardProps {
  trip: Trip;
}

export function MobileTripAdminCard({ trip }: MobileTripAdminCardProps) {
  const truncatedId = trip.id.substring(0, 8);
  const truncatedAddress = trip.address.length > 30 ? trip.address.substring(0, 30) + "..." : trip.address;

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: "4px solid",
        borderLeftColor: "secondary.main",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1}>
          {/* Trip ID */}
          <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
            ID: {truncatedId}...
          </Typography>

          {/* User → Charter with arrow */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2" fontSize="0.85rem">
              Usuario:{" "}
              {trip.user ? (
                <Link
                  href={`/admin/users/${trip.user.id}`}
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
        </Stack>
      </CardContent>
    </Card>
  );
}
