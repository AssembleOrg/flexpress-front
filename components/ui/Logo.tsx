"use client";

import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  variant?: "default" | "white";
}

export default function Logo({
  size = 60,
  className,
  variant = "default",
}: LogoProps) {
  const logoSrc =
    variant === "white"
      ? "/logo/flexpress-logo-blanco.svg"
      : "/logo/flexpress-logo.svg";

  return (
    <Image
      src={logoSrc}
      alt="Flexpress Logo"
      width={size}
      height={size}
      priority
      className={className}
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />
  );
}
