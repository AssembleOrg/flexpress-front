"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { useTrip } from "@/lib/hooks/queries/useTripQueries";

export default function DriverTripDetailPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  const { data: trip, isLoading } = useTrip(tripId);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  // Auto-open feedback modal when trip is completed
  useEffect(() => {
    if (trip?.status === "completed" && !feedbackGiven) {
      setFeedbackModalOpen(true);
    }
  }, [trip?.status, feedbackGiven]);

  const handleFeedbackClose = () => {
    setFeedbackModalOpen(false);
    setFeedbackGiven(true);
  };

  if (isLoading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container sx={{ pt: 4 }}>
        <Alert severity="error">Viaje no encontrado</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Detalles del Viaje
        </Typography>

        <Card>
          <CardContent>
            <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Estado
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 600,
                        color:
                          trip.status === "completed"
                            ? "success.main"
                            : "info.main",
                      }}
                    >
                      {trip.status}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Cliente
                    </Typography>
                    <Typography variant="body2">
                      {trip.user?.name || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Origen
                    </Typography>
                    <Typography variant="body2">
                      {trip.travelMatch?.pickupAddress || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Destino
                    </Typography>
                    <Typography variant="body2">
                      {trip.travelMatch?.destinationAddress || trip.address || "N/A"}
                    </Typography>
                  </Box>

                  {trip.travelMatch?.distanceKm && (
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Distancia
                      </Typography>
                      <Typography variant="body2">
                        {trip.travelMatch.distanceKm.toFixed(1)} km
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Créditos Estimados
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {trip.travelMatch?.estimatedCredits || 0} créditos
                    </Typography>
                  </Box>

                  {trip.status === "completed" && (
                    <Alert severity="success">
                      ✅ Viaje completado. Los créditos han sido transferidos.
                    </Alert>
                  )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Feedback Modal - Opens automatically when trip is completed */}
      {trip.user && (
        <FeedbackModal
          open={feedbackModalOpen}
          onClose={handleFeedbackClose}
          tripId={trip.id}
          toUserId={trip.user.id}
          recipientName={trip.user.name}
        />
      )}
    </Container>
  );
}
