"use client";

import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useUpdateReport } from "@/lib/hooks/mutations/useAdminMutations";
import { useAdminReportDetail } from "@/lib/hooks/queries/useAdminQueries";
import { useMatch } from "@/lib/hooks/queries/useTravelMatchQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import type { UpdateReportRequest } from "@/lib/types/admin";
import type { UserRole } from "@/lib/types/api";
import { TravelMatchStatus } from "@/lib/types/api";
import { getCharterCreditCost } from "@/lib/utils/creditCost";
import { formatDateTime } from "@/lib/utils/formatDate";
import { formatPhoneInput } from "@/lib/utils/phone";

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
  const { control, handleSubmit, reset, watch, setValue } =
    useForm<UpdateReportRequest>({
      defaultValues: {
        status: report?.status,
        adminNotes: report?.adminNotes || "",
        creditsToReporter: undefined,
        creditsFromReported: undefined,
        creditsToReported: undefined,
        creditsFromReporter: undefined,
        resolvedInFavorOf: undefined,
      },
    });

  // Update form when report data changes
  useEffect(() => {
    if (report) {
      reset({
        status: report.status as any,
        adminNotes: report.adminNotes || "",
        creditsToReporter: report.creditsToReporter ?? undefined,
        creditsFromReported: report.creditsFromReported ?? undefined,
        creditsToReported: report.creditsToReported ?? undefined,
        creditsFromReporter: report.creditsFromReporter ?? undefined,
        resolvedInFavorOf: report.resolvedInFavorOf ?? undefined,
      });
    }
  }, [report, reset]);

  const watchedStatus = watch("status");
  const watchedFromReported = Number(watch("creditsFromReported") ?? 0);
  const watchedFromReporter = Number(watch("creditsFromReporter") ?? 0);

  const reportedCredits = report?.reported?.credits ?? 0;
  const reporterCredits = report?.reporter?.credits ?? 0;
  const creditActionsEnabled = watchedStatus === "resolved";
  const exceedsReportedBalance =
    creditActionsEnabled && watchedFromReported > reportedCredits;
  const exceedsReporterBalance =
    creditActionsEnabled && watchedFromReporter > reporterCredits;

  // El bloque de créditos solo se muestra cuando el estado es "resolved", pero NO
  // borramos lo que el admin ya escribió al cambiar de estado: si vuelve a
  // "resolved" recupera sus valores. `onSubmit` ya se encarga de no enviarlos
  // cuando el estado final no es "resolved".

  const onSubmit = async (data: UpdateReportRequest) => {
    const payload: UpdateReportRequest =
      data.status === "resolved"
        ? {
            ...data,
            creditsToReporter: data.creditsToReporter || undefined,
            creditsFromReported: data.creditsFromReported || undefined,
            creditsToReported: data.creditsToReported || undefined,
            creditsFromReporter: data.creditsFromReporter || undefined,
          }
        : {
            status: data.status,
            adminNotes: data.adminNotes,
          };

    await updateReportMutation.mutateAsync({ id: reportId, data: payload });
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
                QUIEN REPORTA
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
                  <Typography
                    variant="caption"
                    display="block"
                    color="textSecondary"
                  >
                    {report.reporter?.number
                      ? formatPhoneInput(report.reporter.number)
                      : "—"}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ fontWeight: 600, mt: 0.5 }}
                  >
                    Saldo: {report.reporter?.credits ?? "—"} créditos
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
                USUARIO REPORTADO
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
                  <Typography
                    variant="caption"
                    display="block"
                    color="textSecondary"
                  >
                    {report.reported?.number
                      ? formatPhoneInput(report.reported.number)
                      : "—"}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ fontWeight: 600, mt: 0.5 }}
                  >
                    Saldo: {report.reported?.credits ?? "—"} créditos
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
            <Typography
              variant="subtitle2"
              color="textSecondary"
              sx={{ mb: 2 }}
            >
              VIAJE ASOCIADO
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ minWidth: 140 }}
                >
                  Estado:
                </Typography>
                <Chip
                  label={getMatchStatusLabel(travelMatch.status)}
                  color={getMatchStatusColor(travelMatch.status)}
                  size="small"
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ minWidth: 140 }}
                >
                  Origen:
                </Typography>
                <Typography variant="body2">
                  {travelMatch.pickupAddress}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ minWidth: 140 }}
                >
                  Destino:
                </Typography>
                <Typography variant="body2">
                  {travelMatch.destinationAddress}
                </Typography>
              </Stack>
              {travelMatch.distanceKm != null && (
                <Stack direction="row" spacing={1}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ minWidth: 140 }}
                  >
                    Distancia:
                  </Typography>
                  <Typography variant="body2">
                    {travelMatch.distanceKm} km
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={1}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ minWidth: 140 }}
                >
                  Costo del viaje:
                </Typography>
                <Typography variant="body2">
                  {getCharterCreditCost(travelMatch.distanceKm)} créditos
                </Typography>
              </Stack>
              {travelMatch.scheduledDate && (
                <Stack direction="row" spacing={1}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ minWidth: 140 }}
                  >
                    Fecha programada:
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(travelMatch.scheduledDate)}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={1}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ minWidth: 140 }}
                >
                  Creado:
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(travelMatch.createdAt)}
                </Typography>
              </Stack>
              {(travelMatch.status === TravelMatchStatus.COMPLETED ||
                travelMatch.status === TravelMatchStatus.CANCELLED) && (
                <Stack direction="row" spacing={1}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ minWidth: 140 }}
                  >
                    {travelMatch.status === TravelMatchStatus.COMPLETED
                      ? "Completado:"
                      : "Cancelado:"}
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(travelMatch.updatedAt)}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Paper>
        )}

        {/* Conversation Messages */}
        {report.conversation?.messages &&
          report.conversation.messages.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ mb: 2 }}
              >
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
                  const isCharter =
                    msg.sender?.role === ("charter" as UserRole);
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
                            bgcolor: isCharter
                              ? "primary.main"
                              : "secondary.main",
                          }}
                        >
                          {msg.sender?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {msg.sender?.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDateTime(msg.createdAt)}
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
              Creado: {formatDateTime(report.createdAt)}
            </Typography>
            {report.updatedAt !== report.createdAt && (
              <Typography variant="caption">
                Actualizado: {formatDateTime(report.updatedAt)}
              </Typography>
            )}
            {report.resolvedAt && (
              <Typography variant="caption">
                Resuelto: {formatDateTime(report.resolvedAt)}
              </Typography>
            )}

            {/* Show form only for admin and subadmin */}
            {(currentUser?.role === "admin" ||
              currentUser?.role === "subadmin") && (
              <Button variant="contained" onClick={() => setDialogOpen(true)}>
                Editar reporte
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
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ pb: 1 }}>Editar reporte</DialogTitle>
        <DialogContent sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
          <Stack spacing={2.5}>
            {/* Estado */}
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="status-label">Estado</InputLabel>
                  <Select labelId="status-label" label="Estado" {...field}>
                    <MenuItem value="pending">Pendiente</MenuItem>
                    <MenuItem value="investigating">
                      <Box>
                        <Typography variant="body2">Investigando</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Los usuarios verán su reporte como "En revisión"
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="resolved">
                      <Box>
                        <Typography variant="body2">Resuelto</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Se aplicarán las acciones de créditos configuradas
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="dismissed">
                      <Box>
                        <Typography variant="body2">Desestimado</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Se cierra sin acción y se notifica a ambas partes
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {/* Alerta contextual según estado */}
            {watchedStatus === "investigating" && (
              <Alert severity="info" sx={{ py: 0.5 }}>
                Ambas partes recibirán una notificación de que el reporte está
                siendo revisado.
              </Alert>
            )}
            {watchedStatus === "dismissed" && (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                El reporte se cerrará sin acción. Se notificará a reportador y
                reportado.
              </Alert>
            )}

            {/* Acción de créditos: solo al resolver */}
            {creditActionsEnabled && (
              <>
                <Divider textAlign="left">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    ACCIONES DE CRÉDITOS
                  </Typography>
                </Divider>

                {/* Resolución a favor de */}
                <Controller
                  name="resolvedInFavorOf"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel id="favor-label">
                        Resolución a favor de
                      </InputLabel>
                      <Select
                        labelId="favor-label"
                        label="Resolución a favor de"
                        {...field}
                        value={field.value ?? ""}
                      >
                        <MenuItem value="">— Sin especificar —</MenuItem>
                        <MenuItem value="reporter">
                          A favor de {report.reporter?.name ?? "reportador"}{" "}
                          (quien reportó)
                        </MenuItem>
                        <MenuItem value="reported">
                          A favor de {report.reported?.name ?? "reportado"}{" "}
                          (quien fue reportado)
                        </MenuItem>
                        <MenuItem value="company">
                          Sin responsabilidad clara (empresa)
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                {/* Créditos al reportador */}
                <Box>
                  <Controller
                    name="creditsToReporter"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label={`Créditos a devolver a ${report.reporter?.name ?? "reportador"}`}
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        placeholder="0"
                        variant="outlined"
                        fullWidth
                        inputProps={{ min: 0 }}
                        helperText={`Saldo actual: ${report.reporter?.credits ?? 0} créditos`}
                      />
                    )}
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {[1, 2, 3, 5].map((n) => (
                      <Button
                        key={n}
                        size="small"
                        variant="outlined"
                        onClick={() => setValue("creditsToReporter", n)}
                      >
                        +{n}
                      </Button>
                    ))}
                  </Stack>
                </Box>

                {/* Créditos al reportado */}
                <Box>
                  <Controller
                    name="creditsFromReported"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label={`Créditos a descontar a ${report.reported?.name ?? "reportado"}`}
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        placeholder="0"
                        variant="outlined"
                        fullWidth
                        inputProps={{ min: 0, max: reportedCredits }}
                        error={exceedsReportedBalance}
                        helperText={
                          exceedsReportedBalance
                            ? `Solo tiene ${reportedCredits} créditos disponibles`
                            : `Saldo actual: ${reportedCredits} créditos`
                        }
                      />
                    )}
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {[1, 2, 3, 5].map((n) => (
                      <Button
                        key={n}
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={n > reportedCredits}
                        onClick={() => setValue("creditsFromReported", n)}
                      >
                        -{n}
                      </Button>
                    ))}
                  </Stack>
                </Box>

                <Divider textAlign="left">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    SI EL REPORTE FUE FALSO
                  </Typography>
                </Divider>

                {/* Compensar al reportado */}
                <Box>
                  <Controller
                    name="creditsToReported"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label={`Créditos a compensar a ${report.reported?.name ?? "reportado"}`}
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        placeholder="0"
                        variant="outlined"
                        fullWidth
                        inputProps={{ min: 0 }}
                        helperText={`Saldo actual: ${reportedCredits} créditos`}
                      />
                    )}
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {[1, 2, 3, 5].map((n) => (
                      <Button
                        key={n}
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => setValue("creditsToReported", n)}
                      >
                        +{n}
                      </Button>
                    ))}
                  </Stack>
                </Box>

                {/* Sancionar al reportador */}
                <Box>
                  <Controller
                    name="creditsFromReporter"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label={`Créditos a descontar a ${report.reporter?.name ?? "reportador"} por reporte falso`}
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        placeholder="0"
                        variant="outlined"
                        fullWidth
                        inputProps={{ min: 0, max: reporterCredits }}
                        error={exceedsReporterBalance}
                        helperText={
                          exceedsReporterBalance
                            ? `Solo tiene ${reporterCredits} créditos disponibles`
                            : `Saldo actual: ${reporterCredits} créditos`
                        }
                      />
                    )}
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {[1, 2, 3, 5].map((n) => (
                      <Button
                        key={n}
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={n > reporterCredits}
                        onClick={() => setValue("creditsFromReporter", n)}
                      >
                        -{n}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            {/* Notas admin */}
            <Controller
              name="adminNotes"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Notas internas"
                  {...field}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Notas visibles solo para el equipo de administración..."
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={
              updateReportMutation.isPending ||
              exceedsReportedBalance ||
              exceedsReporterBalance
            }
          >
            {updateReportMutation.isPending
              ? "Guardando..."
              : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
