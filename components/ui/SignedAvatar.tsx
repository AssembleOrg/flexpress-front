"use client";

import { Avatar, type AvatarProps } from "@mui/material";
import { usePresignedRead } from "@/lib/hooks/usePresignedRead";

/**
 * MUI Avatar que resuelve el `src` con URL firmada cuando el valor es una KEY de Spaces
 * (bucket privado). Si es una URL http (legacy CDN / externa) la usa directa.
 *
 * Uso: reemplaza `<Avatar src={user.avatar}>` por `<SignedAvatar value={user.avatar}>`.
 * Acepta todas las props de MUI Avatar (sx, children/inicial de fallback, etc.).
 */
export function SignedAvatar({
  value,
  ...avatarProps
}: { value?: string | null } & Omit<AvatarProps, "src">) {
  const { url } = usePresignedRead(value);
  return <Avatar src={url ?? undefined} {...avatarProps} />;
}
