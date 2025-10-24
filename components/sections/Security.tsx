"use client";

import { CameraAlt, Shield, Support, VerifiedUser } from "@mui/icons-material";
import { Box, Button, Chip, Container, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export function Security() {
  const router = useRouter();

  const handleKnowMore = () => {
    router.push("/conoce-mas");
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #380116 0%, #4b011d 100%)",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Shield sx={{ fontSize: 60, color: "white", mb: 2 }} />
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2, color: "white" }}
          >
            En Flexpress, tu seguridad es{" "}
            <Box component="span" sx={{ color: "#DCA621" }}>
              nuestra prioridad
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              maxWidth: 700,
              mx: "auto",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Protección integral antes, durante y después de cada flete
          </Typography>
        </Box>

        <Box
          display="flex"
          gap={4}
          sx={{ flexDirection: { xs: "column", md: "row" } }}
        >
          {[
            {
              icon: <VerifiedUser sx={{ fontSize: 40 }} />,
              title: "Conductores Verificados",
              description:
                "Verificación de identidad, licencia de conducir y antecedentes penales",
              chip: "100% Verificados",
            },
            {
              icon: <CameraAlt sx={{ fontSize: 40 }} />,
              title: "Seguimiento en Vivo",
              description:
                "Monitoreá tu flete en tiempo real desde pickup hasta delivery",
              chip: "GPS en Vivo",
            },
            {
              icon: <Support sx={{ fontSize: 40 }} />,
              title: "Soporte 24/7",
              description:
                "Línea directa de emergencia y equipo de soporte disponible siempre",
              chip: "Siempre Disponible",
            },
          ].map((item) => (
            <Box key={item.title} flex={1}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  textAlign: "center",
                  height: "100%",
                  position: "relative",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Chip
                  label={item.chip}
                  color="primary"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    fontWeight: 600,
                  }}
                />

                <Box sx={{ color: "primary.main", mb: 2 }}>{item.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>

        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleKnowMore}
            sx={{
              fontWeight: 600,
              px: 4,
              py: 1.5,
            }}
          >
            Conocer Más
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
