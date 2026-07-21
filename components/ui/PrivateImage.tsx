"use client";

import { Box, Button, CircularProgress, Link, Typography } from "@mui/material";
import { usePresignedRead } from "@/lib/hooks/usePresignedRead";
import { isStorageKey } from "@/lib/upload";

/**
 * Muestra un documento privado (o público/legacy) resolviendo la URL firmada
 * cuando el valor es una KEY de Spaces. Para PDFs renderiza un link en vez de <img>.
 *
 * Uso: <PrivateImage value={doc.fileUrl} alt="DNI" />
 */
export function PrivateImage({
  value,
  alt,
  style,
  linkLabel = "Ver documento",
}: {
  value?: string | null;
  alt?: string;
  style?: React.CSSProperties;
  linkLabel?: string;
}) {
  const { url, isLoading, isError } = usePresignedRead(value);

  if (!value) {
    return (
      <Typography variant="caption" color="text.secondary">
        Sin archivo
      </Typography>
    );
  }
  if (isLoading) {
    return (
      <Box sx={{ display: "inline-flex", p: 1 }}>
        <CircularProgress size={18} />
      </Box>
    );
  }
  if (isError || !url) {
    return (
      <Typography variant="caption" color="error">
        Error al cargar
      </Typography>
    );
  }

  // Detectar PDF por la extensión de la key/URL original (no de la firmada).
  const isPdf = /\.pdf($|\?)/i.test(value);
  if (isPdf) {
    return (
      <Link href={url} target="_blank" rel="noopener noreferrer">
        {linkLabel}
      </Link>
    );
  }

  return (
    <img
      src={url}
      alt={alt ?? "documento"}
      style={style ?? { maxWidth: "100%", borderRadius: 8 }}
    />
  );
}

/**
 * Miniatura clickeable de un documento (privado o público/legacy).
 * Resuelve la URL firmada cuando el valor es una KEY. El `<a href>` y el `<img src>`
 * usan la misma URL resuelta. Para PDF muestra un recuadro con label en vez de img rota.
 * Reemplaza el patrón `<a href={doc.fileUrl}><img src={doc.fileUrl}/></a>` en admin.
 */
export function PrivateDocThumb({
  value,
  alt,
  imgStyle,
}: {
  value?: string | null;
  alt?: string;
  imgStyle?: React.CSSProperties;
}) {
  const { url, isLoading } = usePresignedRead(value);
  const baseStyle: React.CSSProperties = {
    width: 100,
    height: 72,
    objectFit: "cover",
    borderRadius: 6,
    display: "block",
    ...imgStyle,
  };

  if (!value) return null;
  if (isLoading || !url) {
    return (
      <Box
        sx={{
          ...baseStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "action.hover",
        }}
      >
        <CircularProgress size={16} />
      </Box>
    );
  }

  const isPdf = /\.pdf($|\?)/i.test(value);
  return (
    <Box
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ display: "block", textDecoration: "none" }}
    >
      {isPdf ? (
        <Box
          sx={{
            ...baseStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
            fontSize: 12,
            fontWeight: 600,
            color: "text.secondary",
            cursor: "pointer",
          }}
        >
          PDF
        </Box>
      ) : (
        <img
          src={url}
          alt={alt ?? "documento"}
          style={{ ...baseStyle, cursor: "pointer" }}
        />
      )}
    </Box>
  );
}

/**
 * Botón "Ver" que abre un documento privado (URL firmada) o público/legacy en pestaña nueva.
 * Reemplaza `<Button href={doc.fileUrl} target="_blank">` en admin cuando el valor puede ser una KEY.
 */
export function PrivateDocLink({
  value,
  children,
  ...buttonProps
}: {
  value?: string | null;
  children?: React.ReactNode;
} & Omit<React.ComponentProps<typeof Button>, "href" | "onClick">) {
  const { url, isLoading } = usePresignedRead(value);
  const disabled = buttonProps.disabled || isLoading || !url;
  return (
    <Button
      {...buttonProps}
      disabled={disabled}
      onClick={() => {
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }}
    >
      {children ?? "Ver"}
    </Button>
  );
}

export { isStorageKey };
