"use client";

import { Button, type ButtonProps } from "@mui/material";
import { motion } from "framer-motion";

interface AnimatedButtonProps extends ButtonProps {
  // Puedes agregar props personalizadas aquí
}

export function AnimatedButton({ children, ...props }: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <Button {...props}>{children}</Button>
    </motion.div>
  );
}
