"use client";

import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { MOBILE_HEADER_HEIGHT, Z_INDEX } from "@/lib/constants/mobileDesign";

interface MobileHeaderProps {
  /**
   * Título del header
   */
  title: string;
  /**
   * Mostrar botón de back
   * @default true
   */
  showBack?: boolean;
  /**
   * Callback custom al hacer click en back (override del router.back())
   */
  onBack?: () => void;
  /**
   * Acciones adicionales a la derecha (ej: IconButton de editar, etc)
   */
  actions?: React.ReactNode;
}

/**
 * Mobile Header Component
 *
 * Header simple para mobile con:
 * - Botón back opcional (izquierda)
 * - Título centrado
 * - Acciones opcionales (derecha)
 *
 * Solo visible en mobile (xs, sm). En desktop se usa AuthNavbar.
 *
 * @example
 * ```tsx
 * <MobileHeader
 *   title="Detalles del Viaje"
 *   showBack
 *   actions={<IconButton><EditIcon /></IconButton>}
 * />
 * ```
 */
export function MobileHeader({
  title,
  showBack = true,
  onBack,
  actions,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        display: { xs: "flex", md: "none" }, // Solo mobile
        bgcolor: "primary.main",
        boxShadow: "0px 2px 8px rgba(56, 1, 22, 0.15)",
        zIndex: Z_INDEX.mobileHeader,
      }}
    >
      <Toolbar
        sx={{
          height: MOBILE_HEADER_HEIGHT,
          minHeight: `${MOBILE_HEADER_HEIGHT}px !important`,
          px: 1,
        }}
      >
        {/* Back Button */}
        {showBack && (
          <IconButton
            edge="start"
            onClick={handleBack}
            sx={{
              color: "white",
              mr: 1,
            }}
            aria-label="volver"
          >
            <ArrowBack />
          </IconButton>
        )}

        {/* Title */}
        <Typography
          variant="h6"
          component="h1"
          sx={{
            flexGrow: 1,
            color: "white",
            fontWeight: 700,
            fontSize: "1.1rem",
            textAlign: showBack ? "left" : "center",
          }}
        >
          {title}
        </Typography>

        {/* Actions */}
        {actions && <Box sx={{ display: "flex", gap: 0.5 }}>{actions}</Box>}
      </Toolbar>
    </AppBar>
  );
}
