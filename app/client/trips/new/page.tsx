"use client";

import { ArrowBack, LocalShipping } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AddressInput } from "@/components/ui/AddressInput";
// biome-ignore lint/suspicious/noShadowRestrictedNames: exported as alias from Map component
import { Map } from "@/components/ui/Map";
import { useTravelMatch } from "@/lib/hooks/useTravelMatch";

export default function NewTripPage() {
  const router = useRouter();
  const {
    createMatch,
    isLoading,
    pickupAddress,
    pickupCoords,
    destinationAddress,
    destinationCoords,
    workersCount,
    setPickupLocation,
    setDestinationLocation,
    setWorkersCount,
    isFormComplete,
  } = useTravelMatch();

  const handleCreateMatch = async () => {
    const result = await createMatch();
    if (result) {
      // Redirect to matching page to see available charters
      router.push("/client/trips/matching");
    }
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
            Solicitar Viaje
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Completa los detalles de tu viaje y encontraremos el chófer perfecto
        </Typography>
      </Box>

      {/* Información */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Usa el autocompletado:</strong> Escribe la dirección y
          selecciona de las sugerencias. El sistema buscará chóferes disponibles
          en un radio de 30 km.
        </Typography>
      </Alert>

      {/* Formulario */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Ubicaciones */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            📍 Ubicaciones
          </Typography>

          {/* Origen */}
          <Box sx={{ mb: 3 }}>
            <AddressInput
              label="Punto de Recogida"
              placeholder="Ej: Av. Hipólito Yrigoyen 8985, Buenos Aires"
              value={pickupAddress || ""}
              onAddressSelect={(address, lat, lon) => {
                setPickupLocation(address, lat, lon);
                toast.success("Origen seleccionado");
              }}
            />
          </Box>

          {/* Destino */}
          <Box sx={{ mb: 3 }}>
            <AddressInput
              label="Punto de Destino"
              placeholder="Ej: Calle 13 567, La Plata, Buenos Aires"
              value={destinationAddress || ""}
              onAddressSelect={(address, lat, lon) => {
                setDestinationLocation(address, lat, lon);
                toast.success("Destino seleccionado");
              }}
            />
          </Box>

          {/* Chips informativos */}
          {(pickupAddress || destinationAddress) && (
            <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {pickupAddress && (
                <Chip
                  label={`📍 Origen: ${pickupAddress.slice(0, 30)}...`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
              {destinationAddress && (
                <Chip
                  label={`🎯 Destino: ${destinationAddress.slice(0, 30)}...`}
                  color="secondary"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          )}

          {/* Mapa */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              📍 Vista del trayecto
            </Typography>
            <Map
              markers={[
                ...(pickupCoords
                  ? [
                      {
                        lat: pickupCoords.lat,
                        lon: pickupCoords.lon,
                        label: "Recogida",
                        type: "pickup" as const,
                      },
                    ]
                  : []),
                ...(destinationCoords
                  ? [
                      {
                        lat: destinationCoords.lat,
                        lon: destinationCoords.lon,
                        label: "Destino",
                        type: "destination" as const,
                      },
                    ]
                  : []),
              ]}
              height="300px"
            />
          </Box>

          {/* Trabajadores */}
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 2, mt: 3 }}
          >
            👥 Número de Trabajadores (Opcional)
          </Typography>

          <TextField
            type="number"
            label="Cantidad de trabajadores"
            value={workersCount}
            onChange={(e) => setWorkersCount(parseInt(e.target.value, 10) || 0)}
            inputProps={{ min: 0, max: 100 }}
            sx={{ mb: 4 }}
            helperText="Número de personas que viajarán contigo"
          />

          {/* Botón de búsqueda */}
          <Box textAlign="center">
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleCreateMatch}
              disabled={isLoading || !isFormComplete}
              sx={{
                fontSize: "1.125rem",
                fontWeight: 600,
                px: 6,
                py: 1.5,
                minWidth: 250,
              }}
            >
              {isLoading ? "Buscando chóferes..." : "Buscar Chóferes"}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {!isFormComplete
                ? "Selecciona origen y destino para continuar"
                : "Se buscarán chóferes disponibles en tu área"}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
