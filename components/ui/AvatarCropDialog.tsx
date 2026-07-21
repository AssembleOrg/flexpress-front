"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

/**
 * Recorta el área seleccionada de una imagen a un cuadrado y devuelve un File jpeg.
 * Patrón canónico de react-easy-crop (canvas.drawImage del recorte en píxeles).
 */
async function getCroppedImg(
  src: string,
  crop: Area,
  fileName: string,
  size = 512,
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9),
  );
  if (!blob) throw new Error("No se pudo generar la imagen");

  const base = fileName.replace(/\.[^.]+$/, "") || "avatar";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

/**
 * Diálogo para encuadrar (arrastrar + zoom) una foto de perfil antes de subirla.
 * Devuelve un File recortado 1:1 vía `onCropped`. El recorte es cuadrado; la máscara
 * es redonda solo para guiar al usuario (el Avatar la muestra circular).
 */
export function AvatarCropDialog({
  open,
  file,
  onCropped,
  onCancel,
}: {
  open: boolean;
  file: File | null;
  onCropped: (croppedFile: File) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  // Object URL de la imagen a recortar (se crea al abrir, se libera al cerrar).
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Sincroniza el object URL con el file entrante.
  if (file && open && imageSrc === null) {
    setImageSrc(URL.createObjectURL(file));
  }

  const reset = useCallback(() => {
    setImageSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels || !file) return;
    setProcessing(true);
    try {
      const cropped = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        file.name,
      );
      reset();
      onCropped(cropped);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Encuadrá tu foto</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 300,
            bgcolor: "#111",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) =>
                setCroppedAreaPixels(areaPixels)
              }
            />
          )}
        </Box>
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Arrastrá para mover y usá el control para acercar.
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.05}
            onChange={(_, v) => setZoom(v as number)}
            aria-label="Zoom"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={processing}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={processing || !croppedAreaPixels}
        >
          {processing ? "Procesando..." : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
