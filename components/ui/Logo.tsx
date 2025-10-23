"use client";

import { Box } from "@mui/material";
import Image from "next/image";

interface LogoProps {
  size?: number;
  variant?: "default" | "white";
  className?: string;
}

export default function Logo({
  size = 60,
  variant = "default",
  className,
}: LogoProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
      className={className}
    >
      <Image
        src="/logo/flexpress-logo.svg"
        alt="Flexpress Logo"
        width={size}
        height={size}
        priority
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </Box>
  );
}
