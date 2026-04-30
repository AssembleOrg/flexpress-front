"use client";

import Image from "next/image";
import { Box, Container, Typography } from "@mui/material";
import { Chat, LocalShipping, Person } from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  fadeInUp,
  motionTokens,
  staggerContainer,
  staggerItem,
} from "@/lib/animations/variants";

interface TimelineStep {
  step: string;
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
}

const steps: TimelineStep[] = [
  {
    step: "1",
    title: "Pedí tu flete en 2 minutos",
    description:
      "Desde el celular, sin llamadas ni negociaciones. Ingresá origen y destino en el mapa.",
    image: "/paso1.webp",
    icon: <LocalShipping sx={{ fontSize: 32, color: "#DCA621" }} />,
  },
  {
    step: "2",
    title: "Elegí quién lleva tu carga",
    description:
      "Ves el perfil, el vehículo y las calificaciones del conductor antes de confirmar.",
    image: "/paso2.webp",
    icon: <Person sx={{ fontSize: 32, color: "#DCA621" }} />,
  },
  {
    step: "3",
    title: "Coordiná todo desde la app",
    description:
      "Chateá con tu conductor, coordiná los detalles y tené el control de tu flete en todo momento.",
    image: "/paso3.webp",
    icon: <Chat sx={{ fontSize: 32, color: "#DCA621" }} />,
  },
];

export function HowItWorks() {
  return (
    <Box sx={{ bgcolor: "#380116", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <Typography
            variant="h3"
            textAlign="center"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "white",
              fontSize: { xs: "1.8rem", md: "2.5rem" },
            }}
          >
            ¿Cómo funciona{" "}
            <Box component="span" sx={{ color: "#DCA621" }}>
              Flexpress?
            </Box>
          </Typography>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          style={{ marginBottom: 64 }}
        >
          <Typography
            variant="h6"
            textAlign="center"
            sx={{
              maxWidth: 520,
              mx: "auto",
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Tres pasos, y tu carga está en camino.
          </Typography>
        </motion.div>

        {/* 3-column grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: { xs: 4, md: 3 },
            }}
          >
            {steps.map((step) => (
              <motion.div key={step.step} variants={staggerItem}>
                <motion.div
                  whileHover={{
                    y: -6,
                    transition: { duration: motionTokens.fast },
                  }}
                  style={{ height: "100%" }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      height: "100%",
                      bgcolor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(220, 166, 33, 0.2)",
                      borderRadius: 4,
                      p: { xs: 3, md: 4 },
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        borderColor: "rgba(220, 166, 33, 0.5)",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
                      },
                    }}
                  >
                    {/* Decorative number */}
                    <Typography
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: 16,
                        fontSize: "7rem",
                        fontWeight: 900,
                        lineHeight: 1,
                        color: "rgba(220, 166, 33, 0.1)",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    >
                      {step.step}
                    </Typography>

                    {/* Icon */}
                    <Box>{step.icon}</Box>

                    {/* Step label */}
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        color: "#DCA621",
                        textTransform: "uppercase",
                      }}
                    >
                      Paso {step.step}
                    </Typography>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "white",
                        fontSize: { xs: "1.1rem", md: "1.2rem" },
                        lineHeight: 1.3,
                      }}
                    >
                      {step.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.65)",
                        lineHeight: 1.7,
                        fontSize: { xs: "0.9rem", md: "0.95rem" },
                      }}
                    >
                      {step.description}
                    </Typography>

                    {/* Phone frame image */}
                    <Box
                      sx={{
                        mt: "auto",
                        pt: 3,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: { xs: "60%", sm: "55%", md: "70%" },
                          aspectRatio: "9/19",
                          borderRadius: "22px",
                          overflow: "hidden",
                          border: "6px solid rgba(255,255,255,0.12)",
                          boxShadow:
                            "0 24px 64px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)",
                        }}
                      >
                        <Image
                          src={step.image}
                          alt={`Paso ${step.step}: ${step.title}`}
                          fill
                          sizes="(max-width: 600px) 60vw, (max-width: 960px) 55vw, 25vw"
                          style={{ objectFit: "cover" }}
                          loading="lazy"
                          quality={85}
                        />
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
