import type { Variants } from "framer-motion";

/**
 * Motion timing tokens
 * Keep animations fast and responsive
 */
export const motionTokens = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
  springGentle: { type: "spring" as const, stiffness: 100, damping: 30 },
};

/**
 * Fade & Scale Animations
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionTokens.normal },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.normal },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.normal },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: motionTokens.normal },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: motionTokens.normal },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: motionTokens.normal, ...motionTokens.spring },
  },
};

/**
 * Stagger container for list animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.normal },
  },
};

/**
 * Hover effects (for buttons, cards)
 */
export const hoverScale = {
  scale: 1.02,
  transition: { duration: motionTokens.fast },
};

export const hoverLift = {
  y: -4,
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  transition: { duration: motionTokens.fast },
};

/**
 * Loading/skeleton animations
 */
export const pulse: Variants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: 1,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

export const shimmer: Variants = {
  initial: { backgroundPosition: "200% 0" },
  animate: {
    backgroundPosition: "-200% 0",
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

/**
 * Page transitions (for route changes)
 */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: motionTokens.normal } },
  exit: { opacity: 0, y: -10, transition: { duration: motionTokens.fast } },
};

/**
 * Modal/dialog animations
 */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: motionTokens.normal, ...motionTokens.spring },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: motionTokens.fast },
  },
};

/**
 * Typing animation for hero text
 */
export const typing: Variants = {
  hidden: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const typingChar: Variants = {
  hidden: { opacity: 0 },
  animate: { opacity: 1 },
};
