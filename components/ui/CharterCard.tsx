"use client";

import {
  DirectionsCar,
  Group,
  LocalShipping,
  LocationOn,
  Person,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { PriceBreakdown } from "@/components/ui/PriceBreakdown";
import { RatingDisplay } from "@/components/ui/RatingDisplay";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import type { AvailableCharter } from "@/lib/types/api";
import { VEHICLE_SIZE_LABELS } from "@/lib/types/api";

interface CharterCardProps {
  charter: AvailableCharter;
  onSelect: () => void;
  isLoading?: boolean;
  isPending?: boolean;
  averageRating?: number;
  totalReviews?: number;
  // Cuando el charter está en viaje, se invoca este handler en vez de onSelect.
  // Si no se pasa, el card cae al comportamiento de "Seleccionar".
  onInquiry?: () => void;
  isInquiryLoading?: boolean;
}

export function CharterCard({
  charter,
  onSelect,
  isLoading = false,
  isPending = false,
  averageRating = 0,
  totalReviews = 0,
  onInquiry,
  isInquiryLoading = false,
}: CharterCardProps) {
  const showInquiryCta = charter.isOnTrip && !!onInquiry;
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
      <CardContent
        sx={{
          p: { xs: 1.5, md: 2 },
          "&:last-child": { pb: { xs: 1.5, md: 2 } },
        }}
      >
        {/* Header con avatar y nombre */}
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1.5 }}>
          <SignedAvatar
            value={charter.charterAvatar}
            alt={charter.charterName}
            sx={{ width: 56, height: 56, mr: 2 }}
          >
            {charter.charterName.charAt(0)}
          </SignedAvatar>

          <Box sx={{ flex: 1 }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
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
              ) : charter.isOnTrip ? (
                <Chip
                  label="En viaje"
                  size="small"
                  color="warning"
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

        {/* Hoy conduce: ejecutor activo (la cara de la oferta). Transparencia:
            el cliente ve quién va antes de elegir. */}
        {charter.activeDriverName && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
              p: 1,
              borderRadius: 1.5,
              bgcolor: "action.hover",
            }}
          >
            <SignedAvatar
              value={charter.activeDriverAvatar}
              sx={{ width: 28, height: 28, fontSize: "0.8rem" }}
            >
              {charter.activeDriverName.charAt(0)}
            </SignedAvatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                HOY CONDUCE
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, lineHeight: 1.2 }}
                noWrap
              >
                {charter.activeDriverName}
                {charter.isTitularDriving && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    · titular
                  </Typography>
                )}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Zona de trabajo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            flexWrap: "wrap",
          }}
        >
          <LocationOn
            sx={{ fontSize: 15, color: "secondary.main", flexShrink: 0 }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flexShrink: 0 }}
          >
            Zona de trabajo:
          </Typography>
          <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
            {charter.originAddress}
          </Typography>
        </Box>

        {/* Vehículo */}
        {(charter.vehicleBrand ||
          charter.vehicleModel ||
          charter.vehiclePlate) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
              flexWrap: "wrap",
            }}
          >
            <LocalShipping
              sx={{ fontSize: 15, color: "text.secondary", flexShrink: 0 }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ flex: 1, minWidth: 0 }}
            >
              {[charter.vehicleBrand, charter.vehicleModel]
                .filter(Boolean)
                .join(" ")}
            </Typography>
            {charter.vehicleSize && (
              <Chip
                label={VEHICLE_SIZE_LABELS[charter.vehicleSize]}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{
                  fontSize: "0.7rem",
                  height: 20,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              />
            )}
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

        {/* Estimado del viaje en pesos (informativo, aproximado por km) */}
        {charter.estimatedPriceArs != null && (
          <Box sx={{ mb: 1.5 }}>
            <PriceBreakdown total={charter.estimatedPriceArs} />
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
          {(charter.driversCount ?? 0) > 0 && (
            <Chip
              icon={<Person />}
              label={`${charter.driversCount} conductor${(charter.driversCount ?? 0) > 1 ? "es" : ""}`}
              size="small"
              variant="outlined"
            />
          )}
          {(charter.helpersCount ?? 0) > 0 && (
            <Chip
              icon={<Group />}
              label={`${charter.helpersCount} ayudante${(charter.helpersCount ?? 0) > 1 ? "s" : ""}`}
              size="small"
              variant="outlined"
            />
          )}
          <Chip
            label="Solicitud: 1 crédito"
            size="small"
            color="success"
            variant="filled"
          />
        </Box>

        {/* Button */}
        {showInquiryCta ? (
          <Button
            variant="outlined"
            color="warning"
            fullWidth
            size="large"
            onClick={onInquiry}
            disabled={isInquiryLoading}
            sx={{ fontWeight: 600, py: 1.5 }}
          >
            {isInquiryLoading
              ? "Enviando consulta..."
              : "Consultar disponibilidad"}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            onClick={onSelect}
            disabled={isLoading}
            sx={{ fontWeight: 600, py: 1.5 }}
          >
            {isLoading ? "Seleccionando..." : "Seleccionar Chófer"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
