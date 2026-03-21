import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import {
  DirectionsCar,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import type { PendingCharterReviewItem, Vehicle } from "@/lib/types/api";
import { DocumentReviewStatus, VerificationStatus } from "@/lib/types/api";

const DOC_TYPE_LABEL: Record<string, string> = {
  foto: "Foto",
  cedula: "Cédula",
  seguro: "Seguro",
  vtv: "VTV",
  front: "Frente",
  back: "Dorso",
};

function docBorderColor(status: DocumentReviewStatus) {
  if (status === DocumentReviewStatus.APPROVED) return "#2e7d32";
  if (status === DocumentReviewStatus.REJECTED) return "#d32f2f";
  return "#dca621";
}

interface MobileCharterVerificationCardProps {
  charter: PendingCharterReviewItem;
  onApprove: (charter: PendingCharterReviewItem) => void;
  onReject: (charter: PendingCharterReviewItem) => void;
  onApproveVehicle: (vehicle: Vehicle) => void;
  onRejectVehicle: (vehicle: Vehicle) => void;
}

export function MobileCharterVerificationCard({
  charter,
  onApprove,
  onReject,
  onApproveVehicle,
  onRejectVehicle,
}: MobileCharterVerificationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const documentCount = charter.userDocuments?.length ?? 0;
  const vehicleCount = charter.vehicles?.length ?? 0;
  const pendingVehicles = (charter.vehicles ?? []).filter(
    (v) => v.verificationStatus !== VerificationStatus.VERIFIED,
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: "4px solid",
        borderLeftColor: "#dca621",
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1.5}>
          {/* Avatar + Name + Email */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={charter.avatar || undefined}
              sx={{ width: 48, height: 48, bgcolor: "secondary.main" }}
            >
              {charter.name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="subtitle2" fontWeight={700} fontSize="0.9rem">
                  {charter.name}
                </Typography>
                {pendingVehicles.length > 0 && (
                  <Chip
                    label={`${pendingVehicles.length} veh. pendiente${pendingVehicles.length > 1 ? "s" : ""}`}
                    size="small"
                    color="warning"
                    sx={{ height: 18, fontSize: "0.65rem" }}
                  />
                )}
              </Stack>
              <Typography variant="body2" fontSize="0.85rem" color="text.secondary">
                {charter.email}
              </Typography>
            </Box>
          </Stack>

          {/* Registration date */}
          <Typography variant="caption" fontSize="0.75rem" color="text.secondary">
            Reg: {formatDate(charter.createdAt)}
          </Typography>

          {/* Expanded details */}
          {showDetails && (
            <Stack spacing={1.5}>
              {charter.number && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="body2" fontSize="0.85rem" color="text.secondary">
                    {charter.number}
                  </Typography>
                </Stack>
              )}
              {charter.originAddress && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="body2" fontSize="0.85rem" color="text.secondary">
                    {charter.originAddress}
                  </Typography>
                </Stack>
              )}

              {/* DNI docs */}
              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.75}>
                  DNI ({documentCount} docs)
                </Typography>
                {documentCount === 0 ? (
                  <Alert severity="warning" sx={{ py: 0.5, fontSize: "0.75rem" }}>
                    Sin documentos de identidad
                  </Alert>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {(charter.userDocuments ?? []).map((doc) => (
                      <Box
                        key={doc.id}
                        component="a"
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ position: "relative", textDecoration: "none" }}
                      >
                        <img
                          src={doc.fileUrl}
                          alt={`DNI ${doc.side ?? ""}`}
                          style={{
                            width: 90,
                            height: 65,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: `2px solid ${docBorderColor(doc.status)}`,
                            cursor: "pointer",
                            display: "block",
                          }}
                        />
                        <Chip
                          label={DOC_TYPE_LABEL[doc.side ?? ""] ?? doc.side}
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 4,
                            left: 4,
                            height: 16,
                            fontSize: "0.6rem",
                            bgcolor: "rgba(0,0,0,0.55)",
                            color: "#fff",
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Vehicles */}
              {vehicleCount > 0 ? (
                (charter.vehicles ?? []).map((vehicle, idx) => (
                  <Box key={vehicle.id}>
                    <Stack direction="row" spacing={0.5} alignItems="center" mb={0.75} flexWrap="wrap">
                      <DirectionsCar sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="caption" fontWeight={600} color="text.secondary">
                        Vehículo {idx + 1}: {vehicle.plate}
                        {vehicle.brand ? ` — ${vehicle.brand}` : ""}
                        {vehicle.alias ? ` (${vehicle.alias})` : ""}
                      </Typography>
                      <Chip
                        label={
                          vehicle.verificationStatus === VerificationStatus.VERIFIED
                            ? "Aprobado"
                            : vehicle.verificationStatus === VerificationStatus.REJECTED
                            ? "Rechazado"
                            : "Pendiente"
                        }
                        size="small"
                        color={
                          vehicle.verificationStatus === VerificationStatus.VERIFIED
                            ? "success"
                            : vehicle.verificationStatus === VerificationStatus.REJECTED
                            ? "error"
                            : "warning"
                        }
                        sx={{ height: 16, fontSize: "0.6rem" }}
                      />
                    </Stack>

                    {vehicle.verificationStatus !== VerificationStatus.VERIFIED && (
                      <Stack direction="row" spacing={0.5} mb={0.75}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          sx={{ fontSize: "0.75rem", py: 0.5, px: 1.5, bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
                          onClick={() => onApproveVehicle(vehicle)}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          sx={{ fontSize: "0.75rem", py: 0.5, px: 1.5 }}
                          onClick={() => onRejectVehicle(vehicle)}
                        >
                          Rechazar
                        </Button>
                      </Stack>
                    )}

                    {(vehicle.documents?.length ?? 0) === 0 ? (
                      <Alert severity="warning" sx={{ py: 0.5, fontSize: "0.75rem" }}>
                        Sin documentos del vehículo
                      </Alert>
                    ) : (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {(vehicle.documents ?? []).map((doc) => (
                          <Box
                            key={doc.id}
                            component="a"
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ position: "relative", textDecoration: "none" }}
                          >
                            <img
                              src={doc.fileUrl}
                              alt={doc.type}
                              style={{
                                width: 70,
                                height: 52,
                                objectFit: "cover",
                                borderRadius: 4,
                                border: `2px solid ${docBorderColor(doc.status)}`,
                                cursor: "pointer",
                                display: "block",
                              }}
                            />
                            <Chip
                              label={DOC_TYPE_LABEL[doc.type] ?? doc.type}
                              size="small"
                              sx={{
                                position: "absolute",
                                bottom: 2,
                                left: 2,
                                height: 14,
                                fontSize: "0.55rem",
                                bgcolor: "rgba(0,0,0,0.55)",
                                color: "#fff",
                              }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>
                ))
              ) : (
                <Alert severity="warning" sx={{ py: 0.5, fontSize: "0.75rem" }}>
                  Sin vehículos registrados
                </Alert>
              )}
            </Stack>
          )}

          {/* Toggle details */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowDetails(!showDetails)}
            startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "none" }}
          >
            {showDetails ? "Ocultar" : "Ver"} documentos ({documentCount} DNI · {vehicleCount} vehículo{vehicleCount !== 1 ? "s" : ""})
          </Button>

          {/* Charter action buttons */}
          <Box display="flex" gap={1} mt={0.5}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              sx={{ flex: 1, fontSize: "0.75rem", fontWeight: 700, minHeight: 40 }}
              onClick={() => onReject(charter)}
            >
              Rechazar
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{
                flex: 1,
                fontSize: "0.75rem",
                fontWeight: 700,
                minHeight: 40,
                bgcolor: "#2e7d32",
                "&:hover": { bgcolor: "#1b5e20" },
              }}
              onClick={() => onApprove(charter)}
            >
              Aprobar ✓
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
