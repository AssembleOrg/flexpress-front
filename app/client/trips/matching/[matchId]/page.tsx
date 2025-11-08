"use client";

import { ArrowBack } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { useMatch } from "@/lib/hooks/queries/useTravelMatchQueries";
import type { User } from "@/lib/types/api";
import { TravelMatchStatus, UserRole } from "@/lib/types/api";

/**
 * Match detail page with conditional UI based on match status
 *
 * Shows different UI depending on the match status:
 * - pending: "Waiting for charter response" message
 * - accepted: Chat window (conversation ready)
 * - rejected: "Charter rejected" message with option to search again
 * - expired: "Request expired" message with option to search again
 */
export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;

  const { data: match, isLoading } = useMatch(matchId);

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Cargando detalles del viaje...</Typography>
      </Container>
    );
  }

  // ============================================
  // ERROR STATE: Match not found
  // ============================================
  if (!match) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography>No se encontró la solicitud</Typography>
        </Alert>
        <Link href="/client/dashboard">
          <Button variant="contained" color="secondary">
            Volver al Dashboard
          </Button>
        </Link>
      </Container>
    );
  }

  // ============================================
  // PENDING STATE: Waiting for charter response
  // ============================================
  if (
    match.status === TravelMatchStatus.SEARCHING ||
    match.status === TravelMatchStatus.PENDING
  ) {
    const timeRemaining = match.expiresAt
      ? new Date(match.expiresAt).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "desconocido";

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Detalles del Viaje
          </Typography>
        </Box>

        {/* Waiting for response alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            ⏳ Esperando confirmación del chófer
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            El chófer <strong>{match.charter?.name || "Chófer"}</strong> tiene
            hasta las {timeRemaining} para responder a tu solicitud.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Mientras esperas, puedes revisar los detalles de tu solicitud abajo.
          </Typography>
        </Alert>

        {/* Trip details */}
        <Stack spacing={3}>
          {/* Pickup and Destination */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                📍 Ruta del Viaje
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Punto de Recogida
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {match.pickupAddress || "No especificado"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Punto de Destino
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {match.destinationAddress || "No especificado"}
                </Typography>
              </Box>

              {match.scheduledDate && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fecha Programada
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(match.scheduledDate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Match Details */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                💼 Detalles
              </Typography>

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Distancia
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {match.distanceKm
                      ? `${match.distanceKm.toFixed(1)} km`
                      : "N/A"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Créditos Estimados
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {match.estimatedCredits || 0} pts
                  </Typography>
                </Box>

                {match.workersCount && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Número de Trabajadores
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {match.workersCount}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => router.push("/client/dashboard")}
              fullWidth
            >
              Cancelar Solicitud
            </Button>
          </Box>
        </Stack>
      </Container>
    );
  }

  // ============================================
  // REJECTED STATE: Charter rejected
  // ============================================
  if (match.status === TravelMatchStatus.REJECTED) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Detalles del Viaje
          </Typography>
        </Box>

        {/* Rejected alert */}
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            ❌ Solicitud Rechazada
          </Typography>
          <Typography variant="body2">
            El chófer <strong>{match.charter?.name || "Chófer"}</strong> rechazó
            tu solicitud de viaje. Puedes buscar otro chófer disponible.
          </Typography>
        </Alert>

        {/* Trip details for reference */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Detalles de tu Solicitud
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Origen
              </Typography>
              <Typography variant="body2">
                {match.pickupAddress || "No especificado"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Destino
              </Typography>
              <Typography variant="body2">
                {match.destinationAddress || "No especificado"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Action button */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/client/trips/new")}
          fullWidth
          size="large"
        >
          Buscar Otro Chófer
        </Button>
      </Container>
    );
  }

  // ============================================
  // EXPIRED STATE: Request expired
  // ============================================
  if (match.status === TravelMatchStatus.EXPIRED) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Detalles del Viaje
          </Typography>
        </Box>

        {/* Expired alert */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            ⏰ Solicitud Expirada
          </Typography>
          <Typography variant="body2">
            El tiempo de espera para que el chófer respondiera ha expirado. Por
            favor, crea una nueva búsqueda para continuar.
          </Typography>
        </Alert>

        {/* Trip details for reference */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Detalles de tu Solicitud
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Origen
              </Typography>
              <Typography variant="body2">
                {match.pickupAddress || "No especificado"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Destino
              </Typography>
              <Typography variant="body2">
                {match.destinationAddress || "No especificado"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Action button */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/client/trips/new")}
          fullWidth
          size="large"
        >
          Nueva Búsqueda
        </Button>
      </Container>
    );
  }

  // ============================================
  // ACCEPTED STATE: Show chat window
  // ============================================
  if (match.status === TravelMatchStatus.ACCEPTED) {
    // Determine the other user (charter driver)
    const otherUser: User = {
      id: match.charter?.id || match.charterId || "",
      name: match.charter?.name || "Chófer",
      email: match.charter?.email || "",
      role: UserRole.CHARTER,
      credits: match.charter?.credits || 0,
      address: match.charter?.address || "",
      number: match.charter?.number || "",
      avatar: match.charter?.avatar || null,
      originAddress: match.charter?.originAddress || null,
      originLatitude: match.charter?.originLatitude || null,
      originLongitude: match.charter?.originLongitude || null,
      createdAt: match.charter?.createdAt || new Date().toISOString(),
      updatedAt: match.charter?.updatedAt || new Date().toISOString(),
    };

    // Use conversationId if available, fallback to matchId
    const conversationId = match.conversationId || matchId;

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Detalles del Viaje
            </Typography>
            <Chip label="✅ Aceptado" color="success" />
          </Box>

          <Typography variant="body1" color="text.secondary">
            Chófer: <strong>{match.charter?.name || "Chófer"}</strong>
          </Typography>
        </Box>

        {/* Main content grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          {/* Left column: Trip details */}
          <Box>
            {/* Pickup and Destination */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  📍 Ruta del Viaje
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Punto de Recogida
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {match.pickupAddress || "No especificado"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Punto de Destino
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {match.destinationAddress || "No especificado"}
                  </Typography>
                </Box>

                {match.scheduledDate && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Fecha Programada
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(match.scheduledDate).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Match Details */}
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  💼 Detalles
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Distancia
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {match.distanceKm
                        ? `${match.distanceKm.toFixed(1)} km`
                        : "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Créditos Estimados
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {match.estimatedCredits || 0} pts
                    </Typography>
                  </Box>

                  {match.workersCount && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Número de Trabajadores
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {match.workersCount}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right column: Chat */}
          <Box>
            <Box sx={{ position: "relative", height: "100%" }}>
              <ChatWindow
                conversationId={conversationId}
                otherUser={otherUser}
                onClose={() => router.push("/client/dashboard")}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    );
  }

  // ============================================
  // COMPLETED STATE: Trip finished successfully
  // ============================================
  if (match.status === TravelMatchStatus.COMPLETED) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Viaje Completado
          </Typography>
        </Box>

        {/* Success alert */}
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            ✅ Viaje Completado Exitosamente
          </Typography>
          <Typography variant="body2">
            Tu viaje con <strong>{match.charter?.name || "el chófer"}</strong>
            {""}ha sido completado. Los créditos han sido transferidos.
          </Typography>
        </Alert>

        {/* Trip summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Resumen del Viaje
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Origen
              </Typography>
              <Typography variant="body2">
                {match.pickupAddress || "No especificado"}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Destino
              </Typography>
              <Typography variant="body2">
                {match.destinationAddress || "No especificado"}
              </Typography>
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Distancia Recorrida
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {match.distanceKm
                    ? `${match.distanceKm.toFixed(1)} km`
                    : "N/A"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Créditos Utilizados
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {match.estimatedCredits || 0} pts
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <Stack spacing={2}>
          {match.tripId && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => router.push(`/client/trips/${match.tripId}`)}
              fullWidth
            >
              Ver Detalles del Viaje
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/client/dashboard")}
            fullWidth
          >
            Volver al Dashboard
          </Button>
        </Stack>
      </Container>
    );
  }

  // ============================================
  // CANCELLED STATE: Trip was cancelled
  // ============================================
  if (match.status === TravelMatchStatus.CANCELLED) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Viaje Cancelado
          </Typography>
        </Box>

        {/* Cancelled alert */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            🚫 Viaje Cancelado
          </Typography>
          <Typography variant="body2">
            Este viaje ha sido cancelado. Si tienes preguntas, contacta a
            soporte.
          </Typography>
        </Alert>

        {/* Trip details for reference */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Detalles de la Solicitud Cancelada
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Origen
              </Typography>
              <Typography variant="body2">
                {match.pickupAddress || "No especificado"}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Destino
              </Typography>
              <Typography variant="body2">
                {match.destinationAddress || "No especificado"}
              </Typography>
            </Box>

            {match.charter?.name && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Chófer Asignado
                </Typography>
                <Typography variant="body2">{match.charter.name}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <Stack spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/client/trips/new")}
            fullWidth
          >
            Nueva Búsqueda
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => router.push("/client/dashboard")}
            fullWidth
          >
            Volver al Dashboard
          </Button>
        </Stack>
      </Container>
    );
  }

  // ============================================
  // SEARCHING STATE: Charter selected, waiting for confirmation
  // ============================================
  if (match.status === TravelMatchStatus.SEARCHING) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box mb={4}>
          <Link href="/client/dashboard">
            <Button startIcon={<ArrowBack />} variant="outlined" sx={{ mb: 2 }}>
              Volver
            </Button>
          </Link>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Procesando Solicitud
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            🔍 Buscando Chóferes Disponibles
          </Typography>
          <Typography variant="body2">
            Estamos procesando tu solicitud y buscando chóferes cercanos. Te
            notificaremos cuando encontremos opciones disponibles.
          </Typography>
        </Alert>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              📍 Detalles de tu Solicitud
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Origen
              </Typography>
              <Typography variant="body2">
                {match.pickupAddress || "No especificado"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Destino
              </Typography>
              <Typography variant="body2">
                {match.destinationAddress || "No especificado"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          onClick={() => router.push("/client/dashboard")}
          fullWidth
        >
          Volver al Dashboard
        </Button>
      </Container>
    );
  }

  // ============================================
  // FALLBACK: Unknown status
  // ============================================
  console.error("❌ [MATCH DETAIL] Unknown match status:", {
    matchId: match.id,
    status: match.status,
    statusType: typeof match.status,
    charterId: match.charterId,
    userId: match.userId,
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography>
          Estado desconocido: "{match.status}" (tipo: {typeof match.status})
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          ID del match: {match.id}
        </Typography>
      </Alert>
      <Link href="/client/dashboard">
        <Button variant="contained" color="secondary">
          Volver al Dashboard
        </Button>
      </Link>
    </Container>
  );
}
