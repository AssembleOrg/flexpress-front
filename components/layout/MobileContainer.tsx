"use client";

import { Box, Container, type SxProps, type Theme } from "@mui/material";
import { MOBILE_CONTAINER_PADDING_BOTTOM } from "@/lib/constants/mobileDesign";

interface MobileContainerProps {
  children: React.ReactNode;
  /**
   * Agregar padding bottom para evitar que el bottom navbar cubra contenido
   * @default true
   */
  withBottomNav?: boolean;
  /**
   * Max width del container (sm por defecto para mobile-first)
   * @default "sm"
   */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  /**
   * Estilos adicionales del Box wrapper externo
   */
  sx?: SxProps<Theme>;
}

/**
 * Mobile Container Component
 *
 * Wrapper responsive mobile-first que:
 * - Agrega padding correcto en mobile vs desktop
 * - Opcionalmente agrega padding bottom para bottom navbar
 * - Usa Container de MUI con spacing optimizado
 *
 * @example
 * ```tsx
 * <MobileContainer withBottomNav>
 *   <Typography>Contenido aquí</Typography>
 * </MobileContainer>
 * ```
 */
export function MobileContainer({
  children,
  withBottomNav = true,
  maxWidth = "sm",
  sx = {},
}: MobileContainerProps) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        ...sx,
      }}
    >
      <Container
        maxWidth={maxWidth}
        sx={{
          py: { xs: 2, md: 4 },
          pb: {
            xs: withBottomNav ? MOBILE_CONTAINER_PADDING_BOTTOM : 2,
            md: 4,
          },
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
