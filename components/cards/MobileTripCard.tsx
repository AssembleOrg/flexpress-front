"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Rating,
} from "@mui/material";
import { LocationOn, Flag, Star } from "@mui/icons-material";
import Image from "next/image";

interface MobileTripCardProps {
  /**
   * ID del trip/match (para navegación)
   */
  id: string;
  /**
   * Dirección de origen
   */
  origin: string;
  /**
   * Dirección de destino
   */
  destination: string;
  /**
   * Fecha del viaje (formato legible)
   */
  date: string;
  /**
   * Info del otro usuario (charter si eres client, client si eres driver)
   */
  otherUser: {
    name: string;
    avatar?: string;
    rating?: number;
  };
  /**
   * Texto del botón de acción
   */
  actionLabel?: string;
  /**
   * Callback del botón de acción
   */
  onAction?: () => void;
  /**
   * Mostrar decoración de camioneta
   * @default false
   */
  showTruckIcon?: boolean;
}

/**
 * MobileTripCard Component
 *
 * Card compacta mobile-first para mostrar viajes en historial o dashboard.
 *
 * Features:
 * - Layout horizontal optimizado para mobile
 * - Iconografía moderna (LocationOn, Flag)
 * - Avatar + rating del otro usuario
 * - Botón de acción opcional
 * - Decoración opcional con logo camioneta
 *
 * @example
 * ```tsx
 * <MobileTripCard
 *   id="match-123"
 *   origin="Av. Corrientes 1234"
 *   destination="Av. Libertador 5678"
 *   date="15 Ene 2025"
 *   otherUser={{ name: "Juan Pérez", rating: 4.8 }}
 *   actionLabel="Calificar"
 *   onAction={() => openFeedbackModal()}
 * />
 * ```
 */
export function MobileTripCard({
  id,
  origin,
  destination,
  date,
  otherUser,
  actionLabel,
  onAction,
  showTruckIcon = false,
}: MobileTripCardProps) {
  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: "4px solid",
        borderLeftColor: "secondary.main",
        position: "relative",
        overflow: "visible",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Header: Avatar + User Info */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1.5}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              src={otherUser.avatar}
              alt={otherUser.name}
              sx={{
                width: 36,
                height: 36,
                bgcolor: "secondary.main",
                color: "primary.main",
                fontWeight: 700,
              }}
            >
              {otherUser.name[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} fontSize="0.9rem">
                {otherUser.name}
              </Typography>
              {otherUser.rating && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Star sx={{ fontSize: 14, color: "secondary.main" }} />
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    {otherUser.rating.toFixed(1)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Truck Icon (opcional) */}
          {showTruckIcon && (
            <Box
              sx={{
                width: 32,
                height: 32,
                position: "relative",
                opacity: 0.3,
              }}
            >
              <Image
                src="/logo/flexpress-ad.svg"
                alt=""
                fill
                style={{ objectFit: "contain" }}
              />
            </Box>
          )}
        </Box>

        {/* Route Info */}
        <Box mb={1.5}>
          {/* Origin */}
          <Box display="flex" alignItems="flex-start" gap={1} mb={0.5}>
            <LocationOn
              sx={{ fontSize: 18, color: "primary.main", mt: 0.2 }}
            />
            <Typography variant="body2" fontSize="0.85rem" lineHeight={1.4}>
              {origin}
            </Typography>
          </Box>

          {/* Destination */}
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Flag sx={{ fontSize: 18, color: "secondary.main", mt: 0.2 }} />
            <Typography
              variant="body2"
              fontSize="0.85rem"
              fontWeight={600}
              lineHeight={1.4}
            >
              {destination}
            </Typography>
          </Box>
        </Box>

        {/* Footer: Date + Action */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {date}
          </Typography>

          {actionLabel && onAction && (
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={onAction}
              sx={{
                minHeight: 32,
                px: 2,
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {actionLabel}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
