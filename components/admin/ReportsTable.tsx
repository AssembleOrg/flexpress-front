"use client";

import { useState } from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAdminReports } from "@/lib/hooks/queries/useAdminQueries";
import type { Report } from "@/lib/types/api";

export function ReportsTable() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const [statusFilter, setStatusFilter] = useState<
    "" | "pending" | "investigating" | "resolved" | "dismissed"
  >("");

  // Queries
  const { data, isLoading } = useAdminReports({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    status: statusFilter || undefined,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<
      string,
      "default" | "primary" | "error" | "warning" | "success"
    > = {
      pending: "error",
      investigating: "warning",
      resolved: "success",
      dismissed: "default",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      investigating: "Investigando",
      resolved: "Resuelto",
      dismissed: "Desestimado",
    };
    return labels[status] || status;
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID Reporte",
      flex: 0.6,
      minWidth: 110,
      renderCell: (params) => params.row.id.substring(0, 8),
    },
    {
      field: "reason",
      headerName: "Razón",
      flex: 1.2,
      minWidth: 200,
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
            backgroundColor: "#380116",
            color: "white",
          };
        } else if (status === "investigating") {
          chipSx = {
            backgroundColor: "#b7850d",
            color: "white",
          };
        } else if (status === "resolved") {
          chipSx = {
            backgroundColor: "#dca621",
            color: "#212121",
          };
        }

        return <Chip label={getStatusLabel(status)} size="small" sx={chipSx} />;
      },
    },
    {
      field: "reporter",
      headerName: "Reportador",
      width: 150,
      renderCell: (params) => params.row.reporter?.name || "N/A",
    },
    {
      field: "reported",
      headerName: "Reportado",
      width: 150,
      renderCell: (params) => params.row.reported?.name || "N/A",
    },
    {
      field: "createdAt",
      headerName: "Fecha",
      width: 120,
      renderCell: (params) => {
        const date = new Date(params.row.createdAt);
        return date.toLocaleDateString("es-AR");
      },
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => router.push(`/admin/reports/${params.row.id}`)}
          variant="outlined"
          sx={{
            color: "#b7850d",
            borderColor: "#b7850d",
            "&:hover": {
              backgroundColor: "rgba(183, 133, 13, 0.1)",
              borderColor: "#b7850d",
            },
          }}
        >
          Ver Detalles
        </Button>
      ),
    },
  ];

  // Hide reporter, reported, createdAt columns on mobile
  const visibleColumns = isMobile
    ? columns.filter(
        (col) => !["reporter", "reported", "createdAt"].includes(col.field),
      )
    : columns;

  return (
    <Box>
      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">Filtrar por estado</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            label="Filtrar por estado"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendiente</MenuItem>
            <MenuItem value="investigating">Investigando</MenuItem>
            <MenuItem value="resolved">Resuelto</MenuItem>
            <MenuItem value="dismissed">Desestimado</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* DataGrid */}
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
    </Box>
  );
}
