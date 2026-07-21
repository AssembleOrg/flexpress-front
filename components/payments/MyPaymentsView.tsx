"use client";

import {
  Add as AddIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { CreditPackagesShowcase } from "@/components/modals/CreditPackagesShowcase";
import { PrivateImage } from "@/components/ui/PrivateImage";
import { useMyPayments } from "@/lib/hooks/queries/usePaymentQueries";
import { useCreditPurchaseStore } from "@/lib/stores/creditPurchaseStore";
import type { Payment } from "@/lib/types/api";
import { PaymentStatus } from "@/lib/types/api";

/**
 * Vista compartida de "Mis Pagos" — role-agnostic (getMyPayments filtra por el
 * usuario autenticado). La reexportan app/client/payments y app/driver/payments,
 * cada una bajo su propio RoleGuard.
 */
export function MyPaymentsView() {
  const { data: payments, isLoading, error } = useMyPayments();
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const { openModal } = useCreditPurchaseStore();

  const getStatusChip = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return <Chip label="Pendiente" color="warning" size="small" />;
      case PaymentStatus.ACCEPTED:
        return <Chip label="Aprobado" color="success" size="small" />;
      case PaymentStatus.REJECTED:
        return <Chip label="Rechazado" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleViewReceipt = (receiptUrl: string) => {
    setSelectedReceipt(receiptUrl);
  };

  const handleCloseReceipt = () => {
    setSelectedReceipt(null);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error al cargar tus pagos. Por favor, intenta nuevamente.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 4 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={2}
        sx={{ mb: 3 }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          Mis Pagos
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={openModal}
          sx={{
            fontWeight: 700,
            whiteSpace: "nowrap",
            alignSelf: { xs: "stretch", sm: "auto" },
          }}
        >
          Recargar créditos
        </Button>
      </Stack>

      {/* Payments List */}
      {payments && payments.length === 0 ? (
        <Alert severity="warning">
          No tienes solicitudes de pago registradas todavía.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {payments?.map((payment: Payment) => (
            <Card
              key={payment.id}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 1.5, md: 2 },
                  "&:last-child": { pb: { xs: 1.5, md: 2 } },
                }}
              >
                {/* Fila 1: créditos + fecha | chip */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, lineHeight: 1.2 }}
                    >
                      {payment.credits} créditos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(payment.createdAt).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                  {getStatusChip(payment.status)}
                </Box>

                {/* Fila 2: monto | comprobante inline */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    ${payment.amount.toLocaleString("es-AR")}
                  </Typography>
                  {payment.receiptUrl && (
                    <IconButton
                      size="small"
                      onClick={() => handleViewReceipt(payment.receiptUrl!)}
                      title="Ver Comprobante"
                      sx={{
                        color: "primary.main",
                        border: "1px solid",
                        borderColor: "primary.light",
                        borderRadius: 1,
                        px: 1,
                        gap: 0.5,
                      }}
                    >
                      <ReceiptIcon sx={{ fontSize: 16 }} />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        Comprobante
                      </Typography>
                    </IconButton>
                  )}
                </Box>

                {/* Rejection Reason Alert */}
                {payment.status === PaymentStatus.REJECTED &&
                  payment.rejectionReason && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Razón del rechazo:
                      </Typography>
                      <Typography variant="body2">
                        {payment.rejectionReason}
                      </Typography>
                    </Alert>
                  )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Receipt Modal */}
      <Dialog
        open={!!selectedReceipt}
        onClose={handleCloseReceipt}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Comprobante de Pago</Typography>
            <IconButton onClick={handleCloseReceipt} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <PrivateImage value={selectedReceipt} alt="Comprobante de pago" />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de recarga premium (controlado por el store) */}
      <CreditPackagesShowcase />
    </Box>
  );
}
