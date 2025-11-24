"use client";

import {
  AccessTime,
  DirectionsCar,
  LocationOn,
  Phone,
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
  averageRating = 4.5,
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
      <CardContent sx={{ pb: 2 }}>
        {/* Header con avatar y nombre */}
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
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

            {/* Teléfono */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
            >
              <Phone sx={{ fontSize: 16, color: "primary.main" }} />
              <Typography variant="body2">{charter.charterNumber}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Información de ubicación y distancia */}
        <Box sx={{ mb: 2, pl: 8 }}>
          <Box
            sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}
          >
            <LocationOn
              sx={{ fontSize: 18, color: "secondary.main", mt: 0.5 }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Base del chófer
              </Typography>
              <Typography variant="body2">{charter.originAddress}</Typography>
            </Box>
          </Box>
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

        {/* Detalles */}
        <Box sx={{ mb: 2, p: 1, bgcolor: "grey.100", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <strong>Distancia del origen al punto de recogida:</strong>{" "}
            {charter.distanceToPickup.toFixed(1)} km
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Distancia total del trayecto:</strong>{" "}
            {charter.totalDistance.toFixed(1)} km
          </Typography>
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
