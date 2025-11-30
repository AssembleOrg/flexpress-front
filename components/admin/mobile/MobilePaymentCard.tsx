import Link from "next/link";
import { Card, CardContent, Box, Typography, Chip, Button, Stack } from "@mui/material";
import type { Payment } from "@/lib/types/api";

interface MobilePaymentCardProps {
  payment: Payment;
  onApprove: (payment: Payment) => void;
  onReject: (payment: Payment) => void;
  onViewReceipt: (url: string) => void;
}

const getStatusColor = (status: string): "warning" | "success" | "error" | "default" => {
  switch (status) {
    case "pending":
      return "warning";
    case "completed":
      return "success";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "completed":
      return "Completado";
    case "rejected":
      return "Rechazado";
    default:
      return status;
  }
};

const getBorderColor = (status: string) => {
  switch (status) {
    case "pending":
      return "#dca621";
    case "completed":
      return "#2e7d32";
    case "rejected":
      return "#e74c3c";
    default:
      return "#757575";
  }
};

export function MobilePaymentCard({ payment, onApprove, onReject, onViewReceipt }: MobilePaymentCardProps) {
  const truncatedId = payment.id.substring(0, 8);

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: "4px solid",
        borderLeftColor: getBorderColor(payment.status),
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1}>
          {/* Status and ID */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip
              label={getStatusLabel(payment.status)}
              color={getStatusColor(payment.status)}
              size="small"
              sx={{ fontSize: "0.7rem", height: 22 }}
            />
            <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
              ID: {truncatedId}...
            </Typography>
          </Stack>

          {/* User name as link */}
          <Link href={`/admin/users/${payment.userId}`} style={{ textDecoration: "none" }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              fontSize="0.9rem"
              sx={{
                color: "#380116",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {payment.user?.name || "Usuario"}
            </Typography>
          </Link>

          {/* Credits */}
          <Chip
            label={`${payment.credits} créditos`}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem", height: 22, width: "fit-content" }}
          />

          {/* Receipt button if exists */}
          {payment.receiptUrl && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onViewReceipt(payment.receiptUrl!)}
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                minHeight: 36,
              }}
            >
              Ver Comprobante
            </Button>
          )}

          {/* Approve/Reject buttons only for pending */}
          {payment.status === "pending" && (
            <Box display="flex" gap={1} mt={1}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                sx={{
                  flex: 1,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  minHeight: 40,
                }}
                onClick={() => onReject(payment)}
              >
                Rechazar
              </Button>
              <Button
                variant="contained"
                color="success"
                size="small"
                sx={{
                  flex: 1,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  minHeight: 40,
                }}
                onClick={() => onApprove(payment)}
              >
                Aprobar
              </Button>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
