"use client";

import {
  CheckCircleOutline as OkIcon,
  DirectionsCar as CharterIcon,
  ErrorOutline as ErrorIcon,
  PauseCircleOutline as NeutralIcon,
  People as ClientIcon,
  RadioButtonChecked as OnlineIcon,
  Whatshot as ActiveIcon,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import type { ReactNode } from "react";
import { useState } from "react";
import type { AuditFeedItem } from "@/lib/api/admin";
import {
  useAuditFeed,
  useAuditFeedInfinite,
  useAuditStats,
} from "@/lib/hooks/queries/useAdminQueries";
import { formatDate } from "@/lib/utils/formatDate";

// Features conocidas (para el filtro). Debe coincidir con las etiquetas del backend.
const FEATURES = [
  "Abrió búsqueda de viaje",
  "Canceló la búsqueda",
  "Rechazó el pedido",
  "Confirmó el match (creó viaje)",
  "Charter finalizó el viaje",
  "Cliente confirmó el viaje",
  "Cambió su disponibilidad",
  "Disponibilidad apagada por inactividad",
  "Pidió cargar crédito",
  "Crédito aprobado",
  "Crédito rechazado",
  "Generó una denuncia",
];

const TONES = {
  ok: { bg: "#2ECC71", color: "white", Icon: OkIcon },
  bad: { bg: "#E74C3C", color: "white", Icon: ErrorIcon },
  warn: { bg: "#DCA621", color: "#212121", Icon: NeutralIcon },
  neutral: { bg: "#EEE", color: "#757575", Icon: NeutralIcon },
};

// Códigos que emite el backend (ActivityLogService.logFeature) → etiqueta ES.
const STATUS: Record<string, { label: string; tone: keyof typeof TONES }> = {
  pending: { label: "Pendiente", tone: "warn" },
  searching: { label: "Buscando", tone: "warn" },
  accepted: { label: "Aprobado", tone: "ok" },
  ok: { label: "Confirmado", tone: "ok" },
  available: { label: "Disponible", tone: "ok" },
  charter_completed: { label: "Finalizado por charter", tone: "ok" },
  completed: { label: "Completado", tone: "ok" },
  rejected: { label: "Rechazado", tone: "bad" },
  unavailable: { label: "No disponible", tone: "neutral" },
  cancelled: { label: "Cancelado", tone: "neutral" },
};

function statusStyle(status: string | null) {
  if (!status) return { ...TONES.neutral, label: "—" };
  // Código nuevo no mapeado: se muestra crudo en vez de romper.
  const s = STATUS[status] ?? { label: status, tone: "warn" };
  return { ...TONES[s.tone], label: s.label };
}

const ROLE_LABEL: Record<NonNullable<AuditFeedItem["userRole"]>, string> = {
  charter: "Charter",
  user: "Cliente",
  admin: "Admin",
  subadmin: "Subadmin",
};

function RoleTag({ role }: { role: AuditFeedItem["userRole"] }) {
  if (!role) return null;
  return (
    <Box
      component="span"
      sx={{
        px: 0.75,
        py: 0.1,
        borderRadius: "6px",
        fontSize: "0.65rem",
        fontWeight: 700,
        flexShrink: 0,
        color: role === "charter" ? "#8A6510" : "#380116",
        bgcolor: alpha(role === "charter" ? "#DCA621" : "#380116", 0.1),
      }}
    >
      {ROLE_LABEL[role]}
    </Box>
  );
}

function StatusChip({ status }: { status: string | null }) {
  const s = statusStyle(status);
  return (
    <Chip
      icon={<s.Icon sx={{ fontSize: 15, color: `${s.color} !important` }} />}
      label={s.label}
      size="small"
      sx={{
        backgroundColor: s.bg,
        color: s.color,
        fontWeight: 600,
        fontSize: "0.72rem",
        height: 24,
      }}
    />
  );
}

// Color estable derivado del nombre, dentro de la paleta del brand.
const AVATAR_COLORS = ["#380116", "#4b011d", "#DCA621", "#3498DB", "#2ECC71"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function UserAvatar({ name }: { name: string }) {
  const bg = avatarColor(name);
  const deleted = name === "Usuario eliminado";
  return (
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        bgcolor: deleted ? "#BDBDBD" : bg,
        color: "#fff",
        fontSize: "0.78rem",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {deleted ? "?" : (name[0]?.toUpperCase() ?? "?")}
    </Box>
  );
}

// ── Tarjeta de métrica (CRM-like: icono + número + label, color por tipo) ──
interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <Box
      sx={{
        flex: "1 1 140px",
        minWidth: 140,
        p: 2,
        borderRadius: "18px",
        bgcolor: alpha(accent, 0.06),
        border: `1px solid ${alpha(accent, 0.12)}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "11px",
            bgcolor: accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 3px 8px ${alpha(accent, 0.35)}`,
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.9rem",
            fontWeight: 700,
            color: "#380116",
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: "0.8rem", fontWeight: 500 }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ── Card de evento para mobile (patrón MobileUserCard) ──
function MobileAuditCard({ item }: { item: AuditFeedItem }) {
  const accent = statusStyle(item.status).bg;
  return (
    <Box
      sx={{
        mb: 1.5,
        borderRadius: "16px",
        bgcolor: "background.paper",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        overflow: "hidden",
        display: "flex",
      }}
    >
      {/* Acento de color por estado */}
      <Box sx={{ width: 4, bgcolor: accent, flexShrink: 0 }} />
      <Box sx={{ p: 1.75, flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={0.75}
          gap={1}
        >
          <Typography
            fontWeight={700}
            fontSize="0.9rem"
            noWrap
            sx={{ flex: 1, color: "#380116" }}
          >
            {item.feature ?? "—"}
          </Typography>
          <StatusChip status={item.status} />
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
        >
          <Stack direction="row" alignItems="center" gap={1} minWidth={0}>
            <UserAvatar name={item.userName} />
            <Typography
              variant="body2"
              fontWeight={600}
              fontSize="0.8rem"
              noWrap
            >
              {item.userName}
            </Typography>
            <RoleTag role={item.userRole} />
          </Stack>
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ flexShrink: 0, fontSize: "0.68rem" }}
          >
            {formatDate(item.createdAt)}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export function AuditTab() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [feature, setFeature] = useState<string>("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 100,
    page: 0,
  });
  const { data: stats } = useAuditStats();
  const desktop = useAuditFeed(
    {
      feature: feature || undefined,
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
    },
    !isMobile,
  );
  // Mobile: "cargar más" acumulativo, paginando de verdad (el backend topea limit en 100).
  const mobile = useAuditFeedInfinite(feature || undefined, isMobile);

  const active = isMobile ? mobile : desktop;
  const { isLoading, isError, refetch } = active;
  const items = isMobile
    ? (mobile.data?.pages.flatMap((p) => p.items) ?? [])
    : (desktop.data?.items ?? []);
  const total = isMobile
    ? (mobile.data?.pages[0]?.total ?? 0)
    : (desktop.data?.total ?? 0);

  const columns: GridColDef<AuditFeedItem>[] = [
    {
      field: "createdAt",
      headerName: "Fecha",
      width: 170,
      renderCell: (params) => formatDate(params.row.createdAt),
    },
    {
      field: "userName",
      headerName: "Usuario",
      flex: 1,
      minWidth: 170,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" gap={1} sx={{ height: "100%" }}>
          <UserAvatar name={params.row.userName} />
          <Typography variant="body2" fontWeight={600} noWrap>
            {params.row.userName}
          </Typography>
          <RoleTag role={params.row.userRole} />
        </Stack>
      ),
    },
    {
      field: "feature",
      headerName: "Feature",
      flex: 1.4,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "#380116", fontWeight: 500 }}>
          {params.row.feature ?? "—"}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Estado",
      width: 170,
      sortable: false,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
  ];

  const onFeatureChange = (v: string) => {
    setFeature(v);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <Box>
      {/* Conteos */}
      <Stack
        direction="row"
        sx={{ mb: 3, flexWrap: "wrap", gap: 1.5 }}
      >
        <StatCard
          label="Disponibles ahora"
          value={stats?.chartersAvailableNow ?? 0}
          icon={<OnlineIcon sx={{ fontSize: 18 }} />}
          accent="#2ECC71"
        />
        <StatCard
          label="Charters"
          value={stats?.totalCharters ?? 0}
          icon={<CharterIcon sx={{ fontSize: 18 }} />}
          accent="#DCA621"
        />
        <StatCard
          label="Clientes"
          value={stats?.totalClients ?? 0}
          icon={<ClientIcon sx={{ fontSize: 18 }} />}
          accent="#380116"
        />
        <StatCard
          label="Activos (24h)"
          value={stats?.activeLast24h ?? 0}
          icon={<ActiveIcon sx={{ fontSize: 18 }} />}
          accent="#3498DB"
        />
      </Stack>

      {/* Filtro */}
      <FormControl size="small" sx={{ minWidth: 220, mb: 2, width: { xs: "100%", sm: 260 } }}>
        <InputLabel>Filtrar por acción</InputLabel>
        <Select
          value={feature}
          label="Filtrar por acción"
          onChange={(e) => onFeatureChange(e.target.value)}
        >
          <MenuItem value="">Todas las acciones</MenuItem>
          {FEATURES.map((f) => (
            <MenuItem key={f} value={f}>
              {f}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Retención: el cron del backend borra eventos con más de 45 días. */}
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ display: "block", mt: -1, mb: 2 }}
      >
        Mostrando los últimos 45 días
      </Typography>

      {/* Feed */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#380116" }} />
        </Box>
      ) : isError ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            px: 2,
            borderRadius: "16px",
            bgcolor: alpha("#E74C3C", 0.05),
          }}
        >
          <Typography color="text.secondary" fontWeight={600}>
            No se pudo cargar la auditoría
          </Typography>
          <Button
            onClick={() => refetch()}
            sx={{ mt: 1, color: "#380116", fontWeight: 600, textTransform: "none" }}
          >
            Reintentar
          </Button>
        </Box>
      ) : items.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            px: 2,
            borderRadius: "16px",
            bgcolor: alpha("#380116", 0.03),
          }}
        >
          <Typography color="text.secondary" fontWeight={600}>
            {feature ? "Sin eventos para esta acción" : "Sin actividad todavía"}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            {feature
              ? "Probá con otra acción o quitá el filtro."
              : "Los eventos aparecerán acá a medida que los usuarios operen."}
          </Typography>
        </Box>
      ) : isMobile ? (
        <>
          {items.map((item) => (
            <MobileAuditCard key={item.id} item={item} />
          ))}
          {mobile.hasNextPage && (
            <Button
              fullWidth
              variant="outlined"
              disabled={mobile.isFetchingNextPage}
              onClick={() => mobile.fetchNextPage()}
              sx={{
                mt: 1,
                py: 1.25,
                borderRadius: "14px",
                borderColor: alpha("#380116", 0.3),
                color: "#380116",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#380116",
                  bgcolor: alpha("#380116", 0.04),
                },
              }}
            >
              Cargar más ({items.length} de {total})
            </Button>
          )}
        </>
      ) : (
        <DataGrid
          autoHeight
          rows={items}
          columns={columns}
          rowCount={total}
          loading={desktop.isFetching}
          paginationMode="server"
          pageSizeOptions={[20, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowHeight={58}
          columnHeaderHeight={48}
          disableRowSelectionOnClick
          disableColumnMenu
          sx={{
            border: "none",
            borderRadius: "18px",
            bgcolor: "background.paper",
            boxShadow: "0 2px 16px rgba(56,1,22,0.06)",
            "--DataGrid-rowBorderColor": alpha("#380116", 0.06),
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: alpha("#380116", 0.04),
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 700,
              color: "#380116",
              fontSize: "0.8rem",
              letterSpacing: "0.02em",
            },
            "& .MuiDataGrid-cell": {
              alignItems: "center",
              borderColor: alpha("#380116", 0.06),
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: alpha("#380116", 0.03),
            },
            "& .MuiDataGrid-footerContainer": {
              borderTopColor: alpha("#380116", 0.08),
            },
          }}
        />
      )}
    </Box>
  );
}
