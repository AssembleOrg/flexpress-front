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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmMatchModal } from '@/components/modals/ConfirmMatchModal';
import { CharterCard } from '@/components/ui/CharterCard';
import { RouteMap } from '@/components/ui/Map';
import { WaitingForCharterCard } from '@/components/ui/WaitingForCharterCard';
import { useSelectCharter, useCancelMatch, useCreateMatch } from '@/lib/hooks/mutations/useTravelMatchMutations';
import { useCreateInquiry } from '@/lib/hooks/mutations/useAvailabilityInquiriesMutations';
import { useUserFeedback } from '@/lib/hooks/queries/useFeedbackQueries';
import { useMatch } from '@/lib/hooks/queries/useTravelMatchQueries';
import { useMatchUpdateListener } from '@/lib/hooks/useWebSocket';
import { useAuthStore } from '@/lib/stores/authStore';
import { useTravelMatchStore } from '@/lib/stores/travelMatchStore';
import type { AvailableCharter } from '@/lib/types/api';
import { VehicleSize, VEHICLE_SIZE_LABELS } from '@/lib/types/api';
import { isMatchExpired, getFormattedExpirationTime, getMinutesUntilExpiration } from '@/lib/utils/matchHelpers';

/**
 * Charter card wrapper that fetches and displays rating
 */
function CharterCardWithRating({
  charter,
  isLoading,
  isPending,
  onSelect,
  onInquiry,
  isInquiryLoading,
}: {
  charter: AvailableCharter;
  isLoading: boolean;
  isPending?: boolean;
  onSelect: () => void;
  onInquiry?: () => void;
  isInquiryLoading?: boolean;
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
      onInquiry={onInquiry}
      isInquiryLoading={isInquiryLoading}
    />
  );
}

export default function MatchingPage() {
  const router = useRouter();
  const selectMutation = useSelectCharter();
  const cancelMutation = useCancelMatch();
  const createMatchMutation = useCreateMatch();

  // Evita el doble descuento de crédito cuando socket + polling reportan el
  // mismo ACCEPTED. Se marca por match para no bloquear futuros matches.
  const chargedCreditMatchId = useRef<string | null>(null);

  // Evita regenerar la búsqueda dos veces cuando el mismo evento terminal llega
  // por dos vías (socket + watchdog, o cancel + socket CANCELLED).
  const isRegenerating = useRef(false);

  // Idempotencia de eventos terminales (REJECTED/EXPIRED/CANCELLED): no procesar
  // dos veces el mismo (match + estado) que puede llegar por socket y polling.
  const handledTerminal = useRef<string | null>(null);

  // Modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCharterForConfirm, setSelectedCharterForConfirm] =
    useState<AvailableCharter | null>(null);

  // Inquiry modal state (charter ocupado → consultar disponibilidad)
  const createInquiryMutation = useCreateInquiry();
  const [inquiryConfirmOpen, setInquiryConfirmOpen] = useState(false);
  const [selectedCharterForInquiry, setSelectedCharterForInquiry] =
    useState<AvailableCharter | null>(null);

  const handleOpenInquiryConfirm = useCallback((charter: AvailableCharter) => {
    setSelectedCharterForInquiry(charter);
    setInquiryConfirmOpen(true);
  }, []);

  const handleCloseInquiryConfirm = useCallback(() => {
    setInquiryConfirmOpen(false);
    setSelectedCharterForInquiry(null);
  }, []);

  const handleSubmitInquiry = useCallback(() => {
    if (!selectedCharterForInquiry) return;
    createInquiryMutation.mutate(selectedCharterForInquiry.charterId, {
      onSettled: () => handleCloseInquiryConfirm(),
    });
  }, [createInquiryMutation, selectedCharterForInquiry, handleCloseInquiryConfirm]);

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
    sizeFilter,
    setSizeFilter,
  } = useTravelMatchStore();

  // ¿El match permite (re)seleccionar chófer? Alineado con el guard del backend
  // (searching/pending/rejected). En estados terminales (accepted/completed/
  // cancelled/expired) la lista queda deshabilitada y se regenera la búsqueda.
  const isMatchSelectable =
    !!currentMatch &&
    ['searching', 'pending', 'rejected'].includes(currentMatch.status);

  // Regenera la búsqueda reutilizando los datos del match actual (origen,
  // destino, ayudantes, carga) y deja al cliente en la lista con chóferes
  // frescos, SIN re-completar el formulario. Se usa cuando el match quedó en un
  // estado no reseleccionable (cancelado/expirado). Si algo falla, cae al
  // formulario, que conserva las direcciones desde el store persistido.
  const researchWithSameData = useCallback(async () => {
    // Guard contra doble regeneración (socket + watchdog en el mismo tick).
    if (isRegenerating.current) return;

    const match = useTravelMatchStore.getState().currentMatch;
    if (!match) {
      router.push('/client/trips/new');
      return;
    }

    // Sin créditos no tiene sentido regenerar: el viaje no podría cerrarse.
    // Avisamos y mandamos al formulario, que muestra el CTA de recargar.
    const currentCredits = useAuthStore.getState().user?.credits ?? 0;
    if (currentCredits < 1) {
      setNotificationMessage('No tenés créditos para buscar otro chófer.');
      setNotificationOpen(true);
      router.push('/client/trips/new');
      return;
    }

    isRegenerating.current = true;
    try {
      await createMatchMutation.mutateAsync({
        pickupAddress: match.pickupAddress,
        pickupLatitude: match.pickupLatitude,
        pickupLongitude: match.pickupLongitude,
        destinationAddress: match.destinationAddress,
        destinationLatitude: match.destinationLatitude,
        destinationLongitude: match.destinationLongitude,
        workersCount: match.workersCount,
        cargoDescription: match.cargoDescription || undefined,
        scheduledDate: match.scheduledDate || undefined,
      });
      chargedCreditMatchId.current = null;
      handledTerminal.current = null;
    } catch {
      router.push('/client/trips/new');
    } finally {
      isRegenerating.current = false;
    }
  }, [createMatchMutation, router]);

  // Orden de la lista de chóferes (reordena, no filtra)
  const [sortBy, setSortBy] = useState<'distance' | 'helpers' | 'price'>(
    'distance',
  );

  const sortedCharters = useMemo(() => {
    // Filtro por tamaño (client-side). null = "Todos".
    let copy = [...availableCharters];
    if (sizeFilter) {
      copy = copy.filter((c) => c.vehicleSize === sizeFilter);
    }
    if (sortBy === 'helpers') {
      return copy.sort((a, b) => {
        const diff = (b.helpersCount ?? 0) - (a.helpersCount ?? 0);
        if (diff !== 0) return diff;
        return a.distanceToPickup - b.distanceToPickup;
      });
    }
    if (sortBy === 'price') {
      // Más barato primero. Charters sin estimado (null) van al final.
      return copy.sort((a, b) => {
        const pa = a.estimatedPriceArs ?? Number.POSITIVE_INFINITY;
        const pb = b.estimatedPriceArs ?? Number.POSITIVE_INFINITY;
        if (pa !== pb) return pa - pb;
        return a.distanceToPickup - b.distanceToPickup;
      });
    }
    return copy.sort((a, b) => a.distanceToPickup - b.distanceToPickup);
  }, [availableCharters, sortBy, sizeFilter]);

  // Polling fallback: Detect when charter accepts via polling (WebSocket may be unreliable)
  const { data: polledMatch } = useMatch(currentMatch?.id || '');

  // Handler for when match is updated (charter accepts/rejects)
  const handleMatchUpdated = useCallback(
    (status: string) => {
      console.log('🔔 [MATCHING] Match status updated:', status);

      if (status === 'ACCEPTED') {
        // Descontar 1 crédito al cliente cuando el charter acepta.
        // Guard de idempotencia: socket y polling pueden reportar el mismo
        // ACCEPTED; solo descontamos una vez por match.
        if (currentMatch?.id && chargedCreditMatchId.current !== currentMatch.id) {
          chargedCreditMatchId.current = currentMatch.id;
          const { user: currentUser, updateUser } = useAuthStore.getState();
          if (currentUser) {
            updateUser({ credits: Math.max(0, currentUser.credits - 1) });
          }
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
      } else if (
        status === 'REJECTED' ||
        status === 'EXPIRED' ||
        status === 'CANCELLED'
      ) {
        // Solo procesamos un evento terminal si estábamos esperando a un chófer.
        // Un disparo con pending ya en null es un duplicado tardío (socket +
        // polling) o un eco: lo ignoramos.
        if (!selectedCharterPending) return;

        // Idempotencia extra por si el mismo evento llega dos veces mientras el
        // pending sigue seteado. Key = match + estado + chófer pendiente.
        const terminalKey = `${currentMatch?.id ?? ''}:${status}:${selectedCharterPending.charterId}`;
        if (handledTerminal.current === terminalKey) return;
        handledTerminal.current = terminalKey;

        setSelectedCharterPending(null);

        if (status === 'REJECTED') {
          // El match queda 'rejected' pero reseleccionable: quitamos al chófer
          // que rechazó de la lista para que no se lo pueda volver a elegir.
          const rejectedId = selectedCharterPending?.charterId;
          if (rejectedId) {
            const store = useTravelMatchStore.getState();
            store.setAvailableCharters(
              store.availableCharters.filter(
                (c) => c.charterId !== rejectedId,
              ),
            );
          }
          setNotificationMessage(
            `El chófer ${selectedCharterPending?.charterName} no pudo aceptar tu solicitud. Podés elegir otro.`
          );
          setNotificationOpen(true);
        } else {
          // EXPIRED / CANCELLED son terminales no reseleccionables:
          // regeneramos la búsqueda para poder elegir otro sin re-tipear.
          setNotificationMessage(
            status === 'EXPIRED'
              ? 'La solicitud expiró. Buscando chóferes de nuevo…'
              : 'La solicitud fue cancelada. Buscando chóferes de nuevo…'
          );
          setNotificationOpen(true);
          void researchWithSameData();
        }
      }
    },
    [
      selectedCharterPending,
      currentMatch?.id,
      router,
      researchWithSameData,
    ]
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

  // Monitor expiration: if match expires while we have a pending charter,
  // regenera la búsqueda para que el cliente pueda elegir otro chófer.
  useEffect(() => {
    if (!selectedCharterPending || !currentMatch) {
      return;
    }

    let handled = false;
    // Check every 5 seconds if the match has expired
    const expirationCheckInterval = setInterval(() => {
      if (!handled && isMatchExpired(currentMatch)) {
        handled = true;
        console.warn(
          `⏰ [MATCHING PAGE] Match ${currentMatch.id} has expired, re-buscando`
        );
        setSelectedCharterPending(null);
        setNotificationMessage('La solicitud expiró. Buscando chóferes de nuevo…');
        setNotificationOpen(true);
        void researchWithSameData();
      }
    }, 5000);

    return () => clearInterval(expirationCheckInterval);
  }, [selectedCharterPending, currentMatch, researchWithSameData]);

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

  // Cancel pending charter selection.
  // Conserva la búsqueda: cancela el match actual y regenera uno nuevo con los
  // mismos datos para que el cliente pueda elegir otro chófer sin re-tipear.
  const handleCancelPending = async () => {
    if (!currentMatch) return;
    try {
      await cancelMutation.mutateAsync(currentMatch.id);
      chargedCreditMatchId.current = null;
      setSelectedCharterPending(null);
      // Regenera la búsqueda; si falla, researchWithSameData cae al formulario.
      await researchWithSameData();
    } catch {
      // error handled by mutations' onError toast
    }
  };

  // Abrir modal de confirmación cuando user selecciona un charter
  const handleSelectCharter = (charter: AvailableCharter) => {
    // No permitir seleccionar mientras se espera confirmación de otro chófer,
    // ni sobre un match en estado no seleccionable.
    if (selectedCharterPending || !isMatchSelectable) return;
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

        {/* Orden de la lista (reordena, no filtra) */}
        {availableCharters.length > 1 && (
          <Box
            sx={{
              mt: 1.5,
              display: 'inline-flex',
              p: 0.5,
              gap: 0.5,
              bgcolor: 'background.default',
              borderRadius: 999,
            }}
          >
            {([
              { key: 'distance', label: 'Cercanía' },
              { key: 'price', label: 'Más barato' },
              { key: 'helpers', label: 'Más equipo' },
            ] as const).map(({ key, label }) => {
              const active = sortBy === key;
              return (
                <Box
                  key={key}
                  component='button'
                  type='button'
                  onClick={() => setSortBy(key)}
                  sx={{
                    border: 'none',
                    cursor: 'pointer',
                    px: 2,
                    py: 0.75,
                    borderRadius: 999,
                    fontSize: '0.8rem',
                    fontWeight: active ? 700 : 500,
                    fontFamily: 'inherit',
                    color: active ? 'secondary.contrastText' : 'text.secondary',
                    bgcolor: active ? 'secondary.main' : 'transparent',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {label}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Filtro por tamaño de flete (client-side). null = "Todos". */}
        {availableCharters.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              display: 'flex',
              flexWrap: 'wrap',
              p: 0.5,
              gap: 0.5,
              bgcolor: 'background.default',
              borderRadius: 3,
            }}
          >
            {([
              { key: null, label: 'Todos' },
              ...Object.values(VehicleSize).map((s) => ({
                key: s,
                label: VEHICLE_SIZE_LABELS[s],
              })),
            ]).map(({ key, label }) => {
              const active = sizeFilter === key;
              return (
                <Box
                  key={key ?? 'all'}
                  component='button'
                  type='button'
                  onClick={() => setSizeFilter(key)}
                  sx={{
                    border: 'none',
                    cursor: 'pointer',
                    px: 2,
                    py: 0.75,
                    borderRadius: 999,
                    fontSize: '0.8rem',
                    fontWeight: active ? 700 : 500,
                    fontFamily: 'inherit',
                    color: active ? 'secondary.contrastText' : 'text.secondary',
                    bgcolor: active ? 'secondary.main' : 'transparent',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {label}
                </Box>
              );
            })}
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
          {/* Premium waiting card when charter is pending acceptance */}
          {selectedCharterPending && (
            <WaitingForCharterCard
              charter={selectedCharterPending}
              expirationLabel={getFormattedExpirationTime(currentMatch)}
              minutesLeft={minutesLeft}
              onCancel={handleCancelPending}
              isCancelling={cancelMutation.isPending}
            />
          )}

          {/* Filtro por tamaño dejó la lista vacía, pero hay charters de otros
              tamaños. Distinto del alert de "0 chóferes en 30 km". */}
          {!selectedCharterPending &&
            sortedCharters.length === 0 &&
            sizeFilter && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ mb: 2 }} color='text.secondary'>
                  No hay {VEHICLE_SIZE_LABELS[sizeFilter]} disponibles cerca.
                </Typography>
                <Button
                  variant='outlined'
                  color='secondary'
                  onClick={() => setSizeFilter(null)}
                >
                  Ver todos los tamaños
                </Button>
              </Box>
            )}

          {sortedCharters.map((charter) => {
            const isPending =
              selectedCharterPending?.charterId === charter.charterId;

            return (
              <CharterCardWithRating
                key={charter.charterId}
                charter={charter}
                isLoading={
                  selectMutation.isPending ||
                  createMatchMutation.isPending ||
                  !!selectedCharterPending ||
                  !isMatchSelectable
                }
                isPending={isPending}
                onSelect={() => handleSelectCharter(charter)}
                onInquiry={() => handleOpenInquiryConfirm(charter)}
                isInquiryLoading={
                  createInquiryMutation.isPending &&
                  selectedCharterForInquiry?.charterId === charter.charterId
                }
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

      {/* Inquiry Confirmation Modal */}
      <Dialog
        open={inquiryConfirmOpen}
        onClose={handleCloseInquiryConfirm}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Consultar disponibilidad</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Querés consultarle a{' '}
            <strong>{selectedCharterForInquiry?.charterName}</strong> si tendrá
            disponibilidad? Te responderá con un mensaje rápido. Es gratis.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseInquiryConfirm}
            disabled={createInquiryMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant='contained'
            color='warning'
            onClick={handleSubmitInquiry}
            disabled={createInquiryMutation.isPending}
          >
            {createInquiryMutation.isPending ? 'Enviando...' : 'Enviar consulta'}
          </Button>
        </DialogActions>
      </Dialog>

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
