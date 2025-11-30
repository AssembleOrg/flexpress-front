"use client";

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
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useMyPayments } from "@/lib/hooks/queries/usePaymentQueries";
import type { Payment } from "@/lib/types/api";
import { PaymentStatus } from "@/lib/types/api";

export default function PaymentsPage() {
  const { data: payments, isLoading, error } = useMyPayments();
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

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
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          color: "primary.main",
          mb: 3,
        }}
      >
        Mis Pagos
      </Typography>

      {/* Payments List */}
      {payments && payments.length === 0 ? (
        <Alert severity="info">
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
              <CardContent>
                <Stack spacing={2}>
                  {/* Header Row */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={1}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
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

                  {/* Amount */}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Monto pagado
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ${payment.amount.toLocaleString("es-AR")}
                    </Typography>
                  </Box>

                  {/* Rejection Reason Alert */}
                  {payment.status === PaymentStatus.REJECTED && payment.rejectionReason && (
                    <Alert severity="error">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Razón del rechazo:
                      </Typography>
                      <Typography variant="body2">{payment.rejectionReason}</Typography>
                    </Alert>
                  )}

                  {/* View Receipt Button */}
                  {payment.receiptUrl && (
                    <Box>
                      <Button
                        startIcon={<ReceiptIcon />}
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewReceipt(payment.receiptUrl!)}
                      >
                        Ver Comprobante
                      </Button>
                    </Box>
                  )}
                </Stack>
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Comprobante de Pago</Typography>
            <IconButton onClick={handleCloseReceipt} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <Box
              component="img"
              src={selectedReceipt}
              alt="Comprobante de pago"
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
