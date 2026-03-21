"use client";

import {
  AccessTime,
  DirectionsCar,
  LocationOn,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { RatingDisplay } from "@/components/ui/RatingDisplay";
import type { AvailableCharter } from "@/lib/types/api";

interface CharterCardProps {
  charter: AvailableCharter;
  onSelect: () => void;
  isLoading?: boolean;
  averageRating?: number;
  totalReviews?: number;
}

export function CharterCard({
  charter,
  onSelect,
  isLoading = false,
  averageRating = 0,
  totalReviews = 0,
}: CharterCardProps) {
  return (
    <Card
      sx={{
        mb: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: { xs: 1.5, md: 2 } } }}>
        {/* Header con avatar y nombre */}
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1.5 }}>
          <Avatar
            src={charter.charterAvatar || undefined}
            alt={charter.charterName}
            sx={{ width: 56, height: 56, mr: 2 }}
          >
            {charter.charterName.charAt(0)}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {charter.charterName}
              </Typography>
              {/* Online indicator */}
              <Chip
                label="Disponible"
                size="small"
                color="success"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}
              />
            </Box>

            {/* Rating */}
            <Box sx={{ mb: 0.5 }}>
              <RatingDisplay
                averageRating={averageRating}
                totalReviews={totalReviews}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        {/* Zona de trabajo + vehículo en una fila horizontal */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
          <LocationOn sx={{ fontSize: 16, color: "secondary.main", flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            Zona de trabajo:
          </Typography>
          <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
            {charter.originAddress}
          </Typography>
          {(charter.vehicleBrand || charter.vehicleModel || charter.vehiclePlate) && (
            <>
              <DirectionsCar sx={{ fontSize: 16, color: "action.active", flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {[charter.vehicleBrand, charter.vehicleModel].filter(Boolean).join(" ")}
              </Typography>
              {charter.vehiclePlate && (
                <Chip
                  label={charter.vehiclePlate}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    height: 20,
                    flexShrink: 0,
                  }}
                />
              )}
            </>
          )}
        </Box>

        {/* Stats en chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip
            icon={<AccessTime />}
            label={`${charter.distanceToPickup.toFixed(1)} km`}
            size="small"
            variant="outlined"
            color="primary"
          />
          <Chip
            icon={<DirectionsCar />}
            label={`${charter.totalDistance.toFixed(1)} km total`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${charter.estimatedCredits} créditos`}
            size="small"
            color="success"
            variant="filled"
          />
        </Box>

        {/* Button */}
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          size="large"
          onClick={onSelect}
          disabled={isLoading}
          sx={{
            fontWeight: 600,
            py: 1.5,
          }}
        >
          {isLoading ? "Seleccionando..." : "Seleccionar Chófer"}
        </Button>
      </CardContent>
    </Card>
  );
}
