"use client";

import Image from "next/image";
import { Box, Container, Typography } from "@mui/material";
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
  bgColor: string;
  image: string;
}

const steps: TimelineStep[] = [
  {
    step: "1",
    title: "Busca tu chofer",
    description:
      "Ingresa el origen y destino de tu carga en el mapa interactivo",
    bgColor: "#E3F2FD",
    image: "/paso1.webp",
  },
  {
    step: "2",
    title: "Elige tu chofer",
    description:
      "Revisa la lista de choferes disponibles cerca de tu zona y selecciona el que prefieras",
    bgColor: "#F3E5F5",
    image: "/paso2.webp",
  },
  {
    step: "3",
    title: "Coordina el flete",
    description:
      "Chatea con tu chofer, coordina los detalles y haz seguimiento en tiempo real",
    bgColor: "#E8F5E8",
    image: "/paso3.webp",
  },
];

export function HowItWorks() {
  return (
    <Box sx={{ bgcolor: "#f8f9fa", py: { xs: 6, md: 10 } }}>
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
              color: "primary.main",
              fontSize: { xs: "1.8rem", md: "2.5rem" },
            }}
          >
            ¿Cómo funciona el transporte de carga?
          </Typography>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          style={{ marginBottom: 60 }}
        >
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              lineHeight: 1.6,
            }}
          >
            Tres simples pasos para conectar con los mejores transportistas
          </Typography>
        </motion.div>

        {/* Timeline - Zigzag Layout */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Box sx={{ position: "relative" }}>
            {/* Vertical line (desktop only) */}
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: 2,
                bgcolor: "primary.main",
                transform: "translateX(-50%)",
              }}
            />

            {/* Steps */}
            <Box display="flex" flexDirection="column" gap={{ xs: 4, md: 6 }}>
              {steps.map((step, index) => {
                const isEven = index % 2 === 0;

                return (
                  <motion.div key={step.step} variants={staggerItem}>
                    <Box
                      sx={{
                        display: { xs: "flex", md: "grid" },
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        gap: { xs: 3, md: 4 },
                        flexDirection: { xs: "column", md: "row" },
                      }}
                    >
                      {/* Mobile: Circle + Content stacked */}
                      {/* Desktop Left placeholder for odd steps */}
                      <Box
                        sx={{
                          display: {
                            xs: "none",
                            md: !isEven ? "block" : "none",
                          },
                          order: 0,
                        }}
                      />

                      {/* Desktop Left (even) / Right (odd) */}
                      <Box
                        sx={{
                          order: {
                            xs: 0,
                            md: isEven ? 0 : 2,
                          },
                          width: "100%",
                        }}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: motionTokens.normal }}
                          whileHover={{
                            y: -8,
                            transition: {
                              duration: motionTokens.fast,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: step.bgColor,
                              p: { xs: 3, md: 4 },
                              borderRadius: { xs: 3, md: 4 },
                              border: "2px solid rgba(56, 1, 22, 0.05)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                                borderColor: "primary.main",
                              },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: "primary.main",
                                mb: 1,
                                fontSize: { xs: "0.85rem", md: "0.95rem" },
                              }}
                            >
                              PASO {step.step}
                            </Typography>

                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                mb: 1.5,
                                color: "primary.main",
                                fontSize: { xs: "1.2rem", md: "1.4rem" },
                              }}
                            >
                              {step.title}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                lineHeight: 1.6,
                                fontSize: { xs: "0.9rem", md: "0.95rem" },
                              }}
                            >
                              {step.description}
                            </Typography>

                            {/* Screenshot */}
                            <Box
                              sx={{
                                position: "relative",
                                width: "100%",
                                aspectRatio: "3/4",
                                maxWidth: { xs: "100%", sm: 350, md: 400 },
                                mx: "auto",
                                mt: 3,
                                borderRadius: 2,
                                overflow: "hidden",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                            >
                              <Image
                                src={step.image}
                                alt={`Paso ${step.step}: ${step.title}`}
                                fill
                                sizes="(max-width: 600px) 100vw, (max-width: 960px) 350px, 400px"
                                style={{ objectFit: "cover" }}
                                loading="lazy"
                                quality={85}
                              />
                            </Box>
                          </Box>
                        </motion.div>
                      </Box>

                      {/* Center Circle (desktop only) */}
                      <Box
                        sx={{
                          display: { xs: "flex", md: "flex" },
                          order: { xs: 0, md: 1 },
                          justifyContent: "center",
                          width: { xs: "100%", md: "auto" },
                        }}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: motionTokens.normal,
                            ...motionTokens.spring,
                          }}
                          whileHover={{
                            scale: 1.1,
                            rotate: 360,
                            transition: { duration: 0.6 },
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: 60, md: 80 },
                              height: { xs: 60, md: 80 },
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: { xs: "1.8rem", md: "2.2rem" },
                              boxShadow: "0 8px 24px rgba(56, 1, 22, 0.2)",
                              position: "relative",
                              zIndex: 10,
                              flexShrink: 0,
                              border: "4px solid #f8f9fa",
                            }}
                          >
                            {step.step}
                          </Box>
                        </motion.div>
                      </Box>

                      {/* Right side placeholder (desktop) - only for even steps */}
                      <Box
                        sx={{
                          display: {
                            xs: "none",
                            md: isEven ? "block" : "none",
                          },
                          order: 2,
                        }}
                      />
                    </Box>
                  </motion.div>
                );
              })}
            </Box>
          </Box>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          style={{ marginTop: 60, textAlign: "center" }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.95rem", md: "1.1rem" },
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            Con Flexpress, tu carga siempre estará en buenas manos. Desde que se
            carga hasta que llega a destino, tenés control total.
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
}
