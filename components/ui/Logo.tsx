"use client";

import { Box } from "@mui/material";
import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  withCircle?: boolean;
}

export default function Logo({
  size = 60,
  className,
  withCircle = false,
}: LogoProps) {
  const circleSize = size + 12;

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
      {withCircle && (
        <Box
          sx={{
            position: "absolute",
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      )}
      <Image
        src="/logo/flexpress-logo.svg"
        alt="Flexpress Logo"
        width={size}
        height={size}
        priority
        style={{
          maxWidth: "100%",
          height: "auto",
          position: "relative",
          zIndex: 1,
        }}
      />
    </Box>
  );
}
