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
import { CheckCircle, Cancel, Person } from "@mui/icons-material";
import { usePendingDriversAdmin } from "@/lib/hooks/queries/useCharterPersonnelQueries";
import {
  useAdminReviewDriver,
  useAdminReviewDriverDocument,
} from "@/lib/hooks/mutations/useCharterPersonnelMutations";
import {
  CharterDriverDocumentType,
  DocumentReviewStatus,
  DocumentSide,
  VerificationStatus,
  type CharterDriver,
} from "@/lib/types/api";

function docLabel(type: CharterDriverDocumentType, side?: DocumentSide | null) {
  if (type === CharterDriverDocumentType.DNI) {
    return `DNI ${side === DocumentSide.BACK ? "dorso" : "frente"}`;
  }
  return "Licencia";
}

function DriverCard({ driver }: { driver: CharterDriver }) {
  const reviewEntity = useAdminReviewDriver();
  const reviewDoc = useAdminReviewDriverDocument();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [docRejectId, setDocRejectId] = useState<string | null>(null);
  const [docRejectReason, setDocRejectReason] = useState("");

  return (
    <>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} mb={2}>
            <Avatar src={driver.photoUrl ?? undefined} sx={{ width: 56, height: 56 }}>
              {driver.firstName[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                {driver.firstName} {driver.lastName}
              </Typography>
              {driver.charter && (
                <Typography variant="body2" color="text.secondary">
                  Charter: {driver.charter.name} ({driver.charter.email})
                </Typography>
              )}
              {driver.phone && (
                <Typography variant="caption" color="text.secondary">
                  Tel: {driver.phone}
                </Typography>
              )}
            </Box>
          </Stack>

          <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1}>
            Documentos
          </Typography>
          <Stack spacing={1} mb={2}>
            {(driver.documents ?? []).map((doc) => (
              <Box
                key={doc.id}
                sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
              >
                <Chip label={docLabel(doc.type, doc.side)} size="small" variant="outlined" />
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
            {(driver.documents?.length ?? 0) === 0 && (
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
                  id: driver.id,
                  payload: { status: VerificationStatus.VERIFIED as any },
                })
              }
              disabled={reviewEntity.isPending}
            >
              Aprobar conductor
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
        <DialogTitle>Rechazar conductor</DialogTitle>
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
                id: driver.id,
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

export function PendingDriversTab() {
  const { data: drivers = [], isLoading } = usePendingDriversAdmin();

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (drivers.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Person sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No hay conductores pendientes de revisión.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {drivers.map((d) => (
        <DriverCard key={d.id} driver={d} />
      ))}
    </Box>
  );
}
