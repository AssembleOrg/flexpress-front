"use client";

import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useRespondInquiry } from "@/lib/hooks/mutations/useAvailabilityInquiriesMutations";
import {
  INQUIRY_RESPONSE_CODES,
  INQUIRY_RESPONSE_LABELS,
} from "@/lib/constants/availabilityInquiry";
import type {
  AvailabilityInquiry,
  InquiryResponseCode,
} from "@/lib/types/api";

interface RespondInquiryModalProps {
  open: boolean;
  onClose: () => void;
  inquiry: AvailabilityInquiry | null;
}

export function RespondInquiryModal({
  open,
  onClose,
  inquiry,
}: RespondInquiryModalProps) {
  const respondMutation = useRespondInquiry();

  if (!inquiry) return null;

  const clientName = inquiry.fromUser?.name ?? "Cliente";

  const handleRespond = (responseCode: InquiryResponseCode) => {
    respondMutation.mutate(
      { id: inquiry.id, responseCode },
      { onSettled: () => onClose() },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar src={inquiry.fromUser?.avatar ?? undefined}>
            {clientName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Consulta de {clientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Elegí una respuesta rápida
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {INQUIRY_RESPONSE_CODES.map((code) => (
            <Button
              key={code}
              variant="outlined"
              color={code === "not_available" ? "error" : "primary"}
              size="large"
              onClick={() => handleRespond(code)}
              disabled={respondMutation.isPending}
              sx={{ justifyContent: "flex-start", textAlign: "left", py: 1.25 }}
            >
              {INQUIRY_RESPONSE_LABELS[code]}
            </Button>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={respondMutation.isPending}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
