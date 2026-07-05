"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUpdateUserProfile } from "@/lib/hooks/mutations/useAuthMutations";
import { usePublicPricing } from "@/lib/hooks/queries/useSystemConfigQueries";
import { PriceBreakdown } from "@/components/ui/PriceBreakdown";

// Ejemplo concreto para que el charter vea cómo queda su estimado.
// Bernal → Claypole ≈ 11 km (línea recta), ida y vuelta similares.
const EXAMPLE_IDA_KM = 11;
const MIN_PRICE_ARS = 20000;

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [pricePerKm, setPricePerKm] = useState<number | "">("");
  const [pricePerWaitBlock, setPricePerWaitBlock] = useState<number | "">("");
  const [chargesReturnTrip, setChargesReturnTrip] = useState(false);
  const updateProfileMutation = useUpdateUserProfile();
  const { data: pricing } = usePublicPricing();

  // Inicializar con los valores actuales del charter
  useEffect(() => {
    if (user?.pricePerKm != null) setPricePerKm(user.pricePerKm);
    if (user?.pricePerWaitBlock != null)
      setPricePerWaitBlock(user.pricePerWaitBlock);
    if (user?.chargesReturnTrip != null)
      setChargesReturnTrip(user.chargesReturnTrip);
  }, [user?.pricePerKm, user?.pricePerWaitBlock, user?.chargesReturnTrip]);

  // Preview en vivo: replica la fórmula del backend con un viaje de ejemplo
  // (Bernal → Claypole). Es lo mismo que verá el cliente: solo el aproximado de
  // la ida (con mínimo). Espera y vuelta no suman al total mostrado.
  const preview = useMemo(() => {
    const km = typeof pricePerKm === "number" ? pricePerKm : 0;
    if (km <= 0) return null;
    const ida = EXAMPLE_IDA_KM * km;
    const total = Math.max(ida, MIN_PRICE_ARS);
    return {
      total: Math.round(total),
      ida: Math.round(ida),
    };
  }, [pricePerKm]);

  const handleSave = async () => {
    if (typeof pricePerKm !== "number" || pricePerKm <= 0) {
      toast.error("Ingresá un precio por km válido");
      return;
    }
    if (!user?.id) {
      toast.error("Error: Usuario no identificado");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        data: {
          pricePerKm,
          // Espera opcional: si está vacío, se guarda 0 (no cobra).
          pricePerWaitBlock:
            typeof pricePerWaitBlock === "number" ? pricePerWaitBlock : 0,
          chargesReturnTrip,
        },
      });
      router.push("/driver/dashboard");
    } catch {
      toast.error("Error al actualizar tarifa");
    }
  };

  return (
    <>
      <MobileHeader
        title="Tu tarifa"
        onBack={() => router.push("/driver/dashboard")}
      />
      <MobileContainer maxWidth="md" withBottomNav>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Configurar tu tarifa
          </Typography>
          <Typography color="text.secondary">
            Estos precios son orientativos: el cliente verá un estimado del
            viaje en pesos antes de elegirte.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <TextField
              label="Precio por km"
              type="number"
              value={pricePerKm}
              onChange={(e) =>
                setPricePerKm(e.target.value === "" ? "" : Number(e.target.value))
              }
              helperText={`Sugerencia del sistema: $${pricing?.creditsPerKm ?? "..."} / km`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              inputProps={{ min: 0, step: 50 }}
              fullWidth
              sx={{ mb: 3 }}
            />

            <TextField
              label="Precio por espera / carga (cada 30 min)"
              type="number"
              value={pricePerWaitBlock}
              onChange={(e) =>
                setPricePerWaitBlock(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              helperText="Lo que cobrás por el bloque de 30 min de carga/descarga del viaje. Opcional: dejalo vacío si no querés cobrarlo."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              inputProps={{ min: 0, step: 1000 }}
              fullWidth
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={chargesReturnTrip}
                  onChange={(e) => setChargesReturnTrip(e.target.checked)}
                  color="secondary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Cobrar viaje de vuelta
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Suma al estimado el regreso a tu zona, al 50% del precio por
                    km.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: "flex-start", mb: 3, ml: 0 }}
            />

            {/* Preview: así verá el cliente tu estimado (ejemplo Bernal → Claypole) */}
            {preview && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.75, fontWeight: 600 }}
                >
                  Así lo vería el cliente · ejemplo Bernal → Claypole (
                  {EXAMPLE_IDA_KM} km)
                </Typography>
                <PriceBreakdown total={preview.total} />
              </Box>
            )}

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
