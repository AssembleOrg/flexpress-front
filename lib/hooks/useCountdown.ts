"use client";

import { useEffect, useState } from "react";

interface CountdownResult {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  formatted: string;
  isUrgent: boolean; // < 2 minutos
}

/**
 * Hook para countdown hacia una fecha de expiración
 * Actualiza cada segundo y retorna el tiempo restante formateado
 */
export function useCountdown(expiresAt: string | Date | null): CountdownResult {
  const [timeLeft, setTimeLeft] = useState<CountdownResult>(() =>
    calculateTimeLeft(expiresAt)
  );

  useEffect(() => {
    if (!expiresAt) return;

    // Calcular inmediatamente
    setTimeLeft(calculateTimeLeft(expiresAt));

    // Actualizar cada segundo
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(expiresAt);
      setTimeLeft(newTimeLeft);

      // Detener el intervalo si expiró
      if (newTimeLeft.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft;
}

function calculateTimeLeft(expiresAt: string | Date | null): CountdownResult {
  if (!expiresAt) {
    return {
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
      formatted: "Expirado",
      isUrgent: false,
    };
  }

  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return {
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
      formatted: "Expirado",
      isUrgent: false,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isUrgent = minutes < 2;

  // Formatear como "5:32" o "0:45"
  const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return {
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
    formatted,
    isUrgent,
  };
}
