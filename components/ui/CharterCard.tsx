"use client";

import {
  AttachMoney,
  DirectionsCar,
  LocalShipping,
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
  isPending?: boolean;
  averageRating?: number;
  totalReviews?: number;
  systemPricePerKm?: number;
}

export function CharterCard({
  charter,
  onSelect,
  isLoading = false,
  isPending = false,
  averageRating = 0,
  totalReviews = 0,
  systemPricePerKm,
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
              {/* Status indicator */}
              {isPending ? (
                <Chip
                  label="Seleccionado"
                  size="small"
                  color="primary"
                  icon={
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "white",
                        flexShrink: 0,
                        animation: "pulse 1.5s ease-in-out infinite",
                        "@keyframes pulse": {
                          "0%, 100%": { opacity: 1 },
                          "50%": { opacity: 0.4 },
                        },
                      }}
                    />
                  }
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                />
              ) : (
                <Chip
                  label="Disponible"
                  size="small"
                  color="success"
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                />
              )}
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

        {/* Zona de trabajo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
          <LocationOn sx={{ fontSize: 15, color: "secondary.main", flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            Zona de trabajo:
          </Typography>
          <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
            {charter.originAddress}
          </Typography>
        </Box>

        {/* Vehículo */}
        {(charter.vehicleBrand || charter.vehicleModel || charter.vehiclePlate) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
            <LocalShipping sx={{ fontSize: 15, color: "text.secondary", flexShrink: 0 }} />
            <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0 }}>
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
          </Box>
        )}

        {/* Precio por km */}
        {charter.pricePerKm != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <AttachMoney sx={{ fontSize: 15, color: "success.main", flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {charter.pricePerKm} cr/km
            </Typography>
            {systemPricePerKm != null && (
              <Typography variant="caption" color="text.secondary">
                · Ref. sistema: {systemPricePerKm} cr/km
              </Typography>
            )}
          </Box>
        )}

        {/* Stats en chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip
            icon={<DirectionsCar />}
            label={`${charter.distanceToPickup.toFixed(1)} km al origen`}
            size="small"
            variant="outlined"
            color="primary"
          />
          <Chip
            label="Solicitud: 1 crédito"
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
