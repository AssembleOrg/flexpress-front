"use client";

import { useState } from "react";
import Link from "next/link";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import toast from "react-hot-toast";
import { useAdminPayments } from "@/lib/hooks/queries/useAdminQueries";
import {
  useApprovePayment,
  useRejectPayment,
} from "@/lib/hooks/mutations/usePaymentMutations";
import type { Payment } from "@/lib/types/api";
import { ApprovePaymentModal } from "@/components/modals/ApprovePaymentModal";
import { RejectPaymentModal } from "@/components/modals/RejectPaymentModal";
import { MobilePaymentCard } from "./mobile/MobilePaymentCard";

export function PaymentsTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Queries
  const { data, isLoading } = useAdminPayments({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  // Mutations
  const approveMutation = useApprovePayment();
  const rejectMutation = useRejectPayment();

  const handleViewReceipt = (url: string) => {
    setReceiptUrl(url);
    setReceiptModalOpen(true);
  };

  const handleApprove = (payment: Payment) => {
    setSelectedPayment(payment);
    setApproveModalOpen(true);
  };

  const handleReject = (payment: Payment) => {
    setSelectedPayment(payment);
    setRejectModalOpen(true);
  };

  const confirmApprove = () => {
    if (selectedPayment) {
      approveMutation.mutate(selectedPayment.id, {
        onSuccess: () => {
          setApproveModalOpen(false);
          setSelectedPayment(null);
        },
      });
    }
  };

  const confirmReject = (reason: string) => {
    if (selectedPayment) {
      rejectMutation.mutate(
        { paymentId: selectedPayment.id, reason },
        {
          onSuccess: () => {
            setRejectModalOpen(false);
            setSelectedPayment(null);
          },
        },
      );
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<
      string,
      "default" | "primary" | "error" | "warning" | "success"
    > = {
      pending: "warning",
      completed: "success",
      rejected: "error",
      accepted: "primary",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      completed: "Completado",
      rejected: "Rechazado",
      accepted: "Aceptado",
    };
    return labels[status] || status;
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID Pago",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => params.row.id.substring(0, 8),
    },
    {
      field: "userId",
      headerName: "Usuario",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const userName = params.row.user?.name || "Usuario sin nombre";
        const userEmail = params.row.user?.email || "";

        return (
          <Box>
            <Link
              href={`/admin/users/${params.row.userId}`}
              style={{
                color: "#b7850d",
                textDecoration: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = "none")
              }
            >
              {userName}
            </Link>
            {userEmail && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {userEmail}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "credits",
      headerName: "Créditos",
      width: 120,
      type: "number",
    },
    {
      field: "receiptUrl",
      headerName: "Comprobante",
      width: 130,
      renderCell: (params) => {
        if (!params.row.receiptUrl) {
          return (
            <Typography variant="caption" color="text.secondary">
              Sin comprobante
            </Typography>
          );
        }
        return (
          <Button size="small" onClick={() => handleViewReceipt(params.row.receiptUrl)}>
            Ver
          </Button>
        );
      },
    },
    {
      field: "status",
      headerName: "Estado",
      width: 130,
      renderCell: (params) => {
        const status = params.row.status;
        let chipSx = {};

        if (status === "pending") {
          chipSx = {
            backgroundColor: "#b7850d",
            color: "white",
          };
        } else if (status === "completed") {
          chipSx = {
            backgroundColor: "#dca621",
            color: "#212121",
          };
        } else if (status === "accepted") {
          chipSx = {
            backgroundColor: "#380116",
            color: "white",
          };
        } else if (status === "rejected") {
          chipSx = {
            backgroundColor: "#e74c3c",
            color: "white",
          };
        }

        return <Chip label={getStatusLabel(status)} size="small" sx={chipSx} />;
      },
    },
    {
      field: "createdAt",
      headerName: "Fecha",
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.row.createdAt);
        return date.toLocaleDateString("es-AR");
      },
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 220,
      renderCell: (params) => {
        if (params.row.status !== "pending") {
          return (
            <Typography variant="caption" color="text.secondary">
              Procesado
            </Typography>
          );
        }

        return (
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => handleApprove(params.row)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              Aprobar
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleReject(params.row)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              Rechazar
            </Button>
          </Box>
        );
      },
    },
  ];

  // Hide userId and createdAt columns on mobile
  const visibleColumns = isMobile
    ? columns.filter((col) => !["userId", "createdAt"].includes(col.field))
    : columns;

  return (
    <Box>
      {/* Conditional Rendering: Mobile Cards vs DataGrid */}
      {isMobile ? (
        <Stack spacing={2}>
          {(data?.data ?? []).map((payment) => (
            <MobilePaymentCard
              key={payment.id}
              payment={payment}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewReceipt={handleViewReceipt}
            />
          ))}
        </Stack>
      ) : (
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={data?.data ?? []}
            columns={visibleColumns}
            pageSizeOptions={[5, 10, 20, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            loading={isLoading}
            disableRowSelectionOnClick
          />
        </Box>
      )}

      {/* Receipt Modal */}
      <Dialog
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Comprobante de Pago</DialogTitle>
        <DialogContent>
          {receiptUrl && (
            <Box textAlign="center">
              <img
                src={receiptUrl}
                alt="Comprobante"
                style={{ maxWidth: "100%", borderRadius: 8 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptModalOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Modal */}
      <ApprovePaymentModal
        open={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedPayment(null);
        }}
        onConfirm={confirmApprove}
        userName={selectedPayment?.user?.name || "Usuario"}
        credits={selectedPayment?.credits || 0}
        amount={selectedPayment?.amount || 0}
        isLoading={approveMutation.isPending}
      />

      {/* Reject Modal */}
      <RejectPaymentModal
        open={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedPayment(null);
        }}
        onConfirm={confirmReject}
        userName={selectedPayment?.user?.name || "Usuario"}
        credits={selectedPayment?.credits || 0}
        isLoading={rejectMutation.isPending}
      />
    </Box>
  );
}
