import { useState } from "react";
import {
  Card,
  CardContent,
  Stack,
  Avatar,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  DirectionsCar,
} from "@mui/icons-material";
import type { PendingCharterReviewItem, Vehicle } from "@/lib/types/api";
import { DocumentReviewStatus } from "@/lib/types/api";

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: "4px solid",
        borderLeftColor: "#dca621",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1.5}>
          {/* Avatar + Name + Email */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={charter.avatar || undefined}
              sx={{
                width: 48,
                height: 48,
                bgcolor: "secondary.main",
              }}
            >
              {charter.name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight={700} fontSize="0.9rem">
                {charter.name}
              </Typography>
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
            <Stack spacing={1}>
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
                <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
                  DNI ({documentCount} docs)
                </Typography>
                {documentCount === 0 ? (
                  <Alert severity="warning" sx={{ py: 0.5, fontSize: "0.75rem" }}>Sin documentos de identidad</Alert>
                ) : (
                  <Stack direction="row" spacing={1}>
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
                            borderRadius: 4,
                            border: `2px solid ${doc.status === DocumentReviewStatus.APPROVED ? "#2e7d32" : doc.status === DocumentReviewStatus.REJECTED ? "#d32f2f" : "#dca621"}`,
                            cursor: "pointer",
                          }}
                        />
                        <Chip
                          label={doc.side === "front" ? "Frente" : "Dorso"}
                          size="small"
                          sx={{ position: "absolute", bottom: 2, left: 2, fontSize: 9, height: 16 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Vehicles */}
              {(charter.vehicles?.length ?? 0) > 0 ? (
                (charter.vehicles ?? []).map((vehicle, idx) => (
                  <Box key={vehicle.id}>
                    <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5} flexWrap="wrap">
                      <DirectionsCar sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="caption" fontWeight={600} color="text.secondary">
                        Vehículo {idx + 1}: {vehicle.plate}
                        {vehicle.alias ? ` (${vehicle.alias})` : ""}
                      </Typography>
                      <Chip
                        label={
                          vehicle.verificationStatus === "verified"
                            ? "Aprobado"
                            : vehicle.verificationStatus === "rejected"
                            ? "Rechazado"
                            : "Pendiente"
                        }
                        size="small"
                        color={vehicle.verificationStatus === "verified" ? "success" : vehicle.verificationStatus === "rejected" ? "error" : "warning"}
                        sx={{ height: 16, fontSize: 9 }}
                      />
                    </Stack>
                    {vehicle.verificationStatus !== "verified" && (
                      <Stack direction="row" spacing={0.5} mb={0.5}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          sx={{ fontSize: 11, py: 0, px: 1, minWidth: 0 }}
                          onClick={() => onApproveVehicle(vehicle)}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          sx={{ fontSize: 11, py: 0, px: 1, minWidth: 0 }}
                          onClick={() => onRejectVehicle(vehicle)}
                        >
                          Rechazar
                        </Button>
                      </Stack>
                    )}
                    {(vehicle.documents?.length ?? 0) === 0 ? (
                      <Alert severity="warning" sx={{ py: 0.5, fontSize: "0.75rem" }}>Sin documentos del vehículo</Alert>
                    ) : (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {(vehicle.documents ?? []).map((doc) => (
                          <Box
                            key={doc.id}
                            component="a"
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textDecoration: "none" }}
                          >
                            <img
                              src={doc.fileUrl}
                              alt={doc.type}
                              style={{
                                width: 70,
                                height: 52,
                                objectFit: "cover",
                                borderRadius: 4,
                                border: `2px solid ${doc.status === DocumentReviewStatus.APPROVED ? "#2e7d32" : doc.status === DocumentReviewStatus.REJECTED ? "#d32f2f" : "#dca621"}`,
                                cursor: "pointer",
                              }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>
                ))
              ) : (
                <Alert severity="warning" sx={{ py: 0.5, fontSize: "0.75rem" }}>Sin vehículos registrados</Alert>
              )}
            </Stack>
          )}

          {/* Toggle button */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowDetails(!showDetails)}
            startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            {showDetails ? "Ocultar" : "Ver"} documentos ({documentCount} DNI · {charter.vehicles?.length ?? 0} vehículo(s))
          </Button>

          {/* Action buttons — Charter */}
          <Box display="flex" gap={1} mt={1}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              sx={{
                flex: 1,
                fontSize: "0.75rem",
                fontWeight: 700,
                minHeight: 40,
              }}
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
                bgcolor: "#dca621",
                "&:hover": { bgcolor: "#b7850d" },
              }}
              onClick={() => onApprove(charter)}
            >
              Aprobar
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
