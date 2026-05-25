"use client";

import {
  SouthWest as ReceivedIcon,
  NorthEast as RemovedIcon,
} from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { Report } from "@/lib/types/api";

type ReportPerspective = "mine" | "against";

interface ReportCardProps {
  report: Report;
  perspective: ReportPerspective;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  investigating: "En revisión",
  resolved: "Resuelto",
  dismissed: "Desestimado",
};

const STATUS_COLOR: Record<
  string,
  "default" | "error" | "warning" | "success"
> = {
  pending: "error",
  investigating: "warning",
  resolved: "success",
  dismissed: "default",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Read-only summary card for a report from the user's perspective.
 * - perspective "mine": the current user is the reporter (counterpart = reported)
 * - perspective "against": the current user is the reported (counterpart = reporter)
 */
export function ReportCard({ report, perspective }: ReportCardProps) {
  const counterpart =
    perspective === "mine" ? report.reported : report.reporter;
  const isResolved = report.status === "resolved";

  const creditLine =
    perspective === "mine"
      ? report.creditsToReporter && report.creditsToReporter > 0
        ? {
            icon: <ReceivedIcon fontSize="small" color="success" />,
            text: `Recibiste ${report.creditsToReporter} crédito${
              report.creditsToReporter === 1 ? "" : "s"
            }`,
            color: "success.main",
          }
        : null
      : report.creditsFromReported && report.creditsFromReported > 0
        ? {
            icon: <RemovedIcon fontSize="small" color="error" />,
            text: `Se te descontaron ${report.creditsFromReported} crédito${
              report.creditsFromReported === 1 ? "" : "s"
            }`,
            color: "error.main",
          }
        : null;

  return (
    <Card>
      <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start"
          mb={1}
        >
          <Box flex={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
              {perspective === "mine" ? "Reportaste a" : "Te reportó"}{" "}
              {counterpart?.name ?? "—"}
            </Typography>
            {report.createdAt && (
              <Typography variant="caption" color="text.secondary">
                {formatDate(report.createdAt)}
              </Typography>
            )}
          </Box>
          <Chip
            label={STATUS_LABEL[report.status] ?? report.status}
            color={STATUS_COLOR[report.status] ?? "default"}
            size="small"
          />
        </Stack>

        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
          {report.reason}
        </Typography>
        {report.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {report.description}
          </Typography>
        )}

        {isResolved && creditLine && (
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ mt: 1.5 }}
          >
            {creditLine.icon}
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: creditLine.color }}
            >
              {creditLine.text}
            </Typography>
          </Stack>
        )}

        {report.adminNotes && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: 1,
              bgcolor: "grey.100",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Notas del administrador
            </Typography>
            <Typography variant="body2">{report.adminNotes}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
