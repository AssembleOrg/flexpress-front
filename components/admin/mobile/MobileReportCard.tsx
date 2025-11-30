import { useRouter } from "next/navigation";
import { Card, CardContent, Box, Typography, Chip, Button, Stack } from "@mui/material";
import type { Report } from "@/lib/types/api";

interface MobileReportCardProps {
  report: Report;
}

const getStatusColor = (status: string): "error" | "warning" | "success" | "default" => {
  switch (status) {
    case "pending":
      return "error";
    case "investigating":
      return "warning";
    case "resolved":
      return "success";
    case "dismissed":
      return "default";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "investigating":
      return "Investigando";
    case "resolved":
      return "Resuelto";
    case "dismissed":
      return "Desestimado";
    default:
      return status;
  }
};

const getBorderColor = (status: string) => {
  switch (status) {
    case "pending":
      return "#e74c3c";
    case "investigating":
      return "#dca621";
    case "resolved":
      return "#2e7d32";
    case "dismissed":
      return "#757575";
    default:
      return "#757575";
  }
};

export function MobileReportCard({ report }: MobileReportCardProps) {
  const router = useRouter();
  const truncatedId = report.id.substring(0, 8);
  const truncatedReason =
    report.reason.length > 40 ? report.reason.substring(0, 40) + "..." : report.reason;

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: "4px solid",
        borderLeftColor: getBorderColor(report.status),
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1}>
          {/* Status and ID */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip
              label={getStatusLabel(report.status)}
              color={getStatusColor(report.status)}
              size="small"
              sx={{ fontSize: "0.7rem", height: 22 }}
            />
            <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
              ID: {truncatedId}...
            </Typography>
          </Stack>

          {/* Reason truncated */}
          <Typography variant="body2" fontSize="0.85rem" color="text.secondary">
            Razón: {truncatedReason}
          </Typography>

          {/* Ver Detalles button */}
          <Button
            variant="contained"
            size="small"
            onClick={() => router.push(`/admin/reports/${report.id}`)}
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              minHeight: 40,
              bgcolor: "#380116",
              "&:hover": { bgcolor: "#4b011d" },
            }}
          >
            Ver Detalles
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
