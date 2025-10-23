"use client";

import { Box, Button, Typography } from "@mui/material";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="40vh"
      gap={2}
      py={4}
    >
      {icon && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Box
            sx={{
              fontSize: 64,
              color: "primary.main",
              opacity: 0.5,
            }}
          >
            {icon}
          </Box>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Typography
          variant="h5"
          color="text.primary"
          textAlign="center"
          fontWeight={600}
        >
          {title}
        </Typography>
      </motion.div>
      {description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            maxWidth={400}
          >
            {description}
          </Typography>
        </motion.div>
      )}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={action.onClick}
            sx={{ mt: 2 }}
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </Box>
  );
}
