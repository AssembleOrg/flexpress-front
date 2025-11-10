"use client";

import { useState } from "react";
import Link from "next/link";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useAdminTrips } from "@/lib/hooks/queries/useAdminQueries";
import type { Trip } from "@/lib/types/api";

export function TripsTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  // Queries
  const { data, isLoading } = useAdminTrips({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
  });

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID Viaje",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => params.row.id.substring(0, 8),
    },
    {
      field: "user",
      headerName: "Usuario",
      width: 150,
      renderCell: (params) => {
        if (!params.row.user) return "N/A";
        return (
          <Link
            href={`/admin/users/${params.row.user.id}`}
            style={{
              color: "#b7850d",
              textDecoration: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            {params.row.user.name}
          </Link>
        );
      },
    },
    {
      field: "charter",
      headerName: "Conductor",
      width: 150,
      renderCell: (params) => {
        if (!params.row.charter) return "N/A";
        return (
          <Link
            href={`/admin/users/${params.row.charter.id}`}
            style={{
              color: "#b7850d",
              textDecoration: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            {params.row.charter.name}
          </Link>
        );
      },
    },
    {
      field: "address",
      headerName: "Dirección",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => params.row.address.substring(0, 50),
    },
    {
      field: "workersCount",
      headerName: "Trabajadores",
      width: 120,
      type: "number",
    },
    {
      field: "scheduledDate",
      headerName: "Fecha Programada",
      width: 150,
      renderCell: (params) => {
        if (!params.row.scheduledDate) return "-";
        const date = new Date(params.row.scheduledDate);
        return date.toLocaleDateString("es-AR");
      },
    },
    {
      field: "createdAt",
      headerName: "Fecha de Creación",
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.row.createdAt);
        return date.toLocaleDateString("es-AR");
      },
    },
  ];

  // Hide address, scheduledDate, createdAt columns on mobile
  const visibleColumns = isMobile
    ? columns.filter(
        (col) => !["address", "scheduledDate", "createdAt"].includes(col.field),
      )
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
