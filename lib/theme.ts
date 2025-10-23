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
    // Botones personalizados
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          padding: "10px 24px",
        },
        containedPrimary: {
          backgroundColor: "#380116",
          "&:hover": {
            backgroundColor: "#4b011d",
          },
        },
        containedSecondary: {
          backgroundColor: "#DCA621",
          color: "#212121",
          "&:hover": {
            backgroundColor: "#B7850D",
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
          "&:hover": {
            boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.12)",
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
