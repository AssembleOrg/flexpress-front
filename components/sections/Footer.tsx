"use client";

import { Box, Container, Typography } from "@mui/material";
import Logo from "@/components/ui/Logo";

export function Footer() {
  return (
    <Box sx={{ bgcolor: "#380116", color: "white", py: 6 }}>
      <Container maxWidth="sm">
        <Box textAlign="center">
          <Logo size={120} withCircle={true} />
          <Typography variant="body2" sx={{ mb: 2, color: "white", mt: 3 }}>
            Fletes urbanos seguros y confiables
          </Typography>
          <Box display="flex" justifyContent="center" gap={3} mb={2}>
            <Typography variant="caption" sx={{ color: "white" }}>
              Términos
            </Typography>
            <Typography variant="caption" sx={{ color: "white" }}>
              Privacidad
            </Typography>
            <Typography variant="caption" sx={{ color: "white" }}>
              Soporte
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: "white" }}>
            © 2025 Flexpress. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
