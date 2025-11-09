"use client";

import { useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
} from "@mui/x-data-grid";
import {
  Box,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAdminPayments } from "@/lib/hooks/queries/useAdminQueries";
import type { Payment } from "@/lib/types/api";

export function PaymentsTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  // Queries
  const { data, isLoading } = useAdminPayments({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "primary" | "error" | "warning" | "success"> = {
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
      minWidth: 120,
      renderCell: (params) => params.row.userId.substring(0, 8),
    },
    {
      field: "credits",
      headerName: "Créditos",
      width: 120,
      type: "number",
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

        return (
          <Chip
            label={getStatusLabel(status)}
            size="small"
            sx={chipSx}
          />
        );
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
  ];

  // Hide userId and createdAt columns on mobile
  const visibleColumns = isMobile
    ? columns.filter((col) => !["userId", "createdAt"].includes(col.field))
    : columns;

  return (
    <Box>
      {/* DataGrid */}
      <Box sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={data?.data ?? []}
          columns={visibleColumns}
          pageSizeOptions={[5, 10, 20, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={isLoading}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
}
