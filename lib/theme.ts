import { createTheme } from "@mui/material/styles";

export const flexpressTheme = createTheme({
  palette: {
    primary: {
      main: "#380116", // Bordo Sofisticado (Púrpura Profundo)
      dark: "#4b011d", // Bordo Clásico para hover
      light: "#5a0a2f",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#DCA621", // Oro Brillante para los CTAs
      dark: "#B7850D", // Oro Medio para hover
      light: "#E8B76E",
      contrastText: "#212121",
    },
    background: {
      default: "#F5F2E8", // Fondo Pergamino / Lino
      paper: "#FFFFFF", // Fondo para Cards
    },
    success: {
      main: "#2ECC71", // Verde estándar para "Éxito"
      dark: "#27AE60",
      light: "#58D68D",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#E74C3C", // Rojo estándar para "Error"
      dark: "#C0392B",
      light: "#EC7063",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#B7850D", // Oro Medio para "Advertencia"
      dark: "#9A6B0A",
      light: "#D4A574",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#3498DB", // Blue for "Buscando" state
      dark: "#2980B9",
      light: "#5DADE2",
      contrastText: "#FFFFFF",
    },
    text: {
      primary: "#212121",
      secondary: "#503933",
    },
  },
  typography: {
    fontFamily: "var(--font-lato), sans-serif",
    // Títulos Principales (h1, h2) - Playfair Display
    h1: {
      fontFamily: "var(--font-playfair), serif",
      fontWeight: 700,
      letterSpacing: "-0.5px",
      color: "#212121",
    },
    h2: {
      fontFamily: "var(--font-playfair), serif",
      fontWeight: 700,
      letterSpacing: "-0.5px",
      color: "#212121",
    },
    // Subtítulos y Títulos de Tarjetas (h3-h6) - Lato
    h3: {
      fontFamily: "var(--font-lato), sans-serif",
      fontWeight: 700,
      color: "#212121",
    },
    h4: {
      fontFamily: "var(--font-lato), sans-serif",
      fontWeight: 700,
      color: "#212121",
    },
    h5: {
      fontFamily: "var(--font-lato), sans-serif",
      fontWeight: 700,
      color: "#212121",
    },
    h6: {
      fontFamily: "var(--font-lato), sans-serif",
      fontWeight: 600,
      color: "#212121",
    },
    // Cuerpo de Texto - Lato
    body1: {
      fontFamily: "var(--font-lato), sans-serif",
      fontWeight: 400,
      lineHeight: 1.5,
      color: "#212121",
    },
    body2: {
      fontFamily: "var(--font-lato), sans-serif",
      fontWeight: 400,
      lineHeight: 1.5,
      color: "#503933",
    },
    // Texto de UI y Botones - Lato Bold
    button: {
      fontFamily: "var(--font-lato), sans-serif",
      fontWeight: 700,
      textTransform: "none",
      letterSpacing: "0px",
    },
  },
  components: {
    // Global CSS Baseline con animaciones
    MuiCssBaseline: {
      styleOverrides: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `,
    },
    // Botones personalizados
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          padding: "10px 24px",
          // Mobile-first: Aumentar altura mínima para touch targets
          minHeight: 48,
          transition: "all 0.2s ease-in-out",
        },
        sizeSmall: {
          minHeight: 40,
          padding: "8px 16px",
        },
        sizeLarge: {
          minHeight: 56,
          padding: "14px 32px",
          fontSize: "1.1rem",
        },
        containedPrimary: {
          backgroundColor: "#380116",
          "&:hover": {
            backgroundColor: "#4b011d",
            transform: "translateY(-1px)",
            boxShadow: "0px 4px 12px rgba(56, 1, 22, 0.3)",
          },
        },
        containedSecondary: {
          backgroundColor: "#DCA621",
          color: "#212121",
          "&:hover": {
            backgroundColor: "#B7850D",
            transform: "translateY(-1px)",
            boxShadow: "0px 4px 12px rgba(220, 166, 33, 0.4)",
          },
        },
      },
    },
    // Cards con elevación sutil
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
    // Container con spacing mobile-first
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 16,
          paddingRight: 16,
          "@media (min-width: 600px)": {
            paddingLeft: 24,
            paddingRight: 24,
          },
        },
      },
    },
    // AppBar con color primario (Bordo)
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#380116",
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
        },
      },
    },
    // Chips con colores semánticos
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 16,
        },
      },
    },
    // Switch para disponibilidad del conductor
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: "#DCA621",
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#DCA621",
          },
        },
      },
    },
    // TextFields con bordes redondeados
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    // BottomNavigation con estilo brand
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid rgba(56, 1, 22, 0.08)",
          boxShadow: "0px -2px 8px rgba(0, 0, 0, 0.08)",
          height: 64,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: "#503933",
          minWidth: 64,
          padding: "6px 12px 8px",
          transition: "all 0.2s ease-in-out",
          "&.Mui-selected": {
            color: "#DCA621",
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.75rem",
              fontWeight: 700,
            },
          },
        },
        label: {
          fontSize: "0.7rem",
          fontWeight: 500,
          "&.Mui-selected": {
            fontSize: "0.75rem",
          },
        },
      },
    },
    // Tabs para chat/detalles deslizables
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        indicator: {
          backgroundColor: "#DCA621",
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
          color: "#503933",
          transition: "all 0.2s ease-in-out",
          "&.Mui-selected": {
            color: "#380116",
            fontWeight: 700,
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default flexpressTheme;
