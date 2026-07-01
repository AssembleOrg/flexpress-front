"use client";

import { useState } from "react";

const STORAGE_KEY = "fp_dismissed_inquiries";

function readDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? new Set(ids) : new Set();
  } catch {
    return new Set();
  }
}

function writeDismissed(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // No crítico — la app funciona igual sin persistir el dismiss
  }
}

/**
 * Marca inquiries "answered" como vistas por el cliente (dismiss local).
 * No requiere backend: el peor caso de perder este estado (otro dispositivo,
 * caché borrada) es simplemente volver a ver una respuesta ya leída.
 */
export function useDismissedInquiries() {
  const [dismissed, setDismissed] = useState<Set<string>>(readDismissed);

  const dismiss = (ids: string[]) => {
    if (ids.length === 0) return;
    setDismissed((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      writeDismissed(next);
      return next;
    });
  };

  return { dismissed, dismiss };
}
