"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  direction?: "left" | "right" | "default";
}

export function PageTransition({
  children,
  direction = "default",
}: PageTransitionProps) {
  // Determine animation values based on direction
  const getAnimationValues = () => {
    switch (direction) {
      case "left":
        // Slide in from left
        return {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 50 },
        };
      case "right":
        // Slide in from right
        return {
          initial: { opacity: 0, x: 50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -50 },
        };
      default:
        // Default subtle slide
        return {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 20 },
        };
    }
  };

  const animationValues = getAnimationValues();

  return (
    <motion.div
      initial={animationValues.initial}
      animate={animationValues.animate}
      exit={animationValues.exit}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
