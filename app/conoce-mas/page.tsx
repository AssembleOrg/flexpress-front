"use client";

import { ArrowBack } from "@mui/icons-material";
import { Box, Button, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ConoceMorePage() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      {/* Header */}
      <Box sx={{ py: 4, mb: 4, textAlign: "center" }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Más sobre Seguridad
          </Typography>
          <Typography variant="h6" color="text.secondary">
            En Flexpress, tu seguridad es nuestra prioridad
          </Typography>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            En construcción
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}
          >
            Próximamente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rellenar
          </Typography>
        </Box>

        {/* Back Button */}
        <Button
          variant="contained"
          color="secondary"
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ mt: 4 }}
        >
          Volver
        </Button>
      </Container>
    </Box>
  );
}
