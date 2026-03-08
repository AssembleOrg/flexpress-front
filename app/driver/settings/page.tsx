"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUpdateUserProfile } from "@/lib/hooks/mutations/useAuthMutations";
import { usePublicPricing } from "@/lib/hooks/queries/useSystemConfigQueries";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [pricePerKm, setPricePerKm] = useState<number | "">("");
  const updateProfileMutation = useUpdateUserProfile();
  const { data: pricing } = usePublicPricing();

  // Initialize with user's current price
  useEffect(() => {
    if (user?.pricePerKm != null) {
      setPricePerKm(user.pricePerKm);
    }
  }, [user?.pricePerKm]);

  const handleSave = async () => {
    if (typeof pricePerKm !== "number" || pricePerKm <= 0) {
      toast.error("Por favor ingresa un precio válido");
      return;
    }

    if (!user?.id) {
      toast.error("Error: Usuario no identificado");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        data: { pricePerKm },
      });
      router.push("/driver/dashboard");
    } catch {
      toast.error("Error al actualizar tarifa");
    }
  };

  return (
    <>
      <AuthNavbar />
      <MobileContainer maxWidth="md" withBottomNav>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Configurar tu tarifa
          </Typography>
          <Typography color="text.secondary">
            Ajusta el precio que cobras por kilómetro
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <TextField
              label="Tu precio por km (en créditos)"
              type="number"
              value={pricePerKm}
              onChange={(e) => setPricePerKm(e.target.value === "" ? "" : Number(e.target.value))}
              helperText={`Sugerencia del sistema: ${pricing?.creditsPerKm ?? "..."} créditos/km`}
              inputProps={{ min: 0, step: 0.1 }}
              fullWidth
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.push("/driver/dashboard")}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </MobileContainer>
      <BottomNavbar />
    </>
  );
}
