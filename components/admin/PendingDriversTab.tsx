"use client";

import {
  Cancel,
  CancelRounded,
  CheckCircle,
  CheckCircleRounded,
  HourglassTopRounded,
  OpenInNewRounded,
  Person,
} from "@mui/icons-material";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { RejectReasonModal } from "@/components/modals/RejectReasonModal";
import { PrivateDocLink } from "@/components/ui/PrivateImage";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import {
  useAdminReviewDriver,
  useAdminReviewDriverDocument,
} from "@/lib/hooks/mutations/useCharterPersonnelMutations";
import { usePendingDriversAdmin } from "@/lib/hooks/queries/useCharterPersonnelQueries";
import {
  type CharterDriver,
  CharterDriverDocumentType,
  DocumentReviewStatus,
  DocumentSide,
  VerificationStatus,
} from "@/lib/types/api";

function docLabel(type: CharterDriverDocumentType, side?: DocumentSide | null) {
  if (type === CharterDriverDocumentType.DNI) {
    return `DNI ${side === DocumentSide.BACK ? "dorso" : "frente"}`;
  }
  return "Licencia";
}

// ─── Atoms presentacionales (estética iOS) ───────────────────────────────────

type SemColor = "success" | "warning" | "error" | "default";

function verifColor(status: VerificationStatus): SemColor {
  if (status === VerificationStatus.VERIFIED) return "success";
  if (status === VerificationStatus.REJECTED) return "error";
  return "warning";
}

function verifLabel(status: VerificationStatus): string {
  if (status === VerificationStatus.VERIFIED) return "Verificado";
  if (status === VerificationStatus.REJECTED) return "Rechazado";
  return "Pendiente";
}

function docColor(status: DocumentReviewStatus): SemColor {
  if (status === DocumentReviewStatus.APPROVED) return "success";
  if (status === DocumentReviewStatus.REJECTED) return "error";
  return "warning";
}

function docStatusText(status: DocumentReviewStatus): string {
  if (status === DocumentReviewStatus.APPROVED) return "Aprobado";
  if (status === DocumentReviewStatus.REJECTED) return "Rechazado";
  return "Pendiente";
}

function StatusPill({ color, label }: { color: SemColor; label: string }) {
  const theme = useTheme();
  const main =
    color === "default"
      ? theme.palette.text.disabled
      : theme.palette[color].main;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.1,
        py: 0.35,
        borderRadius: 999,
        bgcolor: alpha(main, 0.12),
        color: color === "default" ? "text.secondary" : `${color}.dark`,
        fontSize: "0.72rem",
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: main,
          flexShrink: 0,
        }}
      />
      {label}
    </Box>
  );
}

function PersonnelAvatar({
  src,
  initial,
}: {
  src?: string | null;
  initial: string;
}) {
  const theme = useTheme();
  return (
    <SignedAvatar
      value={src}
      sx={{
        width: 52,
        height: 52,
        fontWeight: 700,
        color: "#fff",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        border: `2px solid ${alpha(theme.palette.common.white, 0.7)}`,
        boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.25)}`,
      }}
    >
      {initial}
    </SignedAvatar>
  );
}

function DocStatusInline({ status }: { status: DocumentReviewStatus }) {
  const color = docColor(status);
  const Icon =
    status === DocumentReviewStatus.APPROVED
      ? CheckCircleRounded
      : status === DocumentReviewStatus.REJECTED
        ? CancelRounded
        : HourglassTopRounded;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        color: `${color}.main`,
      }}
    >
      <Icon sx={{ fontSize: 16 }} />
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: `${color}.dark` }}
      >
        {docStatusText(status)}
      </Typography>
    </Box>
  );
}

function DriverCard({ driver }: { driver: CharterDriver }) {
  const reviewEntity = useAdminReviewDriver();
  const reviewDoc = useAdminReviewDriverDocument();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [docRejectId, setDocRejectId] = useState<string | null>(null);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 3,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.2s ease",
          "&:hover": {
            boxShadow:
              "0 2px 4px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.09)",
          },
        }}
      >
        <CardContent sx={{ p: 2.25 }}>
          <Box sx={{ display: "flex", gap: 1.75, alignItems: "flex-start" }}>
            <PersonnelAvatar
              src={driver.photoUrl}
              initial={driver.firstName[0]}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {driver.firstName} {driver.lastName}
              </Typography>
              <Box sx={{ mt: 0.75 }}>
                <StatusPill
                  color={verifColor(driver.verificationStatus)}
                  label={verifLabel(driver.verificationStatus)}
                />
              </Box>
              {driver.charter && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.75 }}
                >
                  {driver.charter.name} · {driver.charter.email}
                </Typography>
              )}
              {driver.phone && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Tel: {driver.phone}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 1.75 }} />

          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
          >
            Documentos
          </Typography>

          {(driver.documents?.length ?? 0) === 0 ? (
            <Alert severity="warning" sx={{ py: 0.5, mt: 1, borderRadius: 2 }}>
              Sin documentos subidos aún.
            </Alert>
          ) : (
            <Box
              sx={{
                mt: 1,
                borderRadius: 2.5,
                bgcolor: (t) => alpha(t.palette.text.primary, 0.025),
                border: (t) =>
                  `1px solid ${alpha(t.palette.text.primary, 0.06)}`,
                overflow: "hidden",
              }}
            >
              {(driver.documents ?? []).map((doc, i) => (
                <Box key={doc.id}>
                  {i > 0 && <Divider sx={{ opacity: 0.5 }} />}
                  <Box sx={{ p: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {docLabel(doc.type, doc.side)}
                      </Typography>
                      <DocStatusInline status={doc.status} />
                    </Box>

                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ mt: 1, flexWrap: "wrap" }}
                      useFlexGap
                    >
                      <PrivateDocLink
                        value={doc.fileUrl}
                        size="small"
                        variant="text"
                        startIcon={<OpenInNewRounded sx={{ fontSize: 15 }} />}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                      >
                        Ver
                      </PrivateDocLink>
                      {doc.status === DocumentReviewStatus.PENDING && (
                        <>
                          <Button
                            size="small"
                            color="success"
                            variant="outlined"
                            onClick={() =>
                              reviewDoc.mutate({
                                docId: doc.id,
                                payload: {
                                  status: DocumentReviewStatus.APPROVED as any,
                                },
                              })
                            }
                            sx={{ textTransform: "none", borderRadius: 2 }}
                          >
                            Aprobar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => setDocRejectId(doc.id)}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                          >
                            Rechazar
                          </Button>
                        </>
                      )}
                    </Stack>

                    {doc.status === DocumentReviewStatus.REJECTED &&
                      doc.rejectionReason && (
                        <Typography
                          variant="caption"
                          color="error.dark"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {doc.rejectionReason}
                        </Typography>
                      )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
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
              sx={{
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
                flex: { xs: 1, sm: "0 0 auto" },
              }}
            >
              Aprobar conductor
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => setRejectOpen(true)}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
                flex: { xs: 1, sm: "0 0 auto" },
              }}
            >
              Rechazar
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <RejectReasonModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Rechazar conductor"
        isLoading={reviewEntity.isPending}
        onConfirm={async (reason) => {
          await reviewEntity.mutateAsync({
            id: driver.id,
            payload: {
              status: VerificationStatus.REJECTED as any,
              rejectionReason: reason,
            },
          });
          setRejectOpen(false);
        }}
      />

      <RejectReasonModal
        open={!!docRejectId}
        onClose={() => setDocRejectId(null)}
        title="Rechazar documento"
        isLoading={reviewDoc.isPending}
        onConfirm={async (reason) => {
          if (!docRejectId) return;
          await reviewDoc.mutateAsync({
            docId: docRejectId,
            payload: {
              status: DocumentReviewStatus.REJECTED as any,
              rejectionReason: reason,
            },
          });
          setDocRejectId(null);
        }}
      />
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
