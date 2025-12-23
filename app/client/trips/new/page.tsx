'use client';

import { ArrowBack, LocalShipping, Map as MapIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Typography,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AddressInput } from '@/components/ui/AddressInput';
import { InstructionBanner } from '@/components/ui/InstructionBanner';
import { LocationChip } from '@/components/ui/LocationChip';
// biome-ignore lint/suspicious/noShadowRestrictedNames: exported as alias from Map component
import { Map, type MapHandle } from '@/components/ui/Map';
import { RouteTimeline } from '@/components/ui/RouteTimeline';
import { geoApi } from '@/lib/api/geo';
import { useCreateMatch } from '@/lib/hooks/mutations/useTravelMatchMutations';
import { useUserMatches } from '@/lib/hooks/queries/useTravelMatchQueries';
import { useHydrated } from '@/lib/hooks/useHydrated';
import { useAuthStore } from '@/lib/stores/authStore';
import { useTravelMatchStore } from '@/lib/stores/travelMatchStore';
import { isActiveTrip } from '@/lib/utils/matchHelpers';

const MotionCard = motion.create(Card);
const MotionButton = motion.create(Button);

export default function NewTripPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { isAuthenticated } = useAuthStore();

  // Check for existing active trip
  const { data: myMatches = [] } = useUserMatches();

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      console.log('❌ [PAGE] User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  // Check if user has active trip
  const activeTrip = myMatches.find(isActiveTrip);

  // Form state from Zustand
  const {
    pickupAddress,
    pickupCoords,
    destinationAddress,
    destinationCoords,
    setPickupLocation,
    setDestinationLocation,
  } = useTravelMatchStore();

  // Mutation for creating match
  const createMatchMutation = useCreateMatch();

  // Estado para coordenadas pendientes (esperando geocodificación)
  const [pendingCoords, setPendingCoords] = useState<{
    type: 'pickup' | 'destination';
    lat: number;
    lon: number;
  } | null>(null);

  // Ref para controlar el mapa desde los chips
  const mapRef = useRef<MapHandle>(null);

  // Handle marker drag from map
  const handleMarkerDrag = (
    type: 'pickup' | 'destination' | 'charter',
    lat: number,
    lon: number
  ) => {
    // Solo actualizar estado pendiente
    // NO centrar automáticamente - dejar que el usuario mantenga su vista
    if (type === 'pickup' || type === 'destination') {
      setPendingCoords({ type, lat, lon });
    }
  };

  // Vigilante reactivo: geocodifica cuando hay coordenadas pendientes
  useEffect(() => {
    if (!pendingCoords) return;

    const { type, lat, lon } = pendingCoords;

    // Debounce: esperar 500ms antes de llamar a la API
    const timeoutId = setTimeout(async () => {
      try {
        console.log('🔄 [PAGE] Calling reverse geocode from React context:', {
          type,
          lat,
          lon,
        });

        const result = await geoApi.reverseGeocode(lat, lon);

        if (result) {
          const address = result.formattedAddress || result.address;

          // Actualizar Zustand store
          if (type === 'pickup') {
            setPickupLocation(address, { lat, lon });
            toast.success('📍 Origen ajustado en el mapa');
          } else if (type === 'destination') {
            setDestinationLocation(address, { lat, lon });
            toast.success('Destino ajustado en el mapa');
          }

          console.log('✅ [PAGE] Reverse geocode successful:', address);
        } else {
          console.warn('⚠️ [PAGE] No address found for coordinates');
          toast.error('No se encontró dirección para esta ubicación');
        }
      } catch (error) {
        console.error('❌ [PAGE] Error in reverse geocode:', error);
        toast.error('Error al obtener dirección');
      } finally {
        // Limpiar estado pendiente
        setPendingCoords(null);
      }
    }, 500); // Debounce de 500ms

    // Cleanup
    return () => clearTimeout(timeoutId);
  }, [pendingCoords, setPickupLocation, setDestinationLocation]);

  // Mostrar loading mientras se hidrata
  if (!hydrated) {
    return (
      <Container
        maxWidth='md'
        sx={{ py: 4, textAlign: 'center' }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  const isFormComplete =
    !!pickupAddress &&
    !!destinationAddress &&
    !!pickupCoords &&
    !!destinationCoords;

  // Handle centering map on pickup location
  const handleCenterOnPickup = () => {
    if (pickupCoords) {
      mapRef.current?.centerOnMarker(pickupCoords.lat, pickupCoords.lon);
      toast.success('Centrando en Origen');
    }
  };

  // Handle centering map on destination location
  const handleCenterOnDestination = () => {
    if (destinationCoords) {
      mapRef.current?.centerOnMarker(
        destinationCoords.lat,
        destinationCoords.lon
      );
      toast.success('Centrando en Destino');
    }
  };

  const handleCreateMatch = () => {
    if (!isFormComplete) return;

    createMatchMutation.mutate(
      {
        pickupAddress,
        pickupLatitude: pickupCoords.lat.toString(),
        pickupLongitude: pickupCoords.lon.toString(),
        destinationAddress,
        destinationLatitude: destinationCoords.lat.toString(),
        destinationLongitude: destinationCoords.lon.toString(),
      },
      {
        onSuccess: () => {
          router.push('/client/trips/matching');
        },
      }
    );
  };

  // If user already has active trip, show message and redirect link
  if (activeTrip) {
    return (
      <Container
        maxWidth='md'
        sx={{ py: 4 }}
      >
        <Box mb={4}>
          <Link href='/client/dashboard'>
            <Button
              startIcon={<ArrowBack />}
              variant='outlined'
              sx={{ mb: 2 }}
            >
              Volver al Dashboard
            </Button>
          </Link>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <LocalShipping
              sx={{ fontSize: 48, color: 'warning.main', mb: 2 }}
            />
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Ya tienes un viaje activo
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mb: 3 }}
            >
              Completa o cancela tu viaje actual antes de solicitar otro flete.
            </Typography>
            <Link href='/client/dashboard'>
              <Button
                variant='contained'
                color='primary'
                size='large'
              >
                Volver a Mi Viaje
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container
      maxWidth='md'
      sx={{ pt: { xs: 2, md: 4 }, pb: { xs: 12, md: 4 } }}
    >
      {/* Header Minimalista */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href='/client/dashboard'>
          <IconButton
            sx={{
              mb: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 3,
              },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Link>
      </motion.div>

      {/* Formulario */}
      <MotionCard
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.4,
          type: 'spring',
          stiffness: 100,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Banner de instrucciones */}
          <InstructionBanner />

          {/* Route Timeline con inputs */}
          <Box sx={{ mb: 3 }}>
            <RouteTimeline
              originInput={
                <AddressInput
                  label=''
                  placeholder='Ej: Av. Hipólito Yrigoyen 8985, Buenos Aires'
                  value={pickupAddress || ''}
                  onAddressSelect={(address, lat, lon) => {
                    setPickupLocation(address, { lat, lon });
                    mapRef.current?.centerOnMarker(lat, lon, 15);
                    toast.success('Origen seleccionado');
                  }}
                />
              }
              destinationInput={
                <AddressInput
                  label=''
                  placeholder='Ej: Calle 13 567, La Plata, Buenos Aires'
                  value={destinationAddress || ''}
                  onAddressSelect={(address, lat, lon) => {
                    setDestinationLocation(address, { lat, lon });
                    mapRef.current?.centerOnMarker(lat, lon, 15);
                    toast.success('Destino seleccionado');
                  }}
                />
              }
            />
          </Box>

          {/* Chips informativos con iconos de ubicación */}
          <AnimatePresence mode='wait'>
            {(pickupAddress || destinationAddress) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {pickupAddress && (
                    <LocationChip
                      type='pickup'
                      address={pickupAddress}
                      onClick={handleCenterOnPickup}
                    />
                  )}
                  {destinationAddress && (
                    <LocationChip
                      type='destination'
                      address={destinationAddress}
                      onClick={handleCenterOnDestination}
                    />
                  )}
                  {pickupAddress && destinationAddress && (
                    <Chip
                      icon={<MapIcon />}
                      label='Ver Ruta Completa'
                      onClick={() => {
                        mapRef.current?.fitAllMarkers();
                        toast.success('Mostrando ruta completa');
                      }}
                      color='secondary'
                      variant='outlined'
                      clickable
                      sx={{ cursor: 'pointer', fontWeight: 600 }}
                    />
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mapa */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 600, mb: 1 }}
            >
              📍 Vista del trayecto
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mb: 1, display: 'block' }}
            >
              💡 Arrastra los pines en el mapa para ajustar la ubicación exacta
            </Typography>
            <Map
              ref={mapRef}
              markers={[
                ...(pickupCoords
                  ? [
                      {
                        lat: pickupCoords.lat,
                        lon: pickupCoords.lon,
                        label: 'Recogida',
                        type: 'pickup' as const,
                      },
                    ]
                  : []),
                ...(destinationCoords
                  ? [
                      {
                        lat: destinationCoords.lat,
                        lon: destinationCoords.lon,
                        label: 'Destino',
                        type: 'destination' as const,
                      },
                    ]
                  : []),
              ]}
              height='300px'
              allowDragging={true}
              onMarkerDrag={handleMarkerDrag}
            />
          </Box>

          {/* Botón de búsqueda */}
          <Box textAlign='center'>
            <MotionButton
              variant='contained'
              color='secondary'
              size='large'
              onClick={handleCreateMatch}
              disabled={createMatchMutation.isPending || !isFormComplete}
              whileHover={
                !createMatchMutation.isPending && isFormComplete
                  ? {
                      scale: 1.05,
                      y: -2,
                      boxShadow: '0 12px 28px rgba(220, 166, 33, 0.4)',
                      transition: { duration: 0.2 },
                    }
                  : {}
              }
              whileTap={
                !createMatchMutation.isPending && isFormComplete
                  ? { scale: 0.98 }
                  : {}
              }
              animate={
                isFormComplete && !createMatchMutation.isPending
                  ? {
                      boxShadow: [
                        '0 4px 12px rgba(220, 166, 33, 0.3)',
                        '0 6px 20px rgba(220, 166, 33, 0.5)',
                        '0 4px 12px rgba(220, 166, 33, 0.3)',
                      ],
                    }
                  : {}
              }
              transition={
                isFormComplete && !createMatchMutation.isPending
                  ? {
                      boxShadow: {
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                      },
                    }
                  : {}
              }
              sx={{
                fontSize: { xs: '1.2rem', md: '1.125rem' },
                fontWeight: 700,
                px: { xs: 4, md: 6 },
                py: { xs: 2, md: 1.75 },
                minWidth: { xs: '100%', md: 280 },
                borderRadius: 3,
              }}
            >
              {createMatchMutation.isPending
                ? 'Buscando chóferes...'
                : 'Buscar Chóferes'}
            </MotionButton>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mt: 2 }}
              >
                {!isFormComplete
                  ? 'Selecciona origen y destino para continuar'
                  : 'Se buscarán chóferes disponibles en tu área'}
              </Typography>
            </motion.div>
          </Box>
        </CardContent>
      </MotionCard>
    </Container>
  );
}
