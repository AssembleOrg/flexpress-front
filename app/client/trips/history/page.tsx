"use client";

import { History as HistoryIcon } from "@mui/icons-material";
import {
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { RatingDisplay } from "@/components/ui/RatingDisplay";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import {
  useCanGiveFeedback,
  useUserFeedback,
} from "@/lib/hooks/queries/useFeedbackQueries";
import { useTripHistory } from "@/lib/hooks/queries/useTripQueries";
import type { Trip } from "@/lib/types/trip";

interface FeedbackModalState {
  open: boolean;
  tripId: string;
  toUserId: string;
  recipientName: string;
}

export default function ClientTripHistory() {
  const router = useRouter();
  const { data: trips = [], isLoading: tripsLoading } = useTripHistory();
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    open: false,
    tripId: "",
    toUserId: "",
    recipientName: "",
  });

  // Filter completed trips only
  const completedTrips = trips.filter((trip) => trip.status === "completed");

  const handleOpenFeedback = (trip: Trip) => {
    // toUserId is the charter (for a client giving feedback)
    const charterId = trip.charterId || "";
    const charterName = trip.charter?.name || "el charter";

    setFeedbackModal({
      open: true,
      tripId: trip.id,
      toUserId: charterId,
      recipientName: charterName,
    });
  };

  const handleCloseFeedback = () => {
    setFeedbackModal({
      open: false,
      tripId: "",
      toUserId: "",
      recipientName: "",
    });
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <AuthNavbar />

      <Container maxWidth="sm" sx={{ py: 4, px: 2 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" gap={1} mb={3}>
          <HistoryIcon sx={{ fontSize: 28, color: "primary.main" }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Historial de Viajes
          </Typography>
        </Stack>

        {/* Loading State */}
        {tripsLoading ? (
          <Box textAlign="center" py={6}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Cargando historial...
            </Typography>
          </Box>
        ) : completedTrips.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent sx={{ py: 6, textAlign: "center" }}>
              <HistoryIcon sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                No tienes viajes completados
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Una vez completes un viaje, podrás verlo aquí y dejar una
                calificación
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.push("/client/dashboard")}
                sx={{ mt: 3 }}
              >
                Volver al Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Trip List */
          <Stack gap={2}>
            {completedTrips.map((trip) => (
              <TripHistoryCard
                key={trip.id}
                trip={trip}
                onOpenFeedback={handleOpenFeedback}
              />
            ))}
          </Stack>
        )}
      </Container>

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModal.open}
        onClose={handleCloseFeedback}
        tripId={feedbackModal.tripId}
        toUserId={feedbackModal.toUserId}
        recipientName={feedbackModal.recipientName}
      />
    </Box>
  );
}

/**
 * Individual trip card component with feedback integration
 */
function TripHistoryCard({
  trip,
  onOpenFeedback,
}: {
  trip: Trip;
  onOpenFeedback: (trip: Trip) => void;
}) {
  const { data: canGive } = useCanGiveFeedback(trip.id);
  const { data: recipientFeedback } = useUserFeedback(trip.charterId || "");

  // Get the average rating given by others to this charter
  const charterAverageRating = recipientFeedback?.averageRating || 0;
  const charterTotalReviews = recipientFeedback?.totalCount || 0;

  return (
    <Card>
      <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: { xs: 1.5, md: 2 } } }}>
        {/* Trip Info Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start"
          mb={1}
        >
          <Box flex={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, maxWidth: "calc(100% - 80px)" }}>
              {trip.travelMatch?.destinationAddress || trip.address || "destino"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {trip.travelMatch?.pickupAddress || "origen"}
            </Typography>
          </Box>
          <Chip label="Completado" color="success" size="small" />
        </Stack>

        {/* Charter + Rating inline */}
        <Box display="flex" alignItems="center" gap={1} my={1}>
          <Typography variant="caption" color="text.secondary">
            Conductor:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {trip.charter?.name || "Charter"}
          </Typography>
          <RatingDisplay
            averageRating={charterAverageRating}
            totalReviews={charterTotalReviews}
            size="small"
          />
        </Box>

        {/* Feedback Section */}
        {canGive ? (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            fullWidth
            onClick={() => onOpenFeedback(trip)}
            sx={{ py: 0.75, fontWeight: 600, mt: 0.5 }}
          >
            Calificar
          </Button>
        ) : (
          <Box sx={{ textAlign: "center", py: 0.5 }}>
            <Typography
              variant="caption"
              color="success.main"
              sx={{ fontWeight: 500 }}
            >
              ✓ Ya has calificado este viaje
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
