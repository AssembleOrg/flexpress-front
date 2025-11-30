import { useState } from "react";
import {
  Card,
  CardContent,
  Stack,
  Avatar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import type { User } from "@/lib/types/api";

interface MobileCharterVerificationCardProps {
  charter: User;
  onApprove: (charter: User) => void;
  onReject: (charter: User) => void;
}

export function MobileCharterVerificationCard({
  charter,
  onApprove,
  onReject,
}: MobileCharterVerificationCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [dniImagesLoaded, setDniImagesLoaded] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const documentCount = [charter.documentationFrontUrl, charter.documentationBackUrl].filter(
    Boolean
  ).length;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
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

            {/* Expanded details (phone, address) */}
            {showDetails && (
              <Stack spacing={0.5}>
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
              </Stack>
            )}

            {/* Toggle button for documents */}
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
              {showDetails ? "Ocultar" : "Ver"} Adjuntados ({documentCount})
            </Button>

            {/* DNI Images - Lazy loaded */}
            {showDetails && (
              <>
                {!dniImagesLoaded ? (
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setDniImagesLoaded(true)}
                    sx={{ fontSize: "0.75rem", textTransform: "none" }}
                  >
                    Cargar Imágenes DNI
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    {charter.documentationFrontUrl && (
                      <Box
                        sx={{
                          flex: 1,
                          cursor: "pointer",
                          position: "relative",
                          "&:hover": { opacity: 0.8 },
                        }}
                        onClick={() => setImageModalOpen(true)}
                      >
                        <Typography variant="caption" display="block" fontSize="0.7rem" mb={0.5}>
                          Frente
                        </Typography>
                        <img
                          src={charter.documentationFrontUrl}
                          alt="DNI Frente"
                          style={{
                            width: "100%",
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 4,
                            border: "1px solid #ddd",
                          }}
                        />
                      </Box>
                    )}
                    {charter.documentationBackUrl && (
                      <Box
                        sx={{
                          flex: 1,
                          cursor: "pointer",
                          position: "relative",
                          "&:hover": { opacity: 0.8 },
                        }}
                        onClick={() => setImageModalOpen(true)}
                      >
                        <Typography variant="caption" display="block" fontSize="0.7rem" mb={0.5}>
                          Dorso
                        </Typography>
                        <img
                          src={charter.documentationBackUrl}
                          alt="DNI Dorso"
                          style={{
                            width: "100%",
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 4,
                            border: "1px solid #ddd",
                          }}
                        />
                      </Box>
                    )}
                  </Stack>
                )}
              </>
            )}

            {/* Action buttons */}
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

      {/* DNI Images Modal */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Documentación DNI - {charter.name}
          <IconButton
            onClick={() => setImageModalOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {charter.documentationFrontUrl && (
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">Frente</Typography>
                  <IconButton
                    size="small"
                    onClick={() => window.open(charter.documentationFrontUrl!, "_blank")}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <img
                  src={charter.documentationFrontUrl}
                  alt="DNI Frente"
                  style={{
                    width: "100%",
                    maxHeight: 400,
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                  }}
                />
              </Box>
            )}
            {charter.documentationBackUrl && (
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">Dorso</Typography>
                  <IconButton
                    size="small"
                    onClick={() => window.open(charter.documentationBackUrl!, "_blank")}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <img
                  src={charter.documentationBackUrl}
                  alt="DNI Dorso"
                  style={{
                    width: "100%",
                    maxHeight: 400,
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: 4,
                  }}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
