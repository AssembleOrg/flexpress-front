"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import { DirectionsCar, Add, CheckCircle } from "@mui/icons-material";
import toast from "react-hot-toast";
import { useCreateVehicle, useCreateVehicleDocument } from "@/lib/hooks/mutations/useVehicleMutations";
import { VehicleDocumentType } from "@/lib/types/api";
import { uploadFiles } from "@/lib/uploadthing";
import type { Vehicle } from "@/lib/types/api";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUpdateUserProfile } from "@/lib/hooks/mutations/useAuthMutations";
import { usePublicPricing } from "@/lib/hooks/queries/useSystemConfigQueries";

const vehicleSchema = z.object({
  plate: z.string().min(1, "Patente requerida"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  alias: z.string().optional(),
});

type VehicleForm = z.infer<typeof vehicleSchema>;

const REQUIRED_DOC_TYPES: { type: VehicleDocumentType; label: string }[] = [
  { type: VehicleDocumentType.FOTO, label: "Foto del vehículo" },
  { type: VehicleDocumentType.CEDULA, label: "Cédula verde" },
  { type: VehicleDocumentType.SEGURO, label: "Seguro" },
  { type: VehicleDocumentType.VTV, label: "VTV" },
];

function VehicleDocUploader({
  vehicleId,
  docType,
  label,
}: {
  vehicleId: string;
  docType: VehicleDocumentType;
  label: string;
}) {
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const createDoc = useCreateVehicleDocument(vehicleId);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const [result] = await uploadFiles("vehicleDocUploader", { files: [file], input: { vehicleId } });
      await createDoc.mutateAsync({ type: docType, fileUrl: result.url });
      setUploaded(true);
      toast.success(`${label} subido`);
    } catch {
      toast.error(`Error al subir ${label}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1.5,
        border: "1px solid",
        borderColor: uploaded ? "success.main" : "divider",
        borderRadius: 1,
        mb: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {uploaded && <CheckCircle color="success" fontSize="small" />}
        <Typography variant="body2">{label}</Typography>
      </Box>
      <Button
        variant="outlined"
        size="small"
        component="label"
        disabled={uploading || uploaded}
        color={uploaded ? "success" : "primary"}
      >
        {uploading ? "Subiendo..." : uploaded ? "Listo" : "Subir"}
        <input type="file" accept="image/*,application/pdf" hidden onChange={handleFile} />
      </Button>
    </Box>
  );
}

function VehicleOnboardingForm({ onVehicleCreated, vehicleNumber }: { onVehicleCreated: (v: Vehicle) => void; vehicleNumber: number }) {
  const createVehicle = useCreateVehicle();
  const [createdVehicle, setCreatedVehicle] = useState<Vehicle | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(vehicleSchema),
  });

  const onSubmit = (data: VehicleForm) => {
    createVehicle.mutateAsync(data).then((vehicle) => {
      setCreatedVehicle(vehicle);
      onVehicleCreated(vehicle);
    });
  };

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <DirectionsCar />
          Vehículo {vehicleNumber}
        </Typography>

        {!createdVehicle ? (
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                {...register("plate")}
                label="Patente *"
                error={!!errors.plate}
                helperText={errors.plate?.message as string}
                sx={{ flex: 1, minWidth: 120 }}
              />
              <TextField {...register("brand")} label="Marca" sx={{ flex: 1, minWidth: 120 }} />
              <TextField {...register("model")} label="Modelo" sx={{ flex: 1, minWidth: 120 }} />
              <TextField {...register("year")} label="Año" type="number" sx={{ flex: 1, minWidth: 100 }} />
              <TextField {...register("alias")} label="Alias (ej: Fiorino roja)" sx={{ flex: 2, minWidth: 180 }} />
            </Box>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={createVehicle.isPending}
            >
              {createVehicle.isPending ? "Guardando..." : "Guardar datos del vehículo"}
            </Button>
          </Box>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Vehículo <strong>{createdVehicle.plate}</strong> creado. Ahora subí los documentos:
            </Alert>
            {REQUIRED_DOC_TYPES.map(({ type, label }) => (
              <VehicleDocUploader key={type} vehicleId={createdVehicle.id} docType={type} label={label} />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function VehicleOnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showSecond, setShowSecond] = useState(false);
  const [pricePerKm, setPricePerKm] = useState<number | "">("");
  const updateProfileMutation = useUpdateUserProfile();
  const { data: pricing } = usePublicPricing();

  const handleVehicleCreated = (v: Vehicle) => {
    setVehicles((prev) => [...prev, v]);
  };

  const handleFinish = async () => {
    if (typeof pricePerKm === "number" && pricePerKm > 0 && user?.id) {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        data: { pricePerKm },
      });
    }
    toast.success("¡Registro completo! Tu cuenta está en revisión.");
    router.push("/driver/dashboard");
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Registrá tu vehículo
        </Typography>
        <Typography color="text.secondary">
          Necesitás al menos 1 vehículo con su documentación para operar. Podés agregar hasta 2.
        </Typography>
      </Box>

      <VehicleOnboardingForm onVehicleCreated={handleVehicleCreated} vehicleNumber={1} />

      {vehicles.length >= 1 && !showSecond && (
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Button
            startIcon={<Add />}
            variant="outlined"
            onClick={() => setShowSecond(true)}
          >
            Agregar segundo vehículo (opcional)
          </Button>
        </Box>
      )}

      {showSecond && (
        <VehicleOnboardingForm onVehicleCreated={handleVehicleCreated} vehicleNumber={2} />
      )}

      {vehicles.length >= 1 && (
        <>
          <Card variant="outlined" sx={{ mb: 3, backgroundColor: "action.hover" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tu precio por km
              </Typography>
              <TextField
                label="Tu precio por km (en créditos)"
                type="number"
                value={pricePerKm}
                onChange={(e) => setPricePerKm(e.target.value === "" ? "" : Number(e.target.value))}
                helperText={`Sugerencia del sistema: ${pricing?.creditsPerKm ?? "..."} créditos/km`}
                inputProps={{ min: 0 }}
                fullWidth
              />
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Un administrador revisará tu cuenta y vehículo(s) antes de que puedas operar.
            </Typography>
            <Button variant="contained" color="secondary" size="large" onClick={handleFinish}>
              Finalizar registro
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
