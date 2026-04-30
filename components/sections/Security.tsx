"use client";

import { Chat, Support, VerifiedUser } from "@mui/icons-material";
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import {
  fadeInUp,
  motionTokens,
  staggerContainer,
  staggerItem,
} from "@/lib/animations/variants";

export function Security() {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #380116 0%, #4b011d 100%)",
        py: { xs: 8, md: 12 },
      }}
    >
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
            Tu carga,{" "}
            <Box component="span" sx={{ color: "#DCA621" }}>
              siempre protegida.
            </Box>
          </Typography>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          style={{ marginBottom: 56 }}
        >
          <Typography
            textAlign="center"
            sx={{
              color: "rgba(255,255,255,0.55)",
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              maxWidth: 480,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Cada flete en Flexpress está respaldado por verificación real,
            comunicación directa y soporte humano.
          </Typography>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gridTemplateRows: { md: "auto auto" },
              gap: 3,
            }}
          >
            {/* Card featured — ocupa toda la columna izquierda en desktop */}
            <motion.div variants={staggerItem} style={{ display: "contents" }}>
              <Box
                sx={{
                  gridColumn: { xs: "1", md: "1" },
                  gridRow: { md: "1 / 3" },
                }}
              >
                <motion.div
                  whileHover={{
                    y: -4,
                    transition: { duration: motionTokens.fast },
                  }}
                  style={{ height: "100%" }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      p: { xs: 4, md: 5 },
                      border: "1px solid rgba(220,166,33,0.35)",
                      borderRadius: 4,
                      bgcolor: "rgba(255,255,255,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                      position: "relative",
                      overflow: "hidden",
                      transition: "border-color 0.3s ease",
                      "&:hover": {
                        borderColor: "rgba(220,166,33,0.7)",
                      },
                    }}
                  >
                    {/* Número decorativo */}
                    <Typography
                      sx={{
                        position: "absolute",
                        bottom: -20,
                        right: 16,
                        fontSize: "9rem",
                        fontWeight: 900,
                        lineHeight: 1,
                        color: "rgba(220,166,33,0.07)",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    >
                      01
                    </Typography>

                    <VerifiedUser sx={{ fontSize: 48, color: "#DCA621" }} />

                    <Box>
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          letterSpacing: "0.14em",
                          color: "#DCA621",
                          textTransform: "uppercase",
                          mb: 1.5,
                        }}
                      >
                        Verificación
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "white",
                          mb: 2,
                          lineHeight: 1.2,
                        }}
                      >
                        Conductores 100% verificados
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.6)",
                          lineHeight: 1.8,
                          fontSize: "0.95rem",
                        }}
                      >
                        Antes de aceptar su primer flete, cada conductor pasa
                        por verificación de identidad, validación de licencia de
                        conducir y revisión de antecedentes. No hay atajos.
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Box>
            </motion.div>

            {/* Card secundaria 1 */}
            <motion.div variants={staggerItem}>
              <motion.div
                whileHover={{
                  y: -4,
                  transition: { duration: motionTokens.fast },
                }}
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    position: "relative",
                    overflow: "hidden",
                    transition: "border-color 0.3s ease",
                    "&:hover": {
                      borderColor: "rgba(220,166,33,0.3)",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      position: "absolute",
                      bottom: -16,
                      right: 12,
                      fontSize: "6rem",
                      fontWeight: 900,
                      lineHeight: 1,
                      color: "rgba(220,166,33,0.06)",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    02
                  </Typography>

                  <Chat sx={{ fontSize: 36, color: "#DCA621" }} />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        color: "#DCA621",
                        textTransform: "uppercase",
                        mb: 1,
                      }}
                    >
                      Comunicación
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "white", mb: 1 }}
                    >
                      Chat directo con tu conductor
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "0.9rem",
                        lineHeight: 1.7,
                      }}
                    >
                      Coordiná horarios, accesos y detalles directamente. Sin
                      intermediarios, sin llamadas perdidas.
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </motion.div>

            {/* Card secundaria 2 */}
            <motion.div variants={staggerItem}>
              <motion.div
                whileHover={{
                  y: -4,
                  transition: { duration: motionTokens.fast },
                }}
              >
                <Box
                  sx={{
                    p: { xs: 3, md: 4 },
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    position: "relative",
                    overflow: "hidden",
                    transition: "border-color 0.3s ease",
                    "&:hover": {
                      borderColor: "rgba(220,166,33,0.3)",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      position: "absolute",
                      bottom: -16,
                      right: 12,
                      fontSize: "6rem",
                      fontWeight: 900,
                      lineHeight: 1,
                      color: "rgba(220,166,33,0.06)",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    03
                  </Typography>

                  <Support sx={{ fontSize: 36, color: "#DCA621" }} />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        color: "#DCA621",
                        textTransform: "uppercase",
                        mb: 1,
                      }}
                    >
                      Soporte
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "white", mb: 1 }}
                    >
                      Soporte humano disponible
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "0.9rem",
                        lineHeight: 1.7,
                      }}
                    >
                      Algo no salió como esperabas. Estamos. Equipo de soporte
                      real, no bots.
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
