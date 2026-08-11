"use client";

import { Visibility as VisibilityIcon } from "@mui/icons-material";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import Link from "next/link";
import { useState } from "react";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminTrips } from "@/lib/hooks/queries/useAdminQueries";
import type { Trip } from "@/lib/types/api";
import { formatDate } from "@/lib/utils/formatDate";
import { MobileTripAdminCard } from "./mobile/MobileTripAdminCard";
import { TripDetailModal } from "./modals/TripDetailModal";

export function TripsTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [statusFilter, setStatusFilter] = useState<"" | Trip["status"]>("");

  // Queries
  const { data, isLoading } = useAdminTrips({ page: 1, limit: 100 });

  // Ordenar "nuevos arriba" (createdAt descendente) + filtro por estado
  const sortedTrips = [...(data?.data ?? [])].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
  const filteredTrips = statusFilter
    ? sortedTrips.filter((t) => t.status === statusFilter)
    : sortedTrips;

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
      field: "status",
      headerName: "Estado",
      width: 170,
      renderCell: (params) => (
        <StatusChip status={params.row.status} size="small" />
      ),
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

  // Hide address, cargo, team, createdAt, status columns on mobile
  const visibleColumns = isMobile
    ? columns.filter(
        (col) =>
          !["address", "cargo", "team", "createdAt", "status"].includes(
            col.field,
          ),
      )
    : columns;

  return (
    <Box>
      {/* Filtro por estado */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="trip-status-filter-label">
            Filtrar por estado
          </InputLabel>
          <Select
            labelId="trip-status-filter-label"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            label="Filtrar por estado"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendiente</MenuItem>
            <MenuItem value="charter_completed">Esperando Confirmación</MenuItem>
            <MenuItem value="completed">Finalizado</MenuItem>
            <MenuItem value="cancelled">Cancelado</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Conditional Rendering: Mobile Cards vs DataGrid */}
      {isMobile ? (
        <Stack spacing={2}>
          {filteredTrips.map((trip) => (
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
            rows={filteredTrips}
            columns={visibleColumns}
            pageSizeOptions={[5, 10, 20, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
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
