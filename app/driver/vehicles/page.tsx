"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Switch,
  Chip,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { Add, DirectionsCar } from "@mui/icons-material";
import { useMyVehicles } from "@/lib/hooks/queries/useVehicleQueries";
import { useToggleVehicleEnabled } from "@/lib/hooks/mutations/useVehicleMutations";
import { useAuthStore } from "@/lib/stores/authStore";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { VerificationStatus } from "@/lib/types/api";

export default function VehiclesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: vehicles = [], isLoading } = useMyVehicles();
  const toggleVehicle = useToggleVehicleEnabled("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (vehicleId: string, currentEnabled: boolean) => {
    if (vehicles.find((v) => v.id === vehicleId)?.verificationStatus !== VerificationStatus.VERIFIED) {
      return;
    }
    setTogglingId(vehicleId);
    try {
      // Create new mutation instance for this vehicle
      const mutation = useToggleVehicleEnabled(vehicleId);
      await mutation.mutateAsync();
    } finally {
      setTogglingId(null);
    }
  };

  const getVerificationStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return "success";
      case VerificationStatus.PENDING:
        return "warning";
      case VerificationStatus.REJECTED:
        return "error";
      default:
        return "default";
    }
  };

  const getVerificationStatusLabel = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return "Verificado";
      case VerificationStatus.PENDING:
        return "Pendiente";
      case VerificationStatus.REJECTED:
        return "Rechazado";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <AuthGuard message="Por favor inicia sesión">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </AuthGuard>
    );
  }

  const isEmptyState = vehicles.length === 0;
  const canAddMore = vehicles.length < 2;

  return (
    <AuthGuard message="Por favor inicia sesión">
      <PageTransition>
        <AuthNavbar />
        <Box
          sx={{
            bgcolor: "background.default",
            minHeight: "calc(100vh - 64px)",
            py: 4,
            pb: { xs: 12, md: 4 },
          }}
        >
          <Container maxWidth="md">
            {/* Header */}
            <Box mb={4}>
              <Typography
                variant="h4"
                fontWeight={700}
                color="primary.main"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <DirectionsCar /> Mis Vehículos
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestiona tu flota de vehículos disponibles para operación
              </Typography>
            </Box>

            {/* Empty State */}
            {isEmptyState && (
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <DirectionsCar
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sin vehículos registrados
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Registra tu primer vehículo para comenzar a operar
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => router.push("/driver/onboarding/vehicle")}
                >
                  Registrar primer vehículo
                </Button>
              </Paper>
            )}

            {/* Vehicles List */}
            {!isEmptyState && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "1.25rem",
                              mb: 1,
                            }}
                          >
                            {vehicle.plate}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                            <Chip
                              label={getVerificationStatusLabel(vehicle.verificationStatus)}
                              color={getVerificationStatusColor(
                                vehicle.verificationStatus
                              )}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={vehicle.isEnabled ? "Disponible" : "No disponible"}
                              color={vehicle.isEnabled ? "success" : "default"}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {vehicle.brand || "Sin marca"} {vehicle.model && `- ${vehicle.model}`}
                            {vehicle.year && ` (${vehicle.year})`}
                          </Typography>
                        </Box>

                        {/* Toggle Switch */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Switch
                            checked={vehicle.isEnabled}
                            onChange={() => handleToggle(vehicle.id, vehicle.isEnabled)}
                            disabled={
                              vehicle.verificationStatus !== VerificationStatus.VERIFIED ||
                              togglingId === vehicle.id
                            }
                            size="medium"
                          />
                          {vehicle.verificationStatus !== VerificationStatus.VERIFIED && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ textAlign: "center", fontSize: "0.7rem" }}
                            >
                              Desbloqueará cuando sea verificado
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Rejection Reason */}
                      {vehicle.verificationStatus === VerificationStatus.REJECTED &&
                        vehicle.rejectionReason && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              Motivo del rechazo:
                            </Typography>
                            <Typography variant="body2">
                              {vehicle.rejectionReason}
                            </Typography>
                          </Alert>
                        )}
                    </CardContent>
                  </Card>
                ))}

                {/* Add More Button */}
                {canAddMore && (
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => router.push("/driver/onboarding/vehicle")}
                    >
                      Agregar vehículo
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Container>
        </Box>
        <BottomNavbar />
      </PageTransition>
    </AuthGuard>
  );
}
