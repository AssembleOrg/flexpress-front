"use client";

import { useState } from "react";
import { Close, ErrorOutline, InfoOutlined } from "@mui/icons-material";
import { Box, Collapse, IconButton, Link, Typography } from "@mui/material";

interface AccountStatusBannerProps {
  status: "warned" | "banned";
  note?: string | null;
  contactEmail?: string;
}

/**
 * Aviso compacto del estado de cuenta (warned/banned) para el charter.
 * Estética iOS, sobrio: barra fina con borde de acento, no un cartel lleno.
 * 'warned' es descartable (no bloquea); 'banned' es persistente.
 */
export function AccountStatusBanner({
  status,
  note,
  contactEmail,
}: AccountStatusBannerProps) {
  const [open, setOpen] = useState(true);

  const isBanned = status === "banned";
  const accent = isBanned ? "error.main" : "warning.main";
  const title = isBanned ? "Cuenta bloqueada" : "Advertencia";

  return (
    <Collapse in={open}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          px: 1.5,
          py: 1,
          mb: 2,
          borderRadius: 2,
          bgcolor: "background.paper",
          borderLeft: "3px solid",
          borderLeftColor: accent,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ color: accent, display: "flex", pt: 0.2 }}>
          {isBanned ? (
            <ErrorOutline sx={{ fontSize: 18 }} />
          ) : (
            <InfoOutlined sx={{ fontSize: 18 }} />
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: "0.82rem" }}
          >
            {title}
            {note ? (
              <Typography
                component="span"
                sx={{ fontWeight: 400, color: "text.secondary", ml: 0.5, fontSize: "0.82rem" }}
              >
                — {note}
              </Typography>
            ) : null}
          </Typography>
          {contactEmail && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              ¿Dudas? Escribinos a{" "}
              <Link href={`mailto:${contactEmail}`} underline="hover" sx={{ fontWeight: 600 }}>
                {contactEmail}
              </Link>
            </Typography>
          )}
        </Box>

        {/* Solo la advertencia se puede descartar; el bloqueo permanece visible. */}
        {!isBanned && (
          <IconButton
            size="small"
            onClick={() => setOpen(false)}
            sx={{ p: 0.25, color: "text.secondary" }}
            aria-label="Descartar"
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
    </Collapse>
  );
}
