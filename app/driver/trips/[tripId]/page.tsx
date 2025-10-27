"use client";

import {
  ArrowBack,
  AttachMoney,
  LocalShipping,
  LocationOn,
  Person,
  Star,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import Link from "next/link";
import toast from "react-hot-toast";
import StatusChip from "@/components/ui/StatusChip";

export default function TripDetailPage() {
  // const router = useRouter();

  const handleAcceptTrip = () => {
    // TODO: Implementar en Fase 4
    toast.error("Backend no conectado - Funcionalidad pendiente");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Link href="/driver/dashboard">
          <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
            Volver al Dashboard
          </Button>
        </Link>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <LocalShipping sx={{ fontSize: 32, color: "secondary.main" }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Detalle del Flete
          </Typography>
        </Box>

        <StatusChip status={"searching"} />
      </Box>

      {/* Información del cliente */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            👤 Cliente
          </Typography>

          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ width: 56, height: 56 }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Usuario
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Star sx={{ fontSize: 16, color: "warning.main" }} />
                <Typography variant="body2" color="text.secondary">
                  4.8 • 0 viajes
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Detalles del viaje */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            📍 Detalles del Viaje
          </Typography>

          {/* Ubicaciones */}
          <Box mb={3}>
            <Box display="flex" alignItems="start" gap={2} mb={2}>
              <LocationOn sx={{ color: "success.main", mt: 0.5 }} />
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  ORIGEN
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Por definir
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="start" gap={2}>
              <LocationOn sx={{ color: "error.main", mt: 0.5 }} />
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  DESTINO
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Por definir
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Descripción */}
          <Box mb={3}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.75rem", mb: 1 }}
            >
              DESCRIPCIÓN
            </Typography>
            <Typography variant="body1">Por definir</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Precio */}
          <Box display="flex" alignItems="center" gap={1}>
            <AttachMoney sx={{ color: "success.main" }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.75rem" }}
            >
              PRECIO SUGERIDO
            </Typography>
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "success.main" }}
          >
            $ 0
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Este precio es negociable en el chat
          </Typography>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Recuerda:</strong> Al aceptar este viaje podrás negociar el
          precio final directamente con el cliente a través del chat en tiempo
          real.
        </Typography>
      </Alert>

      {/* Acción principal */}
      <Box textAlign="center">
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={handleAcceptTrip}
          sx={{
            fontSize: "1.125rem",
            fontWeight: 600,
            px: 6,
            py: 1.5,
            minWidth: 200,
          }}
        >
          Aceptar Viaje
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Serás redirigido al chat para coordinar con el cliente
        </Typography>
      </Box>
    </Container>
  );
}
