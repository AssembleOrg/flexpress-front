"use client";

import { Box, Typography, Button } from "@mui/material";
import { type ReactNode } from "react";

interface EmptyStateProps {
  /**
   * Icon to display (ReactNode for flexibility)
   */
  icon: ReactNode;
  /**
   * Main message
   */
  title: string;
  /**
   * Secondary message (optional)
   */
  subtitle?: string;
  /**
   * Action button (optional)
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Custom styles
   */
  sx?: Record<string, any>;
}

/**
 * EmptyState Component
 *
 * Generic empty state component for lists and sections.
 * Mobile-first with centered layout.
 *
 * Features:
 * - Customizable icon
 * - Title + subtitle
 * - Optional CTA button
 * - Clean, minimal design
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<History sx={{ fontSize: 64, color: "grey.300" }} />}
 *   title="No tienes viajes completados"
 *   subtitle="Cuando completes un viaje aparecerá aquí"
 *   action={{
 *     label: "Solicitar Flete",
 *     onClick: () => router.push('/client/trips/new')
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  subtitle,
  action,
  sx = {},
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: { xs: 6, md: 8 },
        px: 3,
        ...sx,
      }}
    >
      {/* Icon */}
      <Box mb={3}>{icon}</Box>

      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 1,
          fontSize: { xs: "1rem", md: "1.25rem" },
        }}
      >
        {title}
      </Typography>

      {/* Subtitle */}
      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: action ? 3 : 0, maxWidth: 400 }}
        >
          {subtitle}
        </Typography>
      )}

      {/* Action Button */}
      {action && (
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={action.onClick}
          sx={{
            minHeight: 48,
            fontWeight: 700,
            px: 4,
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
