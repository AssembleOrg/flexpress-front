"use client";

import {
  AdminPanelSettingsOutlined as AdminIcon,
  SouthWest as ReceivedIcon,
  NorthEast as RemovedIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type React from "react";
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

const STATUS_BORDER: Record<string, string> = {
  pending: "error.main",
  investigating: "warning.main",
  resolved: "success.main",
  dismissed: "grey.400",
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

function getInitial(name?: string | null): string {
  return name?.charAt(0).toUpperCase() ?? "?";
}

export function ReportCard({ report, perspective }: ReportCardProps) {
  const counterpart =
    perspective === "mine" ? report.reported : report.reporter;
  const isResolved = report.status === "resolved";
  const borderColor = STATUS_BORDER[report.status] ?? "grey.400";

  // Puede haber múltiples líneas de crédito según la perspectiva
  const creditLines: { icon: React.ReactNode; text: string; color: string }[] =
    [];

  if (perspective === "mine") {
    if (report.creditsToReporter && report.creditsToReporter > 0) {
      creditLines.push({
        icon: <ReceivedIcon fontSize="small" color="success" />,
        text: `Recibiste ${report.creditsToReporter} crédito${report.creditsToReporter === 1 ? "" : "s"}`,
        color: "success.main",
      });
    }
    if (report.creditsFromReporter && report.creditsFromReporter > 0) {
      creditLines.push({
        icon: <RemovedIcon fontSize="small" color="error" />,
        text: `Se te descontaron ${report.creditsFromReporter} crédito${report.creditsFromReporter === 1 ? "" : "s"} (reporte falso)`,
        color: "error.main",
      });
    }
  } else {
    if (report.creditsFromReported && report.creditsFromReported > 0) {
      creditLines.push({
        icon: <RemovedIcon fontSize="small" color="error" />,
        text: `Se te descontaron ${report.creditsFromReported} crédito${report.creditsFromReported === 1 ? "" : "s"}`,
        color: "error.main",
      });
    }
    if (report.creditsToReported && report.creditsToReported > 0) {
      creditLines.push({
        icon: <ReceivedIcon fontSize="small" color="success" />,
        text: `Recibiste ${report.creditsToReported} crédito${report.creditsToReported === 1 ? "" : "s"} (compensación)`,
        color: "success.main",
      });
    }
  }

  return (
    <Card
      sx={{
        borderLeft: "4px solid",
        borderLeftColor: borderColor,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
        {/* Header: avatar + nombre + estado */}
        <Stack direction="row" alignItems="flex-start" gap={1.5} mb={1.5}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "secondary.main",
              color: "primary.main",
              fontWeight: 700,
              fontSize: "0.9rem",
              flexShrink: 0,
            }}
          >
            {getInitial(counterpart?.name)}
          </Avatar>

          <Box flex={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
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
            sx={{ flexShrink: 0, fontWeight: 600 }}
          />
        </Stack>

        <Divider sx={{ mb: 1.5 }} />

        {/* Razón y descripción */}
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
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

        {/* Créditos (solo si resuelto) */}
        {isResolved && creditLines.length > 0 && (
          <Stack spacing={0.5} sx={{ mt: 1.5 }}>
            {creditLines.map((line, i) => (
              <Stack key={i} direction="row" spacing={0.5} alignItems="center">
                {line.icon}
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: line.color }}
                >
                  {line.text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

        {/* Notas del admin */}
        {report.adminNotes && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: 1,
              bgcolor: "background.default",
            }}
          >
            <Stack direction="row" alignItems="center" gap={0.5} mb={0.5}>
              <AdminIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                Notas del administrador
              </Typography>
            </Stack>
            <Typography variant="body2">{report.adminNotes}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
