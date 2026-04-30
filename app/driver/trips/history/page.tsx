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
import { MOBILE_BOTTOM_NAV_HEIGHT } from "@/lib/constants/mobileDesign";
import type { Trip } from "@/lib/types/trip";

type FilterPeriod = "all" | "month" | "3months";

interface FeedbackModalState {
  open: boolean;
  tripId: string;
  toUserId: string;
  recipientName: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function filterByPeriod(trips: Trip[], period: FilterPeriod): Trip[] {
  if (period === "all") return trips;

  const now = new Date();
  const cutoff = new Date(now);
  if (period === "month") {
    cutoff.setMonth(now.getMonth() - 1);
  } else {
    cutoff.setMonth(now.getMonth() - 3);
  }

  return trips.filter((trip) => {
    const date = new Date(trip.createdAt);
    return !isNaN(date.getTime()) && date >= cutoff;
  });
}

export default function DriverTripHistory() {
  const router = useRouter();
  const { data: trips = [], isLoading: tripsLoading } = useTripHistory();
  const [filter, setFilter] = useState<FilterPeriod>("all");
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    open: false,
    tripId: "",
    toUserId: "",
    recipientName: "",
  });

  // Sort descending (most recent first), then filter
  const completedTrips = [...trips]
    .filter((trip) => trip.status === "completed")
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

  const filteredTrips = filterByPeriod(completedTrips, filter);
  const hasAnyCompleted = completedTrips.length > 0;

  const handleOpenFeedback = (trip: Trip) => {
    const userId = trip.user?.id || trip.userId || "";
    const userName = trip.user?.name || "el cliente";

    setFeedbackModal({
      open: true,
      tripId: trip.id,
      toUserId: userId,
      recipientName: userName,
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

  const filterOptions: { label: string; value: FilterPeriod }[] = [
    { label: "Todos", value: "all" },
    { label: "Este mes", value: "month" },
    { label: "Últimos 3 meses", value: "3months" },
  ];

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <AuthNavbar />

      <Container
        maxWidth="sm"
        sx={{
          py: 4,
          px: 2,
          pb: { xs: `${MOBILE_BOTTOM_NAV_HEIGHT + 24}px`, md: 4 },
        }}
      >
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
        ) : !hasAnyCompleted ? (
          /* Empty State — no completed trips at all */
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
                onClick={() => router.push("/driver/dashboard")}
                sx={{ mt: 3 }}
              >
                Volver al Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filter Chips */}
            <Stack
              direction="row"
              gap={1}
              mb={2}
              sx={{ overflowX: "auto", pb: 0.5 }}
            >
              {filterOptions.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  onClick={() => setFilter(opt.value)}
                  variant={filter === opt.value ? "filled" : "outlined"}
                  color={filter === opt.value ? "primary" : "default"}
                  size="small"
                  sx={{
                    borderRadius: "20px",
                    fontWeight: filter === opt.value ? 600 : 400,
                    flexShrink: 0,
                  }}
                />
              ))}
            </Stack>

            {/* Count */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 2 }}
            >
              {filteredTrips.length}{" "}
              {filteredTrips.length === 1 ? "viaje" : "viajes"}
            </Typography>

            {/* Trip List or Filtered Empty State */}
            {filteredTrips.length === 0 ? (
              <Card>
                <CardContent sx={{ py: 5, textAlign: "center" }}>
                  <HistoryIcon
                    sx={{ fontSize: 40, color: "grey.300", mb: 1.5 }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    No hay viajes en este período
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setFilter("all")}
                  >
                    Ver todos
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Stack gap={2}>
                {filteredTrips.map((trip) => (
                  <TripHistoryCard
                    key={trip.id}
                    trip={trip}
                    onOpenFeedback={handleOpenFeedback}
                  />
                ))}
              </Stack>
            )}
          </>
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
  const clientId = trip.user?.id || trip.userId || "";
  const { data: canGive } = useCanGiveFeedback(trip.id);
  const { data: clientFeedback } = useUserFeedback(clientId);

  const clientAverageRating = clientFeedback?.averageRating || 0;
  const clientTotalReviews = clientFeedback?.totalCount || 0;
  const dateLabel = trip.createdAt ? formatDate(trip.createdAt) : null;

  return (
    <Card>
      <CardContent
        sx={{
          p: { xs: 1.5, md: 2 },
          "&:last-child": { pb: { xs: 1.5, md: 2 } },
        }}
      >
        {/* Trip Info Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start"
          mb={1}
        >
          <Box flex={1} sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ fontWeight: 600, maxWidth: "calc(100% - 80px)" }}
            >
              {trip.travelMatch?.destinationAddress ||
                trip.address ||
                "destino"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {trip.travelMatch?.pickupAddress || "origen"}
            </Typography>
          </Box>
          <Chip label="Completado" color="success" size="small" />
        </Stack>

        {/* Date */}
        {dateLabel && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5 }}
          >
            {dateLabel}
          </Typography>
        )}

        {/* Cliente + Rating inline */}
        <Box display="flex" alignItems="center" gap={1} my={1}>
          <Typography variant="caption" color="text.secondary">
            Cliente:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {trip.user?.name || "Cliente"}
          </Typography>
          <RatingDisplay
            averageRating={clientAverageRating}
            totalReviews={clientTotalReviews}
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
