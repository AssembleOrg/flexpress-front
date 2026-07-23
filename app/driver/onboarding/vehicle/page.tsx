"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Add, CheckCircle, DirectionsCar } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { VEHICLE_BRANDS } from "@/lib/constants/vehicleBrands";
import { useUpdateUserProfile } from "@/lib/hooks/mutations/useAuthMutations";
import {
  useCreateVehicle,
  useCreateVehicleDocument,
} from "@/lib/hooks/mutations/useVehicleMutations";
import { usePublicPricing } from "@/lib/hooks/queries/useSystemConfigQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import type { Vehicle } from "@/lib/types/api";
import {
  VEHICLE_SIZE_LABELS,
  VehicleDocumentType,
  VehicleSize,
} from "@/lib/types/api";
import { uploadToStorage } from "@/lib/upload";

const vehicleSchema = z.object({
  plate: z.string().min(1, "Patente requerida"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  size: z.nativeEnum(VehicleSize).default(VehicleSize.CHICO),
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
  onUploaded,
}: {
  vehicleId: string;
  docType: VehicleDocumentType;
  label: string;
  onUploaded: (docType: VehicleDocumentType) => void;
}) {
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const createDoc = useCreateVehicleDocument(vehicleId);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // La foto del vehículo es pública; el resto (cédula/seguro/vtv) privado.
      const scope =
        docType === VehicleDocumentType.FOTO ? "vehicle-foto" : "vehicle-doc";
      const result = await uploadToStorage(scope, file, vehicleId);
      // Siempre la KEY (bucket privado): foto y docs se muestran con URL firmada.
      await createDoc.mutateAsync({ type: docType, fileUrl: result.key });
      setUploaded(true);
      onUploaded(docType);
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
        <input
          type="file"
          accept="image/*,application/pdf"
          hidden
          onChange={handleFile}
        />
      </Button>
    </Box>
  );
}

function VehicleOnboardingForm({
  onVehicleCreated,
  onDocsChange,
  vehicleNumber,
}: {
  onVehicleCreated: (v: Vehicle) => void;
  onDocsChange: (vehicleId: string, uploaded: Set<VehicleDocumentType>) => void;
  vehicleNumber: number;
}) {
  const createVehicle = useCreateVehicle();
  const [createdVehicle, setCreatedVehicle] = useState<Vehicle | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Set<VehicleDocumentType>>(
    new Set(),
  );

  const handleDocUploaded = (docType: VehicleDocumentType) => {
    if (!createdVehicle) return;
    setUploadedDocs((prev) => {
      const next = new Set(prev).add(docType);
      onDocsChange(createdVehicle.id, next);
      return next;
    });
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plate: "",
      brand: "",
      model: "",
      year: "",
      size: VehicleSize.CHICO,
    },
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
        <Typography
          variant="h6"
          sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
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
              <FormControl sx={{ flex: 1, minWidth: 120 }}>
                <InputLabel>Marca</InputLabel>
                <Controller
                  name="brand"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Marca">
                      <MenuItem value="">
                        <em>Sin marca</em>
                      </MenuItem>
                      {VEHICLE_BRANDS.map((brand) => (
                        <MenuItem key={brand} value={brand}>
                          {brand}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <TextField
                {...register("model")}
                label="Modelo"
                sx={{ flex: 1, minWidth: 120 }}
              />
              <TextField
                {...register("year")}
                label="Año"
                type="number"
                sx={{ flex: 1, minWidth: 100 }}
              />
              <FormControl sx={{ flex: 1, minWidth: 160 }}>
                <InputLabel>Tamaño del flete</InputLabel>
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Tamaño del flete">
                      {Object.values(VehicleSize).map((s) => (
                        <MenuItem key={s} value={s}>
                          {VEHICLE_SIZE_LABELS[s]}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              El tamaño no se puede cambiar luego. "Flete Grande" habilita que
              el cliente pida ayudantes.
            </Typography>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={createVehicle.isPending}
            >
              {createVehicle.isPending
                ? "Guardando..."
                : "Guardar datos del vehículo"}
            </Button>
          </Box>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Vehículo <strong>{createdVehicle.plate}</strong> creado. Ahora
              subí los documentos:
            </Alert>
            {REQUIRED_DOC_TYPES.map(({ type, label }) => (
              <VehicleDocUploader
                key={type}
                vehicleId={createdVehicle.id}
                docType={type}
                label={label}
                onUploaded={handleDocUploaded}
              />
            ))}
            {uploadedDocs.size < REQUIRED_DOC_TYPES.length && (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ display: "block", mt: 1 }}
              >
                Faltan:{" "}
                {REQUIRED_DOC_TYPES.filter(
                  ({ type }) => !uploadedDocs.has(type),
                )
                  .map(({ label }) => label)
                  .join(", ")}
              </Typography>
            )}
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
  const [docsByVehicle, setDocsByVehicle] = useState<
    Record<string, Set<VehicleDocumentType>>
  >({});
  const [showSecond, setShowSecond] = useState(false);
  const [pricePerKm, setPricePerKm] = useState<number | "">("");
  const updateProfileMutation = useUpdateUserProfile();
  const { data: pricing } = usePublicPricing();

  const handleVehicleCreated = (v: Vehicle) => {
    setVehicles((prev) => [...prev, v]);
  };

  const handleDocsChange = (
    vehicleId: string,
    uploaded: Set<VehicleDocumentType>,
  ) => {
    setDocsByVehicle((prev) => ({ ...prev, [vehicleId]: uploaded }));
  };

  const vehiclesMissingDocs = vehicles.filter((v) => {
    const uploaded = docsByVehicle[v.id];
    return !uploaded || uploaded.size < REQUIRED_DOC_TYPES.length;
  });

  const allDocsComplete =
    vehicles.length >= 1 && vehiclesMissingDocs.length === 0;

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
    <>
      <MobileContainer maxWidth="md" withBottomNav>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Registrá tu vehículo
          </Typography>
          <Typography color="text.secondary">
            Necesitás al menos 1 vehículo con su documentación para operar.
            Podés agregar hasta 2.
          </Typography>
        </Box>

        <VehicleOnboardingForm
          onVehicleCreated={handleVehicleCreated}
          onDocsChange={handleDocsChange}
          vehicleNumber={1}
        />

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
          <VehicleOnboardingForm
            onVehicleCreated={handleVehicleCreated}
            onDocsChange={handleDocsChange}
            vehicleNumber={2}
          />
        )}

        {vehicles.length >= 1 && (
          <>
            <Card
              variant="outlined"
              sx={{ mb: 3, backgroundColor: "action.hover" }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Tu precio por km
                </Typography>
                <TextField
                  label="Tu precio por km (en pesos)"
                  type="number"
                  value={pricePerKm}
                  onChange={(e) =>
                    setPricePerKm(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  helperText={`Sugerencia del sistema: $${pricing?.creditsPerKm ?? "..."} / km`}
                  inputProps={{ min: 0 }}
                  fullWidth
                />
              </CardContent>
            </Card>

            <Divider sx={{ my: 3 }} />
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Un administrador revisará tu cuenta y vehículo(s) antes de que
                puedas operar.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleFinish}
                disabled={!allDocsComplete}
              >
                Finalizar registro
              </Button>
              {!allDocsComplete && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" color="error">
                    Cada vehículo debe tener sus 4 documentos (Foto, Cédula
                    verde, Seguro y VTV) antes de finalizar.
                  </Typography>
                  {vehiclesMissingDocs.map((v) => {
                    const uploaded =
                      docsByVehicle[v.id] ?? new Set<VehicleDocumentType>();
                    const faltantes = REQUIRED_DOC_TYPES.filter(
                      ({ type }) => !uploaded.has(type),
                    )
                      .map(({ label }) => label)
                      .join(", ");
                    return (
                      <Typography
                        key={v.id}
                        variant="caption"
                        color="error"
                        sx={{ display: "block" }}
                      >
                        {v.plate}: falta {faltantes}
                      </Typography>
                    );
                  })}
                </Box>
              )}
            </Box>
          </>
        )}
      </MobileContainer>
      <BottomNavbar />
    </>
  );
}
