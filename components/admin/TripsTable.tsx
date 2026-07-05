"use client";

import { Visibility as VisibilityIcon } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import Link from "next/link";
import { useState } from "react";
import { useAdminTrips } from "@/lib/hooks/queries/useAdminQueries";
import type { Trip } from "@/lib/types/api";
import { formatDate } from "@/lib/utils/formatDate";
import { MobileTripAdminCard } from "./mobile/MobileTripAdminCard";
import { TripDetailModal } from "./modals/TripDetailModal";

export function TripsTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

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
      field: "cargo",
      headerName: "Carga",
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const cargo =
          params.row.cargoDescription ??
          params.row.travelMatch?.cargoDescription;
        if (!cargo) return "-";
        return cargo.length > 40 ? `${cargo.substring(0, 40)}…` : cargo;
      },
    },
    {
      field: "team",
      headerName: "Equipo",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const snapshot = params.row.travelMatch?.personnel?.snapshot;
        if (!snapshot?.driver) return "-";
        const helpers = snapshot.helpers?.length ?? 0;
        return helpers > 0
          ? `${snapshot.driver.name} +${helpers}`
          : snapshot.driver.name;
      },
    },
    {
      field: "createdAt",
      headerName: "Fecha de Creación",
      width: 150,
      renderCell: (params) => formatDate(params.row.createdAt),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 110,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          sx={{ width: "100%", height: "100%" }}
        >
          <Tooltip title="Ver detalles">
            <IconButton
              size="small"
              onClick={() => setSelectedTrip(params.row)}
              sx={{
                color: "#b7850d",
                "&:hover": { backgroundColor: "rgba(183, 133, 13, 0.15)" },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // Hide address, cargo, team, createdAt columns on mobile
  const visibleColumns = isMobile
    ? columns.filter(
        (col) => !["address", "cargo", "team", "createdAt"].includes(col.field),
      )
    : columns;

  return (
    <Box>
      {/* Conditional Rendering: Mobile Cards vs DataGrid */}
      {isMobile ? (
        <Stack spacing={2}>
          {(data?.data ?? []).map((trip) => (
            <MobileTripAdminCard
              key={trip.id}
              trip={trip}
              onClick={() => setSelectedTrip(trip)}
            />
          ))}
        </Stack>
      ) : (
        <Box sx={{ width: "100%" }}>
          <DataGrid
            autoHeight
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

      <TripDetailModal
        trip={selectedTrip}
        open={selectedTrip !== null}
        onClose={() => setSelectedTrip(null)}
      />
    </Box>
  );
}
