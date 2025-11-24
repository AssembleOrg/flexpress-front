"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAdminReportDetail } from "@/lib/hooks/queries/useAdminQueries";
import { useUpdateReport } from "@/lib/hooks/mutations/useAdminMutations";
import { useAuthStore } from "@/lib/stores/authStore";
import type { UpdateReportRequest } from "@/lib/types/admin";

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user: currentUser } = useAuthStore();

  const [dialogOpen, setDialogOpen] = useState(false);

  // Queries
  const { data: report, isLoading } = useAdminReportDetail(reportId);
  const updateReportMutation = useUpdateReport();

  // Form
  const { control, handleSubmit, reset } = useForm<UpdateReportRequest>({
    defaultValues: {
      status: report?.status,
      adminNotes: report?.adminNotes || "",
    },
  });

  // Update form when report data changes
  React.useEffect(() => {
    if (report) {
      reset({
        status: report.status as any,
        adminNotes: report.adminNotes || "",
      });
    }
  }, [report, reset]);

  const onSubmit = async (data: UpdateReportRequest) => {
    await updateReportMutation.mutateAsync({ id: reportId, data });
    setDialogOpen(false);
  };

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

  if (!report) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Reporte no encontrado
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
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          alignItems="flex-start"
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Reporte #{report.id.substring(0, 8)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Razón: {report.reason}
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(report.status)}
            color={getStatusColor(report.status)}
            size="medium"
          />
        </Stack>
      </Box>

      {/* Report Details */}
      <Stack spacing={3}>
        {/* Info Cards */}
        <Stack direction={isMobile ? "column" : "row"} spacing={2}>
          {/* Reportador */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ mb: 1 }}
              >
                REPORTADOR
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 50, height: 50 }}>
                  {report.reporter?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {report.reporter?.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {report.reporter?.email}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Reportado */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ mb: 1 }}
              >
                REPORTADO
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 50, height: 50 }}>
                  {report.reported?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {report.reported?.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {report.reported?.email}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Description */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
            DESCRIPCIÓN
          </Typography>
          <Typography variant="body2">
            {report.description || "Sin descripción adicional"}
          </Typography>
        </Paper>

        {/* Conversation Messages */}
        {report.conversation?.messages && (
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ mb: 2 }}
            >
              HISTORIAL DE MENSAJES ({report.conversation.messages.length})
            </Typography>
            <Stack
              spacing={2}
              sx={{
                maxHeight: 400,
                overflowY: "auto",
                pl: 2,
                borderLeft: "2px solid #eee",
              }}
            >
              {report.conversation.messages.map((msg) => (
                <Box key={msg.id}>
                  <Stack direction="row" spacing={1}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {msg.sender?.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(msg.createdAt).toLocaleString("es-AR")}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {msg.content}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Admin Notes and Status */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
            ACTUALIZACIÓN DE REPORTE
          </Typography>
          <Stack spacing={2}>
            <Typography variant="caption">
              Creado: {new Date(report.createdAt).toLocaleString("es-AR")}
            </Typography>
            {report.resolvedAt && (
              <Typography variant="caption">
                Resuelto: {new Date(report.resolvedAt).toLocaleString("es-AR")}
              </Typography>
            )}

            {/* Show form only for admin and subadmin */}
            {(currentUser?.role === "admin" ||
              currentUser?.role === "subadmin") && (
              <Button variant="contained" onClick={() => setDialogOpen(true)}>
                Editar Reporte
              </Button>
            )}
          </Stack>
        </Paper>
      </Stack>

      {/* Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Actualizar Reporte</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Estado"
                  {...field}
                  variant="outlined"
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="pending">Pendiente</option>
                  <option value="investigating">Investigando</option>
                  <option value="resolved">Resuelto</option>
                  <option value="dismissed">Desestimado</option>
                </TextField>
              )}
            />
            <Controller
              name="adminNotes"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Notas Admin"
                  {...field}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Escribir notas de administración..."
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={updateReportMutation.isPending}
          >
            {updateReportMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
