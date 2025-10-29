"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import Link from "next/link";

export function FinalCTA() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center">
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
          ¿Listo para transportar tu carga?
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 5, maxWidth: 600, mx: "auto" }}
        >
          Únete a la red de transporte de carga más confiable de Buenos Aires.
          Registrarse es completamente gratuito.
        </Typography>

        <Link href="/register" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              fontSize: "1.3rem",
              fontWeight: 700,
              px: 6,
              py: 2.5,
              borderRadius: 2,
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 6,
              },
              transition: "all 0.3s ease",
            }}
          >
            Registrarse
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
