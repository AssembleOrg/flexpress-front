"use client";

import { Box, Typography } from "@mui/material";
import { LocalShipping, Schedule, VerifiedUser } from "@mui/icons-material";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  fadeInUp,
  motionTokens,
  staggerContainer,
  staggerItem,
} from "@/lib/animations/variants";

const bullets = [
  {
    icon: <LocalShipping sx={{ fontSize: 28, color: "#DCA621" }} />,
    title: "Sin buscar trabajo",
    description: "Los clientes te encuentran según tu zona de trabajo.",
  },
  {
    icon: <Schedule sx={{ fontSize: 28, color: "#DCA621" }} />,
    title: "Vos manejás tu tiempo",
    description: "Conectate cuando quieras, aceptá lo que te sirva.",
  },
  {
    icon: <VerifiedUser sx={{ fontSize: 28, color: "#DCA621" }} />,
    title: "Registro gratis",
    description: "Sin comisiones ocultas, sin costos de entrada.",
  },
];

export function DriverPitch() {
  return (
    <Box sx={{ bgcolor: "#f8f9fa", py: { xs: 0, md: 0 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          minHeight: { md: "500px" },
        }}
      >
        {/* ── Izquierda: imagen ── */}
        <Box
          component="img"
          src="/charter-lead.webp"
          alt="Conductor Flexpress"
          sx={{
            width: { xs: "100%", md: "45%" },
            alignSelf: { md: "stretch" },
            height: { xs: "70vh", md: "100%" },
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            flexShrink: 0,
          }}
        />

        {/* ── Derecha: copy + bullets ── */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            px: { xs: 4, md: 8 },
            py: { xs: 8, md: 0 },
            bgcolor: "#f8f9fa",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 480 }}>
            {/* Eyebrow */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUp}
            >
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: "#DCA621",
                  textTransform: "uppercase",
                  mb: 3,
                }}
              >
                Para Conductores
              </Typography>
            </motion.div>

            {/* Headline con barra gold */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
            >
              <Box sx={{ borderLeft: "4px solid #DCA621", pl: 3, mb: 4 }}>
                <motion.div variants={fadeInUp}>
                  <Typography
                    component="h2"
                    sx={{
                      fontSize: { xs: "2rem", md: "2.8rem", xl: "3.8rem" },
                      fontWeight: 700,
                      lineHeight: 1.1,
                      color: "#380116",
                      mb: 0.5,
                    }}
                  >
                    Tu vehículo trabaja.
                  </Typography>
                </motion.div>
                <motion.div variants={fadeInUp} transition={{ delay: 0.12 }}>
                  <Typography
                    component="h2"
                    sx={{
                      fontSize: { xs: "2rem", md: "2.8rem", xl: "3.8rem" },
                      fontWeight: 700,
                      lineHeight: 1.1,
                      color: "#DCA621",
                    }}
                  >
                    Nosotros traemos los clientes.
                  </Typography>
                </motion.div>
              </Box>
            </motion.div>

            {/* Bajada */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUp}
              style={{ marginBottom: 40 }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  color: "rgba(56,1,22,0.6)",
                  lineHeight: 1.7,
                }}
              >
                Unite a la red de transporte de carga de Buenos Aires. Recibí
                pedidos, elegí los que te convengan, y cobrá.
              </Typography>
            </motion.div>

            {/* Bullets */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {bullets.map((bullet) => (
                  <motion.div key={bullet.title} variants={staggerItem}>
                    <motion.div
                      whileHover={{
                        x: 4,
                        transition: { duration: motionTokens.fast },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                          p: { xs: 1.5, md: 2 },
                          bgcolor: "rgba(56,1,22,0.03)",
                          borderLeft: "4px solid #DCA621",
                          borderRadius: "0 12px 12px 0",
                          transition: "background-color 0.2s ease",
                          "&:hover": {
                            bgcolor: "rgba(56,1,22,0.06)",
                          },
                        }}
                      >
                        <Box sx={{ mt: 0.3, flexShrink: 0 }}>{bullet.icon}</Box>
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              color: "#380116",
                              mb: 0.3,
                            }}
                          >
                            {bullet.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              color: "rgba(56,1,22,0.55)",
                              lineHeight: 1.5,
                            }}
                          >
                            {bullet.description}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
