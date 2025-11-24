/**
 * Mobile Design Constants
 * Valores constantes para diseño mobile-first de FlexPress
 */

// Heights
export const MOBILE_BOTTOM_NAV_HEIGHT = 64;
export const MOBILE_HEADER_HEIGHT = 56;
export const MOBILE_TAB_HEIGHT = 48;

// Spacing (en unidades de theme spacing - 1 = 8px)
export const MOBILE_SPACING = {
  xs: 1.5, // 12px
  sm: 2, // 16px
  md: 3, // 24px
  lg: 4, // 32px
};

// Container padding bottom cuando bottom navbar está visible
export const MOBILE_CONTAINER_PADDING_BOTTOM = 10; // 64px navbar + 16px extra

// Touch targets mínimos (según Material Design guidelines)
export const MIN_TOUCH_TARGET = 48;

// Breakpoints (referencia - ya están en theme)
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Transiciones
export const TRANSITIONS = {
  fast: "0.15s ease-in-out",
  normal: "0.2s ease-in-out",
  slow: "0.3s ease-in-out",
};

// Z-index layers
export const Z_INDEX = {
  bottomNav: 1100,
  mobileHeader: 1050,
  modal: 1300,
  drawer: 1200,
};
