"use client";

import { CheckCircle } from "@mui/icons-material";
import { Box, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export function ForWho() {
  const router = useRouter();

  const handleSoyCliente = () => {
    router.push("/login?redirect=/client/dashboard");
  };

  const handleSoyConductor = () => {
    router.push("/login?redirect=/driver/dashboard");
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Typography
        variant="h3"
        textAlign="center"
        sx={{
          fontWeight: 700,
          mb: 2,
          fontSize: { xs: "1.8rem", md: "2.5rem" },
        }}
      >
        ¿Por qué Flexpress?
      </Typography>
      <Typography
        variant="h6"
        textAlign="center"
        color="text.secondary"
        sx={{
          mb: 6,
          maxWidth: 600,
          mx: "auto",
          fontSize: { xs: "0.95rem", md: "1.1rem" },
        }}
      >
        Una plataforma diseñada para vos
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr" },
          gap: { xs: 1.5, md: 4 },
        }}
      >
        {/* Cliente Hero Card */}
        <Box
          onClick={handleSoyCliente}
          sx={{
            position: "relative",
            height: { xs: "40vh", md: 500 },
            borderRadius: 4,
            overflow: "hidden",
            cursor: "pointer",
            transition: "all 0.4s ease",
            "&:hover": {
              transform: { xs: "none", md: "scale(1.02)" },
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              "& .hero-overlay": {
                opacity: 0.8,
              },
              "& .hero-content": {
                transform: { xs: "none", md: "translateY(-10px)" },
              },
              "& .hover-cta": {
                opacity: { xs: 1, md: 1 },
                transform: { xs: "translateY(0)", md: "translateY(0)" },
              },
              "& .default-content": {
                opacity: { xs: 1, md: 0 },
                transform: { xs: "translateY(0)", md: "translateY(10px)" },
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
              opacity: { xs: 0.7, md: 0.6 },
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
              p: { xs: 2, md: 4 },
              textAlign: "center",
              transition: "transform 0.3s ease",
            }}
          >
            {/* Default Content */}
            <Box
              className="default-content"
              sx={{
                transition: "all 0.3s ease",
                opacity: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: "white",
                  fontSize: { xs: "0.85rem", md: "1.25rem" },
                  fontWeight: 600,
                }}
              >
                ¿Necesitas transportar objetos por la ciudad?
              </Typography>

              <Box display="flex" flexDirection="column" gap={1} mb={2}>
                {[
                  "Mudanzas pequeñas y medianas",
                  "Electrodomésticos y muebles",
                  "Productos para tu negocio",
                ]
                  .slice(0, 2)
                  .map((item) => (
                    <Box
                      key={item}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                    >
                      <CheckCircle
                        sx={{
                          fontSize: { xs: 16, md: 18 },
                          color: "#DCA621",
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "white",
                          fontSize: { xs: "0.75rem", md: "0.95rem" },
                        }}
                      >
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
                opacity: { xs: 1, md: 0 },
                transform: { xs: "translateY(0)", md: "translateY(20px)" },
                transition: "all 0.3s ease",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: "#DCA621",
                  fontSize: { xs: "1.1rem", md: "1.75rem" },
                }}
              >
                Solicitar Flete
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontSize: { xs: "0.75rem", md: "1.1rem" },
                }}
              >
                Hacé clic para empezar
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Conductor Hero Card */}
        <Box
          onClick={handleSoyConductor}
          sx={{
            position: "relative",
            height: { xs: "40vh", md: 500 },
            borderRadius: 4,
            overflow: "hidden",
            cursor: "pointer",
            transition: "all 0.4s ease",
            "&:hover": {
              transform: { xs: "none", md: "scale(1.02)" },
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              "& .hero-overlay": {
                opacity: 0.8,
              },
              "& .hero-content": {
                transform: { xs: "none", md: "translateY(-10px)" },
              },
              "& .hover-cta": {
                opacity: { xs: 1, md: 1 },
                transform: { xs: "translateY(0)", md: "translateY(0)" },
              },
              "& .default-content": {
                opacity: { xs: 1, md: 0 },
                transform: { xs: "translateY(0)", md: "translateY(10px)" },
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
              opacity: { xs: 0.7, md: 0.6 },
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
              p: { xs: 2, md: 4 },
              textAlign: "center",
              transition: "transform 0.3s ease",
            }}
          >
            {/* Default Content */}
            <Box
              className="default-content"
              sx={{
                transition: "all 0.3s ease",
                opacity: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: "white",
                  fontSize: { xs: "0.85rem", md: "1.25rem" },
                  fontWeight: 600,
                }}
              >
                ¿Tienes vehículo y quieres generar ingresos?
              </Typography>

              <Box display="flex" flexDirection="column" gap={1} mb={2}>
                {[
                  "Trabajá en tus horarios libres",
                  "Ingresos adicionales garantizados",
                  "Verificación y aprobación requerida",
                ]
                  .slice(0, 2)
                  .map((item) => (
                    <Box
                      key={item}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                    >
                      <CheckCircle
                        sx={{
                          fontSize: { xs: 16, md: 18 },
                          color: "#DCA621",
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "white",
                          fontSize: { xs: "0.75rem", md: "0.95rem" },
                        }}
                      >
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
                opacity: { xs: 1, md: 0 },
                transform: { xs: "translateY(0)", md: "translateY(20px)" },
                transition: "all 0.3s ease",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: "#DCA621",
                  fontSize: { xs: "1.1rem", md: "1.75rem" },
                }}
              >
                Empezar a Manejar
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontSize: { xs: "0.75rem", md: "1.1rem" },
                }}
              >
                Aplica y sé verificado
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
