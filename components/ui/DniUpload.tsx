"use client";

import { useState } from "react";
import { Box, Typography, Stack, Alert, Card } from "@mui/material";
import { CameraAlt, CheckCircle } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

interface DniUploadProps {
  onFilesSelected: (front: File | null, back: File | null) => void;
  error?: string;
}

export function DniUpload({ onFilesSelected, error }: DniUploadProps) {
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      alert("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }

    // Validar tamaño
    if (file.size > 4 * 1024 * 1024) {
      alert("La imagen no debe superar los 4MB");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === "front") {
        setFrontImage(file);
        setFrontPreview(reader.result as string);
        onFilesSelected(file, backImage);
      } else {
        setBackImage(file);
        setBackPreview(reader.result as string);
        onFilesSelected(frontImage, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderUploadCard = (
    side: "front" | "back",
    preview: string | null,
    hasImage: boolean,
    label: string
  ) => {
    return (
      <Box sx={{ flex: 1 }}>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileChange(e, side)}
          style={{ display: "none" }}
          id={`dni-${side}-input`}
        />
        <label htmlFor={`dni-${side}-input`} style={{ cursor: "pointer" }}>
          <motion.div
            whileHover={{
              scale: 1.02,
              boxShadow: "0 8px 24px rgba(220, 166, 33, 0.15)",
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Card
              sx={{
                border: "2px solid",
                borderColor: hasImage ? "success.main" : "divider",
                borderStyle: hasImage ? "solid" : "dashed",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  borderColor: hasImage ? "success.main" : "secondary.main",
                  borderStyle: "solid",
                  bgcolor: hasImage ? "transparent" : "rgba(220, 166, 33, 0.02)",
                },
              }}
            >
              {preview ? (
                <Box sx={{ position: "relative" }}>
                  <img
                    src={preview}
                    alt={`DNI ${label}`}
                    style={{
                      width: "100%",
                      height: 200,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                  {/* Overlay en hover */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                      "&:hover": {
                        opacity: 1,
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ color: "white", fontWeight: 600 }}
                    >
                      Toca para cambiar
                    </Typography>
                  </Box>
                  {/* Check badge animado */}
                  <AnimatePresence>
                    <motion.div
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{
                        duration: 0.4,
                        ease: "backOut",
                      }}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                    >
                      <CheckCircle sx={{ color: "success.main", fontSize: 32 }} />
                    </motion.div>
                  </AnimatePresence>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    bgcolor: "background.default",
                    minHeight: 200,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CameraAlt
                    sx={{
                      fontSize: 60,
                      color: "primary.main",
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "primary.main", mb: 0.5 }}
                  >
                    Toca aquí para subir
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                </Box>
              )}
            </Card>
          </motion.div>
        </label>
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ mb: 2, fontWeight: 600 }}
      >
        Documentación de Identidad (DNI) *
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {renderUploadCard("front", frontPreview, !!frontImage, "Frente del DNI")}
        {renderUploadCard("back", backPreview, !!backImage, "Dorso del DNI")}
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: "block" }}
      >
        Formatos: JPG, PNG, WEBP | Tamaño máximo: 4MB por imagen
      </Typography>
      <Typography
        variant="caption"
        color="primary.main"
        sx={{ mt: 0.5, display: "block", fontWeight: 500 }}
      >
        Las imágenes se subirán cuando completes el registro
      </Typography>
    </Box>
  );
}
