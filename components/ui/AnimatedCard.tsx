"use client";

import { Card, type CardProps } from "@mui/material";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedCardProps extends CardProps {
  children: ReactNode;
  delay?: number;
}

export function AnimatedCard({
  children,
  delay = 0,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  );
}
