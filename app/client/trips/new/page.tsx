"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowBack, LocalShipping } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import MapModal from "@/components/ui/MapModal";

const tripRequestSchema = z.object({
  origin: z.string().min(3, "El origen debe tener al menos 3 caracteres"),
  destination: z.string().min(3, "El destino debe tener al menos 3 caracteres"),
  description: z
    .string()
    .min(5, "Describe brevemente qué necesitas transportar")
    .max(200, "La descripción no puede superar los 200 caracteres"),
  suggestedPrice: z
    .number()
    .min(100, "El precio mínimo es $100")
    .max(100000, "El precio máximo es $100,000"),
});

type TripRequestForm = z.infer<typeof tripRequestSchema>;

export default function NewTripPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<TripRequestForm>({
    resolver: zodResolver(tripRequestSchema),
  });

  const watchDescription = watch("description", "");
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [currentMapField, setCurrentMapField] = useState<
    "origin" | "destination"
  >("origin");
  const [selectedLocations, setSelectedLocations] = useState<{
    origin?: { address: string; coordinates: { lat: number; lng: number } };
    destination?: {
      address: string;
      coordinates: { lat: number; lng: number };
    };
  }>({});

  // Función para abrir modal de mapa
  const openMapModal = (fieldName: "origin" | "destination") => {
    setCurrentMapField(fieldName);
    setMapModalOpen(true);
  };

  // Callback cuando se selecciona ubicación en el mapa
  const handleLocationSelect = (
    address: string,
    coordinates: { lat: number; lng: number },
  ) => {
    // Actualizar el formulario
    setValue(currentMapField, address);

    // Guardar la ubicación seleccionada
    setSelectedLocations((prev) => ({
      ...prev,
      [currentMapField]: { address, coordinates },
    }));

    toast.success(
      `${currentMapField === "origin" ? "Origen" : "Destino"} seleccionado correctamente`,
    );
  };

  const onSubmit = async (data: TripRequestForm) => {
    console.log("Solicitud de flete:", data);

    // Simular envío (sin API por ahora)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("¡Solicitud enviada! Buscando conductores...", {
      duration: 4000,
    });

    // Redirigir al dashboard después de envío exitoso
    router.push("/client/dashboard");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Link href="/client/dashboard">
          <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
            Volver al Dashboard
          </Button>
        </Link>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <LocalShipping sx={{ fontSize: 32, color: "secondary.main" }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Solicitar Flete
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Completa los detalles de tu flete y encontraremos el conductor
          perfecto
        </Typography>
      </Box>

      {/* Información importante */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Nuevo:</strong> Haz clic en los botones 🗺️ para abrir un mapa
          interactivo. Selecciona la ubicación exacta y se completará
          automáticamente la dirección.
        </Typography>
      </Alert>

      {/* Formulario */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Ubicaciones */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              📍 Ubicaciones
            </Typography>

            {/* Origen con selección de mapa */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  {...register("origin")}
                  label="Origen (punto de recogida)"
                  placeholder="Haz clic en el mapa para seleccionar"
                  fullWidth
                  error={!!errors.origin}
                  helperText={
                    errors.origin?.message ||
                    "Usa el botón del mapa para seleccionar tu ubicación"
                  }
                />

                {/* Botón de mapa */}
                <IconButton
                  onClick={() => openMapModal("origin")}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                  size="small"
                  title="Seleccionar en mapa interactivo"
                >
                  <Map sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Chips informativos de ubicaciones seleccionadas */}
            {(selectedLocations.origin || selectedLocations.destination) && (
              <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {selectedLocations.origin && (
                  <Chip
                    label={`📍 Origen: ${selectedLocations.origin.address.slice(0, 30)}...`}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                )}
                {selectedLocations.destination && (
                  <Chip
                    label={`🎯 Destino: ${selectedLocations.destination.address.slice(0, 30)}...`}
                    color="secondary"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            )}

            {/* Destino con selección de mapa */}
            <Box sx={{ position: "relative", mb: 3 }}>
              <TextField
                {...register("destination")}
                label="Destino (punto de entrega)"
                placeholder="Haz clic en el mapa para seleccionar"
                fullWidth
                error={!!errors.destination}
                helperText={
                  errors.destination?.message ||
                  "Usa el botón del mapa para seleccionar destino"
                }
              />

              {/* Botón mapa para destino */}
              <IconButton
                onClick={() => openMapModal("destination")}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  bgcolor: "secondary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "secondary.dark",
                  },
                }}
                size="small"
                title="Seleccionar en mapa interactivo"
              >
                <Map sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            {/* Descripción */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 4 }}>
              📦 ¿Qué necesitas transportar?
            </Typography>

            <TextField
              {...register("description")}
              label="Descripción"
              placeholder="Ej: 2 cajas de libros y una silla pequeña"
              multiline
              rows={3}
              fullWidth
              error={!!errors.description}
              helperText={
                errors.description?.message ||
                `${watchDescription.length}/200 caracteres`
              }
              sx={{ mb: 3 }}
            />

            {/* Precio */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              💰 Precio Sugerido
            </Typography>

            <TextField
              {...register("suggestedPrice", {
                valueAsNumber: true,
              })}
              label="Precio en ARS"
              type="number"
              placeholder="3500"
              fullWidth
              error={!!errors.suggestedPrice}
              helperText={
                errors.suggestedPrice?.message ||
                "Este es tu precio inicial. Podrás negociar con el conductor."
              }
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1, color: "text.secondary" }}>
                    $
                  </Typography>
                ),
              }}
            />

            {/* Botón de envío */}
            <Box textAlign="center">
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                disabled={isSubmitting}
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  px: 6,
                  py: 1.5,
                  minWidth: 200,
                }}
              >
                {isSubmitting ? "Enviando..." : "Solicitar Flete"}
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Recibirás notificaciones cuando los conductores respondan
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Modal de Mapa */}
      <MapModal
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        title={`Seleccionar ${currentMapField === "origin" ? "punto de recogida" : "punto de entrega"}`}
        fieldName={currentMapField}
      />
    </Container>
  );
}
