"use client";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Rating,
  TextField,
} from "@mui/material";
import { useState } from "react";
import type { CreateFeedbackRequest } from "@/lib/api/feedback";
import { useCreateFeedback } from "@/lib/hooks/mutations/useFeedbackMutations";

export interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  toUserId: string;
  recipientName?: string;
}

/**
 * FeedbackModal Component
 *
 * Modal dialog for users to rate and comment on completed trips.
 * Features:
 * - 1-5 star rating with visual feedback
 * - Optional comment field
 * - Submit button disabled until rating is selected
 * - Loading state during submission
 * - Auto-closes on success
 *
 * Usage:
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <FeedbackModal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   tripId="123"
 *   toUserId="456"
 *   recipientName="Juan Pérez"
 * />
 * ```
 */
export function FeedbackModal({
  open,
  onClose,
  tripId,
  toUserId,
  recipientName = "usuario",
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const createFeedbackMutation = useCreateFeedback();
  const isSubmitting = createFeedbackMutation.isPending;
  const isRatingSelected = rating !== null && rating > 0;

  const handleSubmit = async () => {
    if (!isRatingSelected) return;

    const feedbackData: CreateFeedbackRequest = {
      tripId,
      toUserId,
      rating,
      comment: comment.trim() || undefined,
    };

    createFeedbackMutation.mutate(feedbackData, {
      onSuccess: () => {
        // Reset form and close modal
        setRating(null);
        setComment("");
        onClose();
      },
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(null);
      setComment("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Califica tu experiencia con {recipientName}</DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Rating Section */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormHelperText sx={{ fontSize: "0.85rem", mb: 1 }}>
              ¿Cómo fue tu experiencia?
            </FormHelperText>
            <Rating
              value={rating}
              onChange={(_event, newValue) => setRating(newValue)}
              size="large"
              disabled={isSubmitting}
              sx={{
                fontSize: "2.5rem",
                "& .MuiRating-iconFilled": {
                  color: "primary.main",
                },
              }}
            />
            {!isRatingSelected && (
              <FormHelperText sx={{ color: "text.secondary" }}>
                Selecciona una calificación para continuar
              </FormHelperText>
            )}
          </Box>

          {/* Comment Section */}
          <TextField
            label="Comentario (opcional)"
            placeholder="Cuéntanos cómo fue tu experiencia..."
            multiline
            rows={3}
            value={comment}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setComment(e.target.value);
              }
            }}
            disabled={isSubmitting}
            variant="outlined"
            fullWidth
            maxRows={4}
            helperText={`${comment.length}/500 caracteres`}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isRatingSelected || isSubmitting}
          variant="contained"
          color="primary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} />
              Enviando...
            </>
          ) : (
            "Enviar Calificación"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
