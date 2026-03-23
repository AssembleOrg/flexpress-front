'use client';

import { ArrowBack } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Snackbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ConfirmMatchModal } from '@/components/modals/ConfirmMatchModal';
import { CharterCard } from '@/components/ui/CharterCard';
import { RouteMap } from '@/components/ui/Map';
import { useSelectCharter, useCancelMatch } from '@/lib/hooks/mutations/useTravelMatchMutations';
import { useUserFeedback } from '@/lib/hooks/queries/useFeedbackQueries';
import { usePublicPricing } from '@/lib/hooks/queries/useSystemConfigQueries';
import { useMatch } from '@/lib/hooks/queries/useTravelMatchQueries';
import { useMatchUpdateListener } from '@/lib/hooks/useWebSocket';
import { useAuthStore } from '@/lib/stores/authStore';
import { useTravelMatchStore } from '@/lib/stores/travelMatchStore';
import type { AvailableCharter } from '@/lib/types/api';
import { isMatchExpired, getFormattedExpirationTime, getMinutesUntilExpiration } from '@/lib/utils/matchHelpers';

/**
 * Charter card wrapper that fetches and displays rating
 */
function CharterCardWithRating({
  charter,
  isLoading,
  isPending,
  onSelect,
  systemPricePerKm,
}: {
  charter: AvailableCharter;
  isLoading: boolean;
  isPending?: boolean;
  onSelect: () => void;
  systemPricePerKm?: number;
}) {
  const { data: feedback } = useUserFeedback(charter.charterId);

  return (
    <CharterCard
      charter={charter}
      isLoading={isLoading}
      isPending={isPending}
      onSelect={onSelect}
      averageRating={feedback?.averageRating || 0}
      totalReviews={feedback?.totalCount || 0}
      systemPricePerKm={systemPricePerKm}
    />
  );
}

export default function MatchingPage() {
  const router = useRouter();
  const selectMutation = useSelectCharter();
  const cancelMutation = useCancelMatch();
  const { data: pricing } = usePublicPricing();

  // Modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCharterForConfirm, setSelectedCharterForConfirm] =
    useState<AvailableCharter | null>(null);

  // State to track selected charter waiting for acceptance
  const [selectedCharterPending, setSelectedCharterPending] =
    useState<AvailableCharter | null>(null);

  // Countdown state (minutes remaining until match expires)
  const [minutesLeft, setMinutesLeft] = useState<number>(-1);

  // Notification state
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // User state (for credits validation)
  const { user } = useAuthStore();
  const userCredits = user?.credits || 0;

  const {
    currentMatch,
    availableCharters,
    pickupAddress,
    pickupCoords,
    destinationAddress,
    destinationCoords,
  } = useTravelMatchStore();

  // Polling fallback: Detect when charter accepts via polling (WebSocket may be unreliable)
  const { data: polledMatch } = useMatch(currentMatch?.id || '');

  // Handler for when match is updated (charter accepts/rejects)
  const handleMatchUpdated = useCallback(
    (status: string) => {
      console.log('🔔 [MATCHING] Match status updated:', status);

      if (status === 'ACCEPTED') {
        // Descontar 1 crédito al cliente cuando el charter acepta
        const { user: currentUser, updateUser } = useAuthStore.getState();
        if (currentUser) {
          updateUser({ credits: Math.max(0, currentUser.credits - 1) });
        }

        setNotificationMessage(
          `¡El chófer ${selectedCharterPending?.charterName} aceptó tu solicitud!`
        );
        setNotificationOpen(true);

        // Auto-navigate after 2 seconds
        setTimeout(() => {
          if (currentMatch?.id) {
            console.log('🚀 [MATCHING] Redirecting to match detail...');
            router.push(`/client/trips/matching/${currentMatch.id}`);
          }
        }, 2000);
      } else if (status === 'REJECTED') {
        setNotificationMessage(
          `El chófer ${selectedCharterPending?.charterName} no pudo aceptar tu solicitud.`
        );
        setNotificationOpen(true);
        setSelectedCharterPending(null);
      } else if (status === 'EXPIRED') {
        setNotificationMessage('La solicitud ha expirado.');
        setNotificationOpen(true);
        setSelectedCharterPending(null);
      }
    },
    [selectedCharterPending?.charterName, currentMatch?.id, router]
  );

  // Listen for match updates
  useMatchUpdateListener(currentMatch?.id, handleMatchUpdated);

  // Polling effect: Detect when charter accepts via polling (fallback for WebSocket)
  useEffect(() => {
    if (!polledMatch || !selectedCharterPending) return;

    if (
      polledMatch.status === 'accepted' &&
      currentMatch?.status !== 'accepted'
    ) {
      console.log(
        `✅ [POLLING] Match accepted detected via polling for match ${polledMatch.id}`
      );
      handleMatchUpdated('ACCEPTED');
    } else if (
      polledMatch.status === 'rejected' &&
      currentMatch?.status !== 'rejected'
    ) {
      console.log(
        `❌ [POLLING] Match rejected detected via polling for match ${polledMatch.id}`
      );
      handleMatchUpdated('REJECTED');
    }
  }, [
    polledMatch?.status,
    selectedCharterPending,
    currentMatch?.status,
    handleMatchUpdated,
  ]);

  // Garantiza hidratación del store desde localStorage al montar la página
  useEffect(() => {
    useTravelMatchStore.persist.rehydrate();
  }, []);

  // Countdown: update minutes left every 30s while waiting for charter
  useEffect(() => {
    if (!selectedCharterPending || !currentMatch) return;
    setMinutesLeft(getMinutesUntilExpiration(currentMatch));
    const interval = setInterval(() => {
      setMinutesLeft(getMinutesUntilExpiration(currentMatch));
    }, 30_000);
    return () => clearInterval(interval);
  }, [selectedCharterPending, currentMatch]);

  // Monitor expiration: if match expires while we have a pending charter, clear it
  useEffect(() => {
    if (!selectedCharterPending || !currentMatch) {
      return;
    }

    // Check every 5 seconds if the match has expired
    const expirationCheckInterval = setInterval(() => {
      if (isMatchExpired(currentMatch)) {
        console.warn(
          `⏰ [MATCHING PAGE] Match ${currentMatch.id} has expired, clearing pending charter`
        );
        setSelectedCharterPending(null);
        setNotificationMessage('La solicitud ha expirado.');
        setNotificationOpen(true);
      }
    }, 5000);

    return () => clearInterval(expirationCheckInterval);
  }, [selectedCharterPending, currentMatch]);

  // Si no hay match activo, mostrar mensaje
  if (!currentMatch) {
    return (
      <Container
        maxWidth='md'
        sx={{ py: 4 }}
      >
        <Alert
          severity='warning'
          sx={{ mb: 2 }}
        >
          <Typography>
            No hay búsqueda activa. Por favor crea una nueva búsqueda.
          </Typography>
        </Alert>
        <Link href='/client/trips/new'>
          <Button
            variant='contained'
            color='secondary'
          >
            Crear Nueva Búsqueda
          </Button>
        </Link>
      </Container>
    );
  }

  // Cancel pending charter selection
  const handleCancelPending = async () => {
    if (!currentMatch) return;
    try {
      await cancelMutation.mutateAsync(currentMatch.id);
      useTravelMatchStore.getState().clearPersistedMatch();
      router.push('/client/trips/new');
    } catch {
      // error handled by mutation's onError toast
    }
  };

  // Abrir modal de confirmación cuando user selecciona un charter
  const handleSelectCharter = (charter: AvailableCharter) => {
    if (selectedCharterPending) return;
    setSelectedCharterForConfirm(charter);
    setConfirmModalOpen(true);
  };

  // Confirmar selección y proceder a mutation (SIN redirect inmediato)
  const handleConfirmSelection = async () => {
    if (!currentMatch || !selectedCharterForConfirm) return;

    try {
      console.log('📝 [MATCHING] Confirming charter selection');
      await selectMutation.mutateAsync({
        matchId: currentMatch.id,
        charterId: selectedCharterForConfirm.charterId,
      });

      // Mark the selected charter as pending (waiting for acceptance)
      setSelectedCharterPending(selectedCharterForConfirm);

      // Close modal
      setConfirmModalOpen(false);
      setSelectedCharterForConfirm(null);

      console.log(
        '✅ [MATCHING] Selection confirmed, waiting for charter to accept...'
      );
      // NO redirect - keep user in matching page while waiting
    } catch (error) {
      // Error is already handled by mutation's onError
      console.error('❌ [MATCHING] Selection failed:', error);
      setConfirmModalOpen(false);
      setSelectedCharterPending(null);
    }
  };

  return (
    <Container
      maxWidth='md'
      sx={{ py: 4 }}
    >
      {/* Header */}
      <Box mb={2}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}
        >
          <Link href='/client/trips/new'>
            <Button
              startIcon={<ArrowBack />}
              variant='outlined'
              size='small'
            >
              Nueva Búsqueda
            </Button>
          </Link>

          <Typography
            variant='subtitle1'
            component='h1'
            sx={{ fontWeight: 700, ml: 0.5 }}
          >
            Chóferes Disponibles
          </Typography>
        </Box>

        {currentMatch && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {pickupAddress && (
              <Chip
                label={`📍 ${pickupAddress.slice(0, 22)}...`}
                color='primary'
                variant='outlined'
                size='small'
              />
            )}
            {destinationAddress && (
              <Chip
                label={`🎯 ${destinationAddress.slice(0, 22)}...`}
                color='secondary'
                variant='outlined'
                size='small'
              />
            )}
            <Chip
              label={`${availableCharters.length} disponibles`}
              variant='outlined'
              size='small'
            />
          </Box>
        )}
      </Box>

      {/* Mapa de ruta */}
      {pickupCoords && destinationCoords && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 600, mb: 2 }}
            >
              📍 Ruta del Viaje
            </Typography>
            <RouteMap
              pickup={{
                lat: pickupCoords.lat,
                lon: pickupCoords.lon,
                label: 'Punto de Recogida',
                type: 'pickup',
              }}
              destination={{
                lat: destinationCoords.lat,
                lon: destinationCoords.lon,
                label: 'Punto de Destino',
                type: 'destination',
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Lista de chóferes */}
      {availableCharters.length === 0 ? (
        <Box>
          <Alert
            severity='warning'
            sx={{ mb: 3 }}
          >
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, mb: 1 }}
            >
              No se encontraron chóferes disponibles
            </Typography>
            <Typography
              variant='body2'
              sx={{ mb: 2 }}
            >
              Buscamos dentro de 30 km de tu punto de recogida, pero no hay
              chóferes disponibles en este momento.
            </Typography>
            <Typography
              variant='body2'
              component='div'
              sx={{ mb: 1 }}
            >
              <strong>Posibles razones:</strong>
              <ul style={{ marginTop: 8, marginBottom: 8, paddingLeft: 20 }}>
                <li>No hay chóferes dentro del radio de búsqueda</li>
                <li>Los chóferes cercanos no están disponibles ahora</li>
                <li>Todos están ocupados con otros viajes</li>
              </ul>
            </Typography>
            <Typography
              variant='body2'
              component='div'
            >
              <strong>Sugerencias:</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                <li>Ajusta tu punto de recogida o destino</li>
                <li>Intenta en unos minutos cuando un chófer esté libre</li>
                <li>Contacta a soporte para asistencia</li>
              </ul>
            </Typography>
          </Alert>

          <Link
            href='/client/trips/new'
            style={{ textDecoration: 'none' }}
          >
            <Button
              variant='contained'
              color='secondary'
            >
              Buscar de Nuevo
            </Button>
          </Link>
        </Box>
      ) : (
        <Box>
          {/* Alert when charter is pending acceptance */}
          {selectedCharterPending && (
            <Alert
              severity='warning'
              sx={{ mb: 3 }}
            >
              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 600, mb: 1 }}
              >
                Esperando confirmación del chófer
              </Typography>
              <Typography variant='body2'>
                El chófer <strong>{selectedCharterPending.charterName}</strong>{' '}
                tiene hasta las{' '}
                <strong>
                  {getFormattedExpirationTime(currentMatch) ?? '...'}
                </strong>{' '}
                para responder tu solicitud.
              </Typography>
              {minutesLeft > 0 && (
                <Typography
                  variant='body2'
                  sx={{ mt: 0.5 }}
                >
                  Tiempo restante: <strong>{minutesLeft} min</strong>
                </Typography>
              )}
              <Typography
                variant='body2'
                sx={{ mt: 1 }}
              >
                Aquí en esta página será notificado cuando{' '}
                <strong>acepte tu solicitud</strong>.
              </Typography>
              <Box sx={{ mt: 1.5 }}>
                <Button
                  size='small'
                  variant='outlined'
                  color='warning'
                  onClick={handleCancelPending}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending
                    ? 'Cancelando...'
                    : 'Cancelar solicitud'}
                </Button>
              </Box>
            </Alert>
          )}

          {availableCharters.map((charter) => {
            const isPending =
              selectedCharterPending?.charterId === charter.charterId;

            return (
              <CharterCardWithRating
                key={charter.charterId}
                charter={charter}
                isLoading={selectMutation.isPending || !!selectedCharterPending}
                isPending={isPending}
                onSelect={() => handleSelectCharter(charter)}
                systemPricePerKm={pricing?.creditsPerKm}
              />
            );
          })}
        </Box>
      )}

      {/* Confirmation Modal */}
      <ConfirmMatchModal
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedCharterForConfirm(null);
        }}
        onConfirm={handleConfirmSelection}
        match={currentMatch}
        selectedCharter={selectedCharterForConfirm}
        isLoading={selectMutation.isPending}
        userCredits={userCredits}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={notificationMessage.includes('aceptó') ? 10000 : 5000}
        onClose={() => setNotificationOpen(false)}
        message={notificationMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}
