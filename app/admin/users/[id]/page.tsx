"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminUserDetail } from "@/lib/hooks/queries/useAdminQueries";
import {
  useUpdateUser,
  useDeleteUser,
} from "@/lib/hooks/mutations/useAdminMutations";
import { useAuthStore } from "@/lib/stores/authStore";
import type { User } from "@/lib/types/api";

// Form validation schema
const updateUserSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  number: z.string().min(1, "El teléfono es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  credits: z.number().min(0, "Los créditos deben ser positivos"),
  role: z.enum(["admin", "subadmin", "user", "charter"]),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useAuthStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Permissions check - only admin can edit users
  if (currentUser?.role !== "admin") {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          No tienes permisos para editar usuarios
        </Typography>
      </Container>
    );
  }

  // Queries
  const { data: user, isLoading } = useAdminUserDetail(userId);
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Form
  const { control, handleSubmit, reset } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      number: user?.number || "",
      address: user?.address || "",
      credits: user?.credits || 0,
      role: user?.role || "user",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        number: user.number,
        address: user.address,
        credits: user.credits,
        role: user.role as any,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateUserFormData) => {
    await updateUserMutation.mutateAsync({
      id: userId,
      data: data as Partial<User>,
    });
  };

  const handleDelete = async () => {
    await deleteUserMutation.mutateAsync(userId);
    setDeleteDialogOpen(false);
    router.push("/admin");
  };

  if (isLoading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Usuario no encontrado
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        Volver
      </Button>

      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>
        Editar Usuario: {user.name}
      </Typography>

      {/* Form Card */}
      <Card>
        <CardContent>
          <Stack spacing={3}>
            {/* Name */}
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Nombre Completo"
                  variant="outlined"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            {/* Email */}
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  type="email"
                  error={!!error}
                  helperText={error?.message}
                  disabled
                />
              )}
            />

            {/* Phone */}
            <Controller
              name="number"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Teléfono"
                  variant="outlined"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            {/* Address */}
            <Controller
              name="address"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Dirección"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            {/* Role */}
            <Controller
              name="role"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  select
                  {...field}
                  label="Rol"
                  variant="outlined"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="admin">Administrador</option>
                  <option value="subadmin">Sub-Administrador</option>
                  <option value="user">Usuario</option>
                  <option value="charter">Conductor</option>
                </TextField>
              )}
            />

            {/* Credits */}
            <Controller
              name="credits"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Créditos"
                  variant="outlined"
                  fullWidth
                  type="number"
                  inputProps={{ step: 1 }}
                  error={!!error}
                  helperText={error?.message}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            {/* Info */}
            <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Creado: {new Date(user.createdAt).toLocaleString("es-AR")}
              </Typography>
              <br />
              <Typography variant="caption" color="textSecondary">
                Actualizado: {new Date(user.updatedAt).toLocaleString("es-AR")}
              </Typography>
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Eliminar Usuario
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás completamente seguro de que deseas eliminar a <strong>{user.name}</strong>?
          <br />
          <br />
          Esta acción es permanente y no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? "Eliminando..." : "Sí, Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
