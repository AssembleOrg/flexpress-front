"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Rating,
} from "@mui/material";
import {
  LocationOn,
  Flag,
  CalendarToday,
  AccessTime,
} from "@mui/icons-material";

interface TripDetailsCardProps {
  /**
   * Pickup address
   */
  origin: string;
  /**
   * Destination address
   */
  destination: string;
  /**
   * Scheduled date (formatted string)
   */
  scheduledDate?: string;
  /**
   * Other user info (charter or client)
   */
  otherUser?: {
    name: string;
    avatar?: string;
    role: "Chófer" | "Cliente";
    rating?: {
      average: number;
      count: number;
    };
  };
  /**
   * Trip status chip
   */
  status?: {
    label: string;
    color: "primary" | "secondary" | "success" | "warning" | "error";
  };
  /**
   * Additional metadata
   */
  metadata?: Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
  }>;
}

/**
 * TripDetailsCard Component
 *
 * Displays trip route information with modern iconography.
 * Mobile-first with clean layout.
 *
 * Features:
 * - Origin → Destination with colored icons
 * - Optional scheduled date
 * - Other user info (charter/client)
 * - Status chip
 * - Extensible metadata
 *
 * @example
 * ```tsx
 * <TripDetailsCard
 *   origin="Av. Corrientes 1234, CABA"
 *   destination="Av. Libertador 5678, Vicente López"
 *   scheduledDate="15 Ene 2025, 14:30"
 *   otherUser={{
 *     name: "Juan Pérez",
 *     avatar: "/avatar.jpg",
 *     role: "Chófer"
 *   }}
 *   status={{ label: "En Progreso", color: "primary" }}
 * />
 * ```
 */
export function TripDetailsCard({
  origin,
  destination,
  scheduledDate,
  otherUser,
  status,
  metadata = [],
}: TripDetailsCardProps) {
  return (
    <Card
      sx={{
        mb: 1.5,
        borderLeft: "4px solid",
        borderLeftColor: status?.color
          ? `${status.color}.main`
          : "primary.main",
      }}
    >
      <CardContent sx={{ p: 1.5 }}>
        {/* Header: Status + User */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1.5}
          gap={1.5}
        >
          {/* Other User Info */}
          {otherUser && (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar
                src={otherUser.avatar}
                alt={otherUser.name}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "secondary.main",
                  color: "primary.main",
                  fontWeight: 700,
                }}
              >
                {otherUser.name[0]}
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {otherUser.role}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {otherUser.name}
                </Typography>
                {/* Rating */}
                {otherUser.rating && (
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                    {otherUser.rating.count > 0 ? (
                      <>
                        <Rating
                          value={otherUser.rating.average}
                          readOnly
                          size="small"
                          precision={0.1}
                          sx={{ fontSize: "1rem" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {otherUser.rating.average.toFixed(1)} (
                          {otherUser.rating.count})
                        </Typography>
                      </>
                    ) : (
                      <Chip
                        label="Nuevo"
                        size="small"
                        color="secondary"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Status Chip */}
          {status && (
            <Chip
              label={status.label}
              color={status.color}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>

        {/* Route Section */}
        <Box mb={1.5}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, mb: 0.75, display: "block", fontSize: "0.7rem" }}
          >
            Ruta del Viaje
          </Typography>

          {/* Origin */}
          <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
            <LocationOn
              sx={{
                fontSize: 20,
                color: "primary.main",
                mt: 0.2,
              }}
            />
            <Typography variant="body2" fontSize="0.9rem" lineHeight={1.5}>
              {origin}
            </Typography>
          </Box>

          {/* Destination */}
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Flag
              sx={{
                fontSize: 20,
                color: "secondary.main",
                mt: 0.2,
              }}
            />
            <Typography
              variant="body2"
              fontSize="0.9rem"
              fontWeight={600}
              lineHeight={1.5}
            >
              {destination}
            </Typography>
          </Box>
        </Box>

        {/* Scheduled Date */}
        {scheduledDate && (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            p={1}
            mb={1.5}
            sx={{
              bgcolor: "background.default",
              borderRadius: 1.5,
            }}
          >
            <CalendarToday
              sx={{ fontSize: 18, color: "text.secondary" }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Fecha Programada
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {scheduledDate}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Additional Metadata */}
        {metadata.length > 0 && (
          <Box
            display="flex"
            flexDirection="column"
            gap={1}
            pt={2}
            sx={{
              borderTop: "1px solid",
              borderTopColor: "divider",
            }}
          >
            {metadata.map((item, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  {item.icon}
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
