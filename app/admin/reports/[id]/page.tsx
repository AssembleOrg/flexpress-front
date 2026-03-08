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
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAdminReportDetail } from "@/lib/hooks/queries/useAdminQueries";
import { useUpdateReport } from "@/lib/hooks/mutations/useAdminMutations";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMatch } from "@/lib/hooks/queries/useTravelMatchQueries";
import type { UpdateReportRequest } from "@/lib/types/admin";
import type { UserRole } from "@/lib/types/api";
import { TravelMatchStatus } from "@/lib/types/api";

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
  const matchId = report?.conversation?.matchId ?? "";
  const { data: travelMatch } = useMatch(matchId);
  const updateReportMutation = useUpdateReport();

  // Form
  const { control, handleSubmit, reset } = useForm<UpdateReportRequest>({
    defaultValues: {
      status: report?.status,
      adminNotes: report?.adminNotes || "",
    },
  });

  // Update form when report data changes
  useEffect(() => {
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

  const getMatchStatusColor = (
    status: TravelMatchStatus,
  ): "default" | "primary" | "warning" | "success" | "error" => {
    const colors: Record<
      TravelMatchStatus,
      "default" | "primary" | "warning" | "success" | "error"
    > = {
      [TravelMatchStatus.SEARCHING]: "primary",
      [TravelMatchStatus.PENDING]: "warning",
      [TravelMatchStatus.ACCEPTED]: "primary",
      [TravelMatchStatus.COMPLETED]: "success",
      [TravelMatchStatus.CANCELLED]: "error",
      [TravelMatchStatus.REJECTED]: "error",
      [TravelMatchStatus.EXPIRED]: "default",
    };
    return colors[status] ?? "default";
  };

  const getMatchStatusLabel = (status: TravelMatchStatus) => {
    const labels: Record<TravelMatchStatus, string> = {
      [TravelMatchStatus.SEARCHING]: "Buscando",
      [TravelMatchStatus.PENDING]: "Pendiente",
      [TravelMatchStatus.ACCEPTED]: "Aceptado",
      [TravelMatchStatus.COMPLETED]: "Completado",
      [TravelMatchStatus.CANCELLED]: "Cancelado",
      [TravelMatchStatus.REJECTED]: "Rechazado",
      [TravelMatchStatus.EXPIRED]: "Expirado",
    };
    return labels[status] ?? status;
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

        {/* Viaje Asociado */}
        {travelMatch && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
              VIAJE ASOCIADO
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 140 }}>
                  Estado:
                </Typography>
                <Chip
                  label={getMatchStatusLabel(travelMatch.status)}
                  color={getMatchStatusColor(travelMatch.status)}
                  size="small"
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 140 }}>
                  Origen:
                </Typography>
                <Typography variant="body2">{travelMatch.pickupAddress}</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 140 }}>
                  Destino:
                </Typography>
                <Typography variant="body2">{travelMatch.destinationAddress}</Typography>
              </Stack>
              {travelMatch.distanceKm != null && (
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="textSecondary" sx={{ minWidth: 140 }}>
                    Distancia:
                  </Typography>
                  <Typography variant="body2">{travelMatch.distanceKm} km</Typography>
                </Stack>
              )}
              {travelMatch.estimatedCredits != null && (
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="textSecondary" sx={{ minWidth: 140 }}>
                    Créditos estimados:
                  </Typography>
                  <Typography variant="body2">{travelMatch.estimatedCredits}</Typography>
                </Stack>
              )}
              {travelMatch.scheduledDate && (
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="textSecondary" sx={{ minWidth: 140 }}>
                    Fecha programada:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(travelMatch.scheduledDate).toLocaleString("es-AR")}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={1}>
                <Typography variant="body2" color="textSecondary" sx={{ minWidth: 140 }}>
                  Creado:
                </Typography>
                <Typography variant="body2">
                  {new Date(travelMatch.createdAt).toLocaleString("es-AR")}
                </Typography>
              </Stack>
              {(travelMatch.status === TravelMatchStatus.COMPLETED ||
                travelMatch.status === TravelMatchStatus.CANCELLED) && (
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="textSecondary" sx={{ minWidth: 140 }}>
                    {travelMatch.status === TravelMatchStatus.COMPLETED
                      ? "Completado:"
                      : "Cancelado:"}
                  </Typography>
                  <Typography variant="body2">
                    {new Date(travelMatch.updatedAt).toLocaleString("es-AR")}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Paper>
        )}

        {/* Conversation Messages */}
        {report.conversation?.messages && report.conversation.messages.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
              CHAT ({report.conversation.messages.length} mensajes)
            </Typography>
            <Stack
              spacing={1.5}
              sx={{
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {report.conversation.messages.map((msg) => {
                const isCharter = msg.sender?.role === ("charter" as UserRole);
                return (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isCharter ? "flex-end" : "flex-start",
                    }}
                  >
                    <Stack
                      direction={isCharter ? "row-reverse" : "row"}
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 0.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: 12,
                          bgcolor: isCharter ? "primary.main" : "secondary.main",
                        }}
                      >
                        {msg.sender?.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {msg.sender?.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(msg.createdAt).toLocaleString("es-AR")}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        bgcolor: isCharter ? "primary.50" : "grey.100",
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        maxWidth: "75%",
                        border: "1px solid",
                        borderColor: isCharter ? "primary.200" : "grey.300",
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                    </Box>
                  </Box>
                );
              })}
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
            {report.updatedAt !== report.createdAt && (
              <Typography variant="caption">
                Actualizado: {new Date(report.updatedAt).toLocaleString("es-AR")}
              </Typography>
            )}
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
