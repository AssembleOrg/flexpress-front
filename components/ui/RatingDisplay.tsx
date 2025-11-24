"use client";

import { Box, Chip, Rating, Typography } from "@mui/material";

interface RatingDisplayProps {
  averageRating: number;
  totalReviews: number;
  size?: "small" | "medium";
  showCount?: boolean;
}

export function RatingDisplay({
  averageRating,
  totalReviews,
  size = "small",
  showCount = true,
}: RatingDisplayProps) {
  // Si tiene reseñas, mostrar rating con estrellas
  if (totalReviews > 0) {
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        <Rating
          value={averageRating}
          readOnly
          size={size}
          precision={0.1}
          sx={{ fontSize: size === "small" ? "1rem" : "1.25rem" }}
        />
        {showCount && (
          <Typography variant="caption" color="text.secondary">
            {averageRating.toFixed(1)} ({totalReviews}{" "}
            {totalReviews === 1 ? "reseña" : "reseñas"})
          </Typography>
        )}
      </Box>
    );
  }

  // Si no tiene reseñas, mostrar chip "Nuevo"
  return (
    <Chip
      label="Nuevo"
      size="small"
      color="secondary"
      sx={{
        height: 18,
        fontSize: "0.65rem",
        fontWeight: 600,
      }}
    />
  );
}
