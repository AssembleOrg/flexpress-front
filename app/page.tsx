"use client";

import {
  CameraAlt,
  CheckCircle,
  Shield,
  Support,
  VerifiedUser,
} from "@mui/icons-material";
import { Box, Button, Chip, Container, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { HeroSplit } from "@/components/sections/HeroSplit";
import { HowItWorks } from "@/components/sections/HowItWorks";
import Logo from "@/components/ui/Logo";

export default function Home() {
  const router = useRouter();

  const handleSolicitarFlete = () => {
    router.push("/login?redirect=/client/dashboard");
  };

  const handleSoyCliente = () => {
    router.push("/login?redirect=/client/dashboard");
  };

  const handleSoyConductor = () => {
    router.push("/login?redirect=/driver/dashboard");
  };

  return (
    <Box>
      {/* Hero Section - Split Layout with Animations */}
      <HeroSplit />

      {/* Sección Para Quién */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          textAlign="center"
          sx={{ fontWeight: 700, mb: 2 }}
        >
          ¿Para quién es Flexpress?
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 600, mx: "auto" }}
        >
          Una plataforma diseñada para dos tipos de usuarios con necesidades
          complementarias
        </Typography>

        <Box
          display="flex"
          gap={4}
          sx={{ flexDirection: { xs: "column", md: "row" } }}
        >
          {/* Cliente Hero Card */}
          <Box
            flex={1}
            onClick={handleSoyCliente}
            sx={{
              position: "relative",
              height: { xs: 300, md: 500 },
              borderRadius: 4,
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.4s ease",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                "& .hero-overlay": {
                  opacity: 0.8,
                },
                "& .hero-content": {
                  transform: "translateY(-10px)",
                },
                "& .hover-cta": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
                "& .default-content": {
                  opacity: 0,
                  transform: "translateY(10px)",
                },
              },
            }}
          >
            {/* Background Image */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: "url('/client.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />

            {/* Overlay */}
            <Box
              className="hero-overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0,0,0,0.4)",
                opacity: 0.6,
                transition: "opacity 0.3s ease",
              }}
            />

            {/* Content */}
            <Box
              className="hero-content"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                p: 4,
                textAlign: "center",
                transition: "transform 0.3s ease",
              }}
            >
              {/* Default Content */}
              <Box
                className="default-content"
                sx={{
                  transition: "all 0.3s ease",
                }}
              >
                {/* <Typography
                  variant='h3'
                  sx={{ fontWeight: 700, mb: 2, color: '#E67E22' }}
                >
                  Clientes
                </Typography> */}
                <Typography variant="h6" sx={{ mb: 3, color: "white" }}>
                  ¿Necesitas transportar objetos por la ciudad?
                </Typography>

                <Box display="flex" flexDirection="column" gap={1} mb={3}>
                  {[
                    "Mudanzas pequeñas y medianas",
                    "Electrodomésticos y muebles",
                    "Productos para tu negocio",
                    "Objetos delicados o urgentes",
                  ]
                    .slice(0, 3)
                    .map((item, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                      >
                        <CheckCircle sx={{ fontSize: 18, color: "#DCA621" }} />
                        <Typography variant="body2" sx={{ color: "white" }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>

              {/* Hover CTA */}
              <Box
                className="hover-cta"
                sx={{
                  position: "absolute",
                  opacity: 0,
                  transform: "translateY(20px)",
                  transition: "all 0.3s ease",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 2, color: "#DCA621" }}
                >
                  Solicitar Flete
                </Typography>
                <Typography variant="h6" sx={{ color: "white" }}>
                  Hacé clic para empezar
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Conductor Hero Card */}
          <Box
            flex={1}
            onClick={handleSoyConductor}
            sx={{
              position: "relative",
              height: { xs: 300, md: 500 },
              borderRadius: 4,
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.4s ease",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                "& .hero-overlay": {
                  opacity: 0.8,
                },
                "& .hero-content": {
                  transform: "translateY(-10px)",
                },
                "& .hover-cta": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
                "& .default-content": {
                  opacity: 0,
                  transform: "translateY(10px)",
                },
              },
            }}
          >
            {/* Background Image */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: "url('/conductor.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />

            {/* Overlay */}
            <Box
              className="hero-overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0,0,0,0.4)",
                opacity: 0.6,
                transition: "opacity 0.3s ease",
              }}
            />

            {/* Content */}
            <Box
              className="hero-content"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                p: 4,
                textAlign: "center",
                transition: "transform 0.3s ease",
              }}
            >
              {/* Default Content */}
              <Box
                className="default-content"
                sx={{
                  transition: "all 0.3s ease",
                }}
              >
                {/* <Typography
                  variant='h3'
                  sx={{ fontWeight: 700, mb: 2, color: '#E67E22' }}
                >
                  Conductores
                </Typography> */}
                <Typography variant="h6" sx={{ mb: 3, color: "white" }}>
                  ¿Tienes vehículo y quieres generar ingresos?
                </Typography>

                <Box display="flex" flexDirection="column" gap={1} mb={3}>
                  {[
                    "Trabajá en tus horarios libres",
                    "Ingresos adicionales garantizados",
                    "Verificación y aprobación requerida",
                    "Sin inversión inicial",
                  ]
                    .slice(0, 3)
                    .map((item, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                      >
                        <CheckCircle sx={{ fontSize: 18, color: "#DCA621" }} />
                        <Typography variant="body2" sx={{ color: "white" }}>
                          {item}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>

              {/* Hover CTA */}
              <Box
                className="hover-cta"
                sx={{
                  position: "absolute",
                  opacity: 0,
                  transform: "translateY(20px)",
                  transition: "all 0.3s ease",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, mb: 2, color: "#DCA621" }}
                >
                  Empezar a Manejar
                </Typography>
                <Typography variant="h6" sx={{ color: "white" }}>
                  Aplica y sé verificado
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Sección de Seguridad - Estilo Legado Vinotinto */}
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
            ].map((item, index) => (
              <Box key={index} flex={1}>
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
              sx={{
                fontWeight: 600,
                px: 4,
                py: 1.5,
              }}
            >
              Conocé más sobre Seguridad
            </Button>
          </Box>
        </Container>
      </Box>

      {/* How it Works - Timeline Zigzag */}
      <HowItWorks />

      {/* Final CTA Section */}
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

      {/* Footer - Minimal */}
      <Box sx={{ bgcolor: "#380116", color: "white", py: 6 }}>
        <Container maxWidth="sm">
          <Box textAlign="center">
            <Logo size={120} />
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
    </Box>
  );
}
