"use client";

import {
  CheckCircle as ApproveIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Cancel as RejectIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { PrivateDocThumb } from "@/components/ui/PrivateImage";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import { useVerifyUser } from "@/lib/hooks/mutations/useAdminMutations";
import { usePendingUsers } from "@/lib/hooks/queries/useAdminQueries";
import type { PendingCharterReviewItem } from "@/lib/types/api";

const SIDE_LABEL: Record<string, string> = { front: "Frente", back: "Dorso" };

function UserCard({ user }: { user: PendingCharterReviewItem }) {
  const verifyMutation = useVerifyUser();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleApprove = () => {
    verifyMutation.mutate({ userId: user.id, status: "verified" });
  };

  const handleReject = () => {
    if (!reason.trim()) return;
    verifyMutation.mutate(
      { userId: user.id, status: "rejected", rejectionReason: reason.trim() },
      { onSuccess: () => setRejectOpen(false) },
    );
  };

  const docs = user.userDocuments ?? [];

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <SignedAvatar value={user.avatar} alt={user.name} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {user.name}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            color="text.secondary"
          >
            <EmailIcon sx={{ fontSize: 14 }} />
            <Typography variant="body2" noWrap>
              {user.email}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            color="text.secondary"
          >
            <PhoneIcon sx={{ fontSize: 14 }} />
            <Typography variant="body2">{user.number}</Typography>
          </Stack>
          {user.address && (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              color="text.secondary"
            >
              <LocationIcon sx={{ fontSize: 14 }} />
              <Typography variant="body2" noWrap>
                {user.address}
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" color="text.secondary" mb={1}>
        Documentos de identidad (DNI)
      </Typography>
      {docs.length === 0 ? (
        <Alert severity="warning" sx={{ py: 0.5, mb: 2 }}>
          Sin documentos de identidad
        </Alert>
      ) : (
        <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap" useFlexGap>
          {docs.map((doc) => (
            <Tooltip
              key={doc.id}
              title={`DNI ${SIDE_LABEL[doc.side ?? ""] ?? doc.side ?? ""}`}
            >
              <Box>
                <PrivateDocThumb
                  value={doc.fileUrl}
                  alt={`DNI ${doc.side ?? ""}`}
                  imgStyle={{ width: 120, height: 84 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  textAlign="center"
                >
                  {SIDE_LABEL[doc.side ?? ""] ?? doc.side}
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Stack>
      )}

      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="success"
          startIcon={<ApproveIcon />}
          onClick={handleApprove}
          disabled={verifyMutation.isPending}
          fullWidth
        >
          Aprobar
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<RejectIcon />}
          onClick={() => setRejectOpen(true)}
          disabled={verifyMutation.isPending}
          fullWidth
        >
          Rechazar
        </Button>
      </Stack>

      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Rechazar verificación</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            margin="normal"
            label="Motivo del rechazo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explicá por qué se rechaza (el cliente lo verá)."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={!reason.trim() || verifyMutation.isPending}
          >
            Confirmar rechazo
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export function PendingUsersTab() {
  const { data: users = [], isLoading } = usePendingUsers();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Typography sx={{ textAlign: "center", py: 6, opacity: 0.7 }}>
        No hay clientes pendientes de verificación
      </Typography>
    );
  }

  return (
    <Box>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </Box>
  );
}
