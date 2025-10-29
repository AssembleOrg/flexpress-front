"use client";

import { Box, Container, Typography } from "@mui/material";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export function Footer() {
  return (
    <Box sx={{ bgcolor: "#380116", color: "white", py: 6 }}>
      <Container maxWidth="sm">
        <Box textAlign="center">
          <Logo size={120} variant="white" />
          <Typography sx={{ mb: 2, color: "white", mt: 3 }}>
            Fletes urbanos seguros y confiables
          </Typography>
          <Box display="flex" justifyContent="center" gap={3} mb={2}>
            <Link
              href="/terminos-y-condiciones"
              style={{ textDecoration: "none" }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "#DCA621",
                    textDecoration: "underline",
                  },
                }}
              >
                Términos y Privacidad
              </Typography>
            </Link>
          </Box>
          <Typography variant="caption" sx={{ color: "white" }}>
            © 2025 Flexpress. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
