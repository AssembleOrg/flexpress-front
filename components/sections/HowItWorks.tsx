"use client";

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
}

const steps: TimelineStep[] = [
  {
    step: "1",
    title: "Describe tu carga",
    description:
      "Especifica origen, destino, tipo de objetos, peso y dimensiones aproximadas",
    bgColor: "#E3F2FD",
  },
  {
    step: "2",
    title: "Conecta con transportistas",
    description: "Conductores con vehículos adecuados te envían presupuestos",
    bgColor: "#F3E5F5",
  },
  {
    step: "3",
    title: "Seguimiento de tu flete",
    description:
      "Monitorea la recolección y entrega de tu carga en tiempo real",
    bgColor: "#E8F5E8",
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

                            {/* Placeholder for screenshot */}
                            <Box
                              sx={{
                                mt: 3,
                                height: { xs: 120, md: 180 },
                                bgcolor: "rgba(255,255,255,0.6)",
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px dashed rgba(56, 1, 22, 0.1)",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                textAlign="center"
                                sx={{ px: 2 }}
                              >
                                📱 Screenshot paso {step.step}
                              </Typography>
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
