"use client";

import { WhatsApp } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { SUPPORT_WHATSAPP } from "@/lib/constants/bankAccounts";

/**
 * Bloque compacto de contacto de soporte por WhatsApp. Se muestra en las
 * pantallas de estado de verificación (cliente y charter) y en el reenvío de
 * documentación. El número sale de SUPPORT_WHATSAPP (constants).
 */
export function SupportContact({
  message = "Hola, necesito ayuda con la verificación de mi cuenta en Flexpress.",
  sx,
}: {
  message?: string;
  sx?: object;
}) {
  const openWhatsApp = () => {
    const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ textAlign: "center", mt: 3, ...sx }}>
      <Typography variant="body2" color="text.secondary" mb={1.5}>
        ¿Tuviste algún inconveniente? Comunicate con nosotros.
      </Typography>
      <Button
        variant="contained"
        startIcon={<WhatsApp />}
        onClick={openWhatsApp}
        sx={{
          fontWeight: 700,
          borderRadius: 8,
          textTransform: "none",
          bgcolor: "#25D366",
          color: "#fff",
          "&:hover": { bgcolor: "#1EBE5A" },
        }}
      >
        Escribinos por WhatsApp
      </Button>
    </Box>
  );
}
