'use client';

import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { Route, AttachMoney } from '@mui/icons-material';
import { RatingDisplay } from '@/components/ui/RatingDisplay';
import { useCharterRating } from '@/lib/hooks/queries/useFeedbackQueries';
import type { AvailableCharter, TravelMatch } from '@/lib/types/api';

/**
 * ConfirmMatchModal
 *
 * Displayed to the user after selecting a charter.
 * Shows confirmation details before proceeding to chat.
 *
 * Props:
 * - open: Dialog open state
 * - onClose: Called when user clicks Cancel
 * - onConfirm: Called when user clicks Confirm (navigation handled by parent)
 * - match: TravelMatch object with trip details
 * - selectedCharter: AvailableCharter object with charter details
 * - isLoading: Show loading state during confirmation
 * - userCredits: User's available credits for validation
 */

interface ConfirmMatchModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  match: TravelMatch | null;
  selectedCharter: AvailableCharter | null;
  isLoading?: boolean;
  userCredits?: number;
}

export function ConfirmMatchModal({
  open,
  onClose,
  onConfirm,
  match,
  selectedCharter,
  isLoading = false,
  userCredits = 0,
}: ConfirmMatchModalProps) {
  // Defensiva: si no hay datos necesarios, no renderizar
  if (!match || !selectedCharter) {
    return null;
  }

  // Fetch charter rating
  const { data: charterRating } = useCharterRating(selectedCharter.charterId);

  // Validación de créditos
  const estimatedCredits = selectedCharter.estimatedCredits || 0;
  const hasEnoughCredits = userCredits >= estimatedCredits;
  const creditsDifference = estimatedCredits - userCredits;
  const creditsAfter = userCredits - estimatedCredits;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: '1.1rem' }}>
        Confirmar Selección
      </DialogTitle>

      <DialogContent sx={{ py: 1.5 }}>
        {/* Charter Info Section */}
        <Stack spacing={1.5}>
          {/* Charter Card - Compact */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1.5,
            }}
          >
            {/* Avatar */}
            <Avatar
              src={selectedCharter.charterAvatar || undefined}
              sx={{ width: 48, height: 48 }}
            >
              {selectedCharter.charterName?.charAt(0).toUpperCase()}
            </Avatar>

            {/* Charter Details */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 600, fontSize: '0.95rem' }}
              >
                {selectedCharter.charterName || 'Chófer'}
              </Typography>
              {/* Rating */}
              <Box mt={0.5}>
                <RatingDisplay
                  averageRating={charterRating?.averageRating || 0}
                  totalReviews={charterRating?.totalFeedbacks || 0}
                  size='small'
                  showCount={false}
                />
              </Box>
            </Box>
          </Box>

          {/* Trip Summary - Compact */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'background.default',
              borderRadius: 1.5,
            }}
          >
            <Typography
              variant='caption'
              color='text.secondary'
              display='block'
              sx={{ mb: 1, fontSize: '0.7rem', fontWeight: 600 }}
            >
              📍 Origen → Destino
            </Typography>
            <Typography
              variant='body2'
              sx={{ fontSize: '0.85rem', lineHeight: 1.4, mb: 0.5 }}
            >
              {match.pickupAddress || 'No especificado'}
            </Typography>
            <Typography
              variant='body2'
              sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.4 }}
            >
              {match.destinationAddress || 'No especificado'}
            </Typography>
          </Box>

          {/* Key Metrics - Compact Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'background.default',
                borderRadius: 1.5,
                textAlign: 'center',
              }}
            >
              <Route sx={{ fontSize: 20, color: 'primary.main', mb: 0.5 }} />
              <Typography
                variant='h6'
                sx={{ fontWeight: 700, fontSize: '1rem' }}
              >
                {selectedCharter.totalDistance?.toFixed(1) || '0'} km
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.65rem' }}
              >
                Distancia
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.5,
                bgcolor: 'background.default',
                borderRadius: 1.5,
                textAlign: 'center',
              }}
            >
              <AttachMoney
                sx={{ fontSize: 20, color: 'success.main', mb: 0.5 }}
              />
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'success.main',
                }}
              >
                {selectedCharter.estimatedCredits || 0}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.65rem' }}
              >
                Créditos
              </Typography>
            </Box>
          </Box>

          {/* Credit Status Alert - Simplified */}
          {!hasEnoughCredits ? (
            <Alert
              severity='error'
              sx={{ py: 1 }}
            >
              <Typography
                variant='body2'
                sx={{ fontWeight: 600, fontSize: '0.85rem' }}
              >
                Créditos Insuficientes
              </Typography>
              <Typography
                variant='caption'
                sx={{ fontSize: '0.75rem' }}
              >
                Te faltan {creditsDifference} créditos. Disponibles:{' '}
                {userCredits}
              </Typography>
            </Alert>
          ) : (
            <Alert
              severity='success'
              sx={{ py: 1 }}
            >
              <Typography
                variant='caption'
                sx={{ fontSize: '0.75rem' }}
              >
                Te quedarán {creditsAfter} créditos después
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          gap: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant='outlined'
          size='large'
          sx={{ flex: 1, minHeight: 48 }}
        >
          Cancelar
        </Button>

        <Button
          onClick={onConfirm}
          disabled={isLoading || !hasEnoughCredits}
          variant='contained'
          size='large'
          sx={{
            flex: 1,
            minHeight: 48,
            fontWeight: 700,
            bgcolor: 'secondary.main',
            '&:hover': { bgcolor: 'secondary.dark' },
          }}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {isLoading ? 'Confirmando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
