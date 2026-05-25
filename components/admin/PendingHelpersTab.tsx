"use client";

import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircle, Cancel, Group } from "@mui/icons-material";
import { usePendingHelpersAdmin } from "@/lib/hooks/queries/useCharterPersonnelQueries";
import {
  useAdminReviewHelper,
  useAdminReviewHelperDocument,
} from "@/lib/hooks/mutations/useCharterPersonnelMutations";
import {
  DocumentReviewStatus,
  DocumentSide,
  VerificationStatus,
  type CharterHelper,
} from "@/lib/types/api";

function HelperCard({ helper }: { helper: CharterHelper }) {
  const reviewEntity = useAdminReviewHelper();
  const reviewDoc = useAdminReviewHelperDocument();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [docRejectId, setDocRejectId] = useState<string | null>(null);
  const [docRejectReason, setDocRejectReason] = useState("");

  return (
    <>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} mb={2}>
            <Avatar src={helper.photoUrl ?? undefined} sx={{ width: 56, height: 56 }}>
              {helper.firstName[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {helper.firstName} {helper.lastName}
              </Typography>
              {helper.charter && (
                <Typography variant="body2" color="text.secondary">
                  Charter: {helper.charter.name} ({helper.charter.email})
                </Typography>
              )}
            </Box>
          </Stack>

          <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1}>
            Documentos
          </Typography>
          <Stack spacing={1} mb={2}>
            {(helper.documents ?? []).map((doc) => (
              <Box
                key={doc.id}
                sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
              >
                <Chip
                  label={`DNI ${doc.side === DocumentSide.BACK ? "dorso" : "frente"}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={doc.status}
                  size="small"
                  color={
                    doc.status === DocumentReviewStatus.APPROVED
                      ? "success"
                      : doc.status === DocumentReviewStatus.REJECTED
                        ? "error"
                        : "warning"
                  }
                />
                <Button size="small" href={doc.fileUrl} target="_blank" variant="text">
                  Ver
                </Button>
                {doc.status === DocumentReviewStatus.PENDING && (
                  <>
                    <Button
                      size="small"
                      color="success"
                      onClick={() =>
                        reviewDoc.mutate({
                          docId: doc.id,
                          payload: { status: DocumentReviewStatus.APPROVED as any },
                        })
                      }
                    >
                      Aprobar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setDocRejectId(doc.id);
                        setDocRejectReason("");
                      }}
                    >
                      Rechazar
                    </Button>
                  </>
                )}
                {doc.status === DocumentReviewStatus.REJECTED && doc.rejectionReason && (
                  <Typography variant="caption" color="error.dark">
                    {doc.rejectionReason}
                  </Typography>
                )}
              </Box>
            ))}
            {(helper.documents?.length ?? 0) === 0 && (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                Sin documentos subidos aún.
              </Alert>
            )}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() =>
                reviewEntity.mutate({
                  id: helper.id,
                  payload: { status: VerificationStatus.VERIFIED as any },
                })
              }
              disabled={reviewEntity.isPending}
            >
              Aprobar ayudante
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => {
                setRejectOpen(true);
                setRejectReason("");
              }}
            >
              Rechazar
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Rechazar ayudante</DialogTitle>
        <DialogContent>
          <TextField
            label="Motivo del rechazo"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!rejectReason.trim() || reviewEntity.isPending}
            onClick={async () => {
              await reviewEntity.mutateAsync({
                id: helper.id,
                payload: {
                  status: VerificationStatus.REJECTED as any,
                  rejectionReason: rejectReason.trim(),
                },
              });
              setRejectOpen(false);
            }}
          >
            Confirmar rechazo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!docRejectId} onClose={() => setDocRejectId(null)} fullWidth maxWidth="sm">
        <DialogTitle>Rechazar documento</DialogTitle>
        <DialogContent>
          <TextField
            label="Motivo del rechazo"
            value={docRejectReason}
            onChange={(e) => setDocRejectReason(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocRejectId(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!docRejectReason.trim() || reviewDoc.isPending}
            onClick={async () => {
              if (!docRejectId) return;
              await reviewDoc.mutateAsync({
                docId: docRejectId,
                payload: {
                  status: DocumentReviewStatus.REJECTED as any,
                  rejectionReason: docRejectReason.trim(),
                },
              });
              setDocRejectId(null);
            }}
          >
            Confirmar rechazo
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function PendingHelpersTab() {
  const { data: helpers = [], isLoading } = usePendingHelpersAdmin();

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (helpers.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Group sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No hay ayudantes pendientes de revisión.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {helpers.map((h) => (
        <HelperCard key={h.id} helper={h} />
      ))}
    </Box>
  );
}
