import { createTheme } from "@mui/material/styles";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const flexpressTheme = createTheme({
  palette: {
    primary: {
      main: "#2C3E50", // Dark Slate Blue - Base de Confianza
      dark: "#1A252F",
      light: "#34495E",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#E67E22", // Carrot Orange - Llamado a la Acción
      dark: "#D35400",
      light: "#F39C12",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F4F6F8", // Lightest Gray - Lienzo Limpio
      paper: "#FFFFFF", // Pure White - Superficie
    },
    success: {
      main: "#2ECC71", // Emerald Green - Confirmación Visual
      dark: "#27AE60",
      light: "#58D68D",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#E74C3C", // Alizarin Red - Alerta y Cancelación
      dark: "#C0392B",
      light: "#EC7063",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F39C12", // Orange variant for "Negociando" state
      dark: "#E67E22",
      light: "#F7DC6F",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#3498DB", // Blue for "Buscando" state
      dark: "#2980B9",
      light: "#5DADE2",
      contrastText: "#FFFFFF",
    },
    text: {
      primary: "#2C3E50",
      secondary: "#5D6D7E",
    },
  },
  typography: {
    fontFamily: poppins.style.fontFamily,
    // Títulos Principales (h1, h2)
    h1: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 700,
      letterSpacing: "-0.5px",
      color: "#2C3E50",
    },
    h2: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 700,
      letterSpacing: "-0.5px",
      color: "#2C3E50",
    },
    // Subtítulos y Títulos de Tarjetas (h3, h4)
    h3: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 600,
      color: "#2C3E50",
    },
    h4: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 600,
      color: "#2C3E50",
    },
    h5: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 600,
      color: "#2C3E50",
    },
    h6: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 600,
      color: "#2C3E50",
    },
    // Cuerpo de Texto
    body1: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 400,
      lineHeight: 1.5,
      color: "#2C3E50",
    },
    body2: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 400,
      lineHeight: 1.5,
      color: "#5D6D7E",
    },
    // Texto de UI y Botones
    button: {
      fontFamily: poppins.style.fontFamily,
      fontWeight: 500,
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
          fontWeight: 500,
          padding: "10px 24px",
        },
        containedPrimary: {
          backgroundColor: "#2C3E50",
          "&:hover": {
            backgroundColor: "#1A252F",
          },
        },
        containedSecondary: {
          backgroundColor: "#E67E22",
          "&:hover": {
            backgroundColor: "#D35400",
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
    // AppBar con color primario
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#2C3E50",
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
            color: "#E67E22",
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#E67E22",
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
