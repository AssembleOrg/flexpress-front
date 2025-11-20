"use client";

import type { ReactNode } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
} from "@mui/material";
import {
  LocationOn,
  Flag,
  AccessTime,
  CalendarToday,
} from "@mui/icons-material";

interface MobileMatchCardProps {
  /**
   * ID del match
   */
  matchId: string;
  /**
   * Info del usuario que solicitó
   */
  user: {
    name: string;
    avatar?: string;
  };
  /**
   * Dirección de origen
   */
  origin: string;
  /**
   * Dirección de destino
   */
  destination: string;
  /**
   * Cantidad de trabajadores
   */
  workersCount?: number;
  /**
   * Fecha programada
   */
  scheduledDate?: string;
  /**
   * Tiempo restante hasta expiración (ej: "4m 32s" o un componente React)
   */
  expiresIn?: ReactNode;
  /**
   * Callback al aceptar
   */
  onAccept: () => void;
  /**
   * Callback al rechazar
   */
  onReject: () => void;
  /**
   * Loading state (desactiva botones)
   */
  isLoading?: boolean;
}

/**
 * MobileMatchCard Component
 *
 * Card compacta para mostrar pending matches en driver dashboard.
 *
 * Features:
 * - Info del cliente compacta
 * - Ruta origen → destino
 * - Workers count + fecha programada
 * - Timer de expiración con color warning
 * - Botones Aceptar/Rechazar optimizados para thumb
 *
 * @example
 * ```tsx
 * <MobileMatchCard
 *   matchId="match-123"
 *   user={{ name: "María García" }}
 *   origin="Av. Corrientes 1234"
 *   destination="Av. Libertador 5678"
 *   workersCount={2}
 *   expiresIn="4m 32s"
 *   onAccept={handleAccept}
 *   onReject={handleReject}
 * />
 * ```
 */
export function MobileMatchCard({
  matchId,
  user,
  origin,
  destination,
  workersCount,
  scheduledDate,
  expiresIn,
  onAccept,
  onReject,
  isLoading = false,
}: MobileMatchCardProps) {
  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: "4px solid",
        borderLeftColor: "primary.main",
        position: "relative",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Header: Avatar + User + Timer */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1.5}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                color: "white",
                fontWeight: 700,
              }}
            >
              {user.name[0]}
            </Avatar>
            <Typography variant="subtitle2" fontWeight={700} fontSize="0.9rem">
              {user.name}
            </Typography>
          </Box>

          {/* Expiration Timer */}
          {expiresIn && (
            <Chip
              icon={<AccessTime sx={{ fontSize: 14 }} />}
              label={expiresIn}
              size="small"
              color="warning"
              sx={{
                height: 24,
                fontWeight: 700,
                fontSize: "0.7rem",
              }}
            />
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

        {/* Metadata: Date */}
        {scheduledDate && (
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" fontWeight={600}>
                {scheduledDate}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Actions */}
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={onReject}
            disabled={isLoading}
            sx={{
              flex: 1,
              minHeight: 40,
              fontWeight: 700,
            }}
          >
            Rechazar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={onAccept}
            disabled={isLoading}
            sx={{
              flex: 1,
              minHeight: 40,
              fontWeight: 700,
            }}
          >
            Aceptar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
