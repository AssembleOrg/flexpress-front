"use client";

import { useState, useMemo, useEffect } from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAdminUsers } from "@/lib/hooks/queries/useAdminQueries";
import { useDeleteUser } from "@/lib/hooks/mutations/useAdminMutations";
import { useAuthStore } from "@/lib/stores/authStore";
import type { User } from "@/lib/types/api";
import { MobileUserCard } from "./mobile/MobileUserCard";

const MOBILE_PAGE_SIZE = 20;

export function UsersTable() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user: currentUser } = useAuthStore();

  // Local states
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });
  const [mobilePage, setMobilePage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setMobilePage(0);
  }, [searchText, roleFilter]);

  // Fetch ALL users (client-side filtering/pagination)
  const { data: users = [], isLoading } = useAdminUsers();

  // Client-side filtering — desktop DataGrid paginates itself, mobile slices manually
  const { filteredUsers, paginatedMobileUsers, totalUsers } = useMemo(() => {
    if (!users || users.length === 0) {
      return { filteredUsers: [], paginatedMobileUsers: [], totalUsers: 0 };
    }

    let filtered = [...users];

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower),
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    const totalUsers = filtered.length;
    const start = mobilePage * MOBILE_PAGE_SIZE;
    const paginatedMobileUsers = filtered.slice(start, start + MOBILE_PAGE_SIZE);

    return { filteredUsers: filtered, paginatedMobileUsers, totalUsers };
  }, [users, searchText, roleFilter, mobilePage]);

  const deleteUserMutation = useDeleteUser();

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    await deleteUserMutation.mutateAsync(userToDelete.id);
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleEditClick = (user: User) => {
    if (currentUser?.role === "admin") {
      router.push(`/admin/users/${user.id}`);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrador",
      subadmin: "Sub-Admin",
      user: "Usuario",
      charter: "Conductor",
    };
    return labels[role] || role;
  };

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "Avatar",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.avatar || undefined}
          sx={{ width: 40, height: 40 }}
        >
          {params.row.name?.charAt(0)?.toUpperCase()}
        </Avatar>
      ),
      hideable: false,
    },
    {
      field: "name",
      headerName: "Nombre",
      flex: 0.8,
      minWidth: 130,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 170,
    },
    {
      field: "role",
      headerName: "Rol",
      width: 120,
      renderCell: (params) => {
        const role = params.row.role;
        let chipSx = {};

        if (role === "admin") {
          chipSx = { backgroundColor: "#380116", color: "white" };
        } else if (role === "subadmin") {
          chipSx = { backgroundColor: "#4b011d", color: "white" };
        } else if (role === "charter") {
          chipSx = { backgroundColor: "#dca621", color: "#212121" };
        }

        return <Chip label={getRoleLabel(role)} size="small" sx={chipSx} />;
      },
    },
    {
      field: "credits",
      headerName: "Créditos",
      width: 100,
      type: "number",
    },
    {
      field: "createdAt",
      headerName: "Fecha de Registro",
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.row.createdAt);
        return date.toLocaleDateString("es-AR");
      },
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {currentUser?.role === "admin" && (
            <>
              <Tooltip title="Editar usuario">
                <IconButton
                  size="small"
                  onClick={() => handleEditClick(params.row)}
                  sx={{
                    color: "#b7850d",
                    "&:hover": { backgroundColor: "rgba(183, 133, 13, 0.15)" },
                  }}
                >
                  <EditIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar usuario">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(params.row)}
                  sx={{
                    color: "#e74c3c",
                    "&:hover": { backgroundColor: "rgba(231, 76, 60, 0.15)" },
                  }}
                >
                  <DeleteIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ];

  const totalMobilePages = Math.ceil(totalUsers / MOBILE_PAGE_SIZE);

  return (
    <Box>
      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Buscar por nombre o email"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          variant="outlined"
          sx={{ minWidth: 200 }}
          placeholder="María, admin@..."
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="role-filter-label">Filtrar por rol</InputLabel>
          <Select
            labelId="role-filter-label"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Filtrar por rol"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="subadmin">Sub-Admin</MenuItem>
            <MenuItem value="user">Usuario</MenuItem>
            <MenuItem value="charter">Conductor</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Conditional Rendering: Mobile Cards vs DataGrid */}
      {isMobile ? (
        <Box>
          <Stack spacing={0}>
            {paginatedMobileUsers.map((user) => (
              <MobileUserCard
                key={user.id}
                user={user}
                onClick={() => router.push(`/admin/users/${user.id}`)}
              />
            ))}
          </Stack>

          {/* Mobile pagination */}
          {totalMobilePages > 1 && (
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={1}
              sx={{ mt: 2, py: 1 }}
            >
              <IconButton
                disabled={mobilePage === 0}
                onClick={() => setMobilePage((p) => p - 1)}
                size="small"
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60, textAlign: "center" }}>
                {mobilePage + 1} / {totalMobilePages}
              </Typography>
              <IconButton
                disabled={mobilePage >= totalMobilePages - 1}
                onClick={() => setMobilePage((p) => p + 1)}
                size="small"
              >
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          )}
        </Box>
      ) : (
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            paginationMode="client"
            loading={isLoading}
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-cell": {
                overflow: "visible",
              },
            }}
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar a {userToDelete?.name}? Esta
          acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
