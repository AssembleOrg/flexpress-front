"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export function FinalCTA() {
  const router = useRouter();

  const handleSolicitarFlete = () => {
    router.push("/login?redirect=/client/dashboard");
  };

  const handleSoyConductor = () => {
    router.push("/login?redirect=/driver/dashboard");
  };

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

        <Box display="flex" gap={3} justifyContent="center" flexWrap="wrap">
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleSolicitarFlete}
            sx={{
              fontSize: "1.2rem",
              fontWeight: 600,
              px: 5,
              py: 2.5,
              borderRadius: 2,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
              transition: "all 0.3s ease",
            }}
          >
            Solicitar Flete
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleSoyConductor}
            sx={{
              fontSize: "1.1rem",
              fontWeight: 600,
              px: 4,
              py: 2.5,
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Ser Transportista
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
