"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  Route,
  AttachMoney,
  Schedule,
  TrendingUp,
} from "@mui/icons-material";

interface MetricItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

interface TripMetricsCardProps {
  /**
   * Distance in km
   */
  distance?: number;
  /**
   * Credits/price
   */
  credits?: number;
  /**
   * Estimated duration
   */
  duration?: string;
  /**
   * Custom metrics
   */
  customMetrics?: MetricItem[];
}

/**
 * TripMetricsCard Component
 *
 * Displays trip metrics in a grid layout.
 * Mobile-first with icon indicators.
 *
 * Features:
 * - Distance, credits, duration
 * - Extensible with custom metrics
 * - Clean grid layout
 * - Brand color accents
 *
 * @example
 * ```tsx
 * <TripMetricsCard
 *   distance={12.5}
 *   credits={450}
 *   duration="25 min"
 *   customMetrics={[
 *     {
 *       icon: <Star />,
 *       label: "Rating",
 *       value: "4.8"
 *     }
 *   ]}
 * />
 * ```
 */
export function TripMetricsCard({
  distance,
  credits,
  duration,
  customMetrics = [],
}: TripMetricsCardProps) {
  // Build metrics array
  const metrics: MetricItem[] = [];

  if (distance !== undefined) {
    metrics.push({
      icon: <Route sx={{ fontSize: 20, color: "primary.main" }} />,
      label: "Distancia",
      value: `${distance.toFixed(1)} km`,
    });
  }

  if (credits !== undefined) {
    metrics.push({
      icon: <AttachMoney sx={{ fontSize: 20, color: "secondary.main" }} />,
      label: "Créditos",
      value: credits,
    });
  }

  if (duration) {
    metrics.push({
      icon: <Schedule sx={{ fontSize: 20, color: "text.secondary" }} />,
      label: "Duración Est.",
      value: duration,
    });
  }

  // Add custom metrics
  metrics.push(...customMetrics);

  // Don't render if no metrics
  if (metrics.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 1.5 }}>
      <CardContent sx={{ p: 1.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, mb: 1, display: "block", fontSize: "0.7rem" }}
        >
          Información del Viaje
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "repeat(2, 1fr)",
            sm: "repeat(auto-fit, minmax(80px, 1fr))",
          }}
          gap={1.5}
        >
          {metrics.map((metric, index) => (
            <Box
              key={index}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={1}
              sx={{
                bgcolor: "background.default",
                borderRadius: 1.5,
                textAlign: "center",
              }}
            >
              <Box mb={0.5}>{metric.icon}</Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  mb: 0.25,
                  color: metric.color || "text.primary",
                }}
              >
                {metric.value}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.65rem" }}
              >
                {metric.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
