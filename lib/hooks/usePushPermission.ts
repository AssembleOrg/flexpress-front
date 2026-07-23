"use client";

import { useCallback, useEffect, useState } from "react";
import { pushApi } from "@/lib/api/push";

// Convierte la VAPID public key de base64url a Uint8Array (requerido por PushManager.subscribe)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

const STORAGE_KEY = "fp_push_subscribed";

export type PushSupport =
  | "unsupported" // el navegador no soporta push (o falta VAPID key)
  | "denied" // el usuario bloqueó las notificaciones
  | "granted" // ya concedido (y suscrito o suscribible)
  | "default"; // aún no se pidió permiso — se puede mostrar el botón

/**
 * Registra el Service Worker y expone `subscribeToPush()` para pedir el permiso
 * de notificaciones DENTRO de un gesto del usuario (un click).
 *
 * Esto es obligatorio en iOS/Safari: `Notification.requestPermission()` solo
 * funciona si el PWA está instalado, abierto en standalone y la llamada ocurre
 * en respuesta a una interacción directa. Pedirlo en un `useEffect` (sin gesto)
 * falla en silencio en iPhone. Por eso NO auto-suscribimos: el consumidor debe
 * llamar `subscribeToPush()` desde el onClick de un botón.
 */
export function usePushPermission(isAuthenticated: boolean) {
  const [support, setSupport] = useState<PushSupport>("unsupported");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Registrar el SW y calcular el estado de soporte (no requiere gesto)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupport("unsupported");
      return;
    }
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      setSupport("unsupported");
      return;
    }

    // Registrar el SW por adelantado (esto sí puede correr sin gesto)
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .catch((err) => console.warn("[Push] SW register fallido:", err));

    const perm = Notification.permission;
    if (perm === "denied") setSupport("denied");
    else if (perm === "granted") setSupport("granted");
    else setSupport("default");
  }, [isAuthenticated]);

  /**
   * Pide permiso y suscribe al push. DEBE llamarse desde un gesto del usuario.
   * Devuelve true si quedó suscrito.
   */
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    if (!("serviceWorker" in navigator) || !("PushManager" in window))
      return false;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return false;

    setIsSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") {
        setSupport(permission === "denied" ? "denied" : "default");
        return false;
      }

      // Reusar suscripción existente si la hay
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            vapidKey,
          ) as unknown as ArrayBuffer,
        }));

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth)
        return false;

      await pushApi.subscribe({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      });

      localStorage.setItem(STORAGE_KEY, "1");
      setSupport("granted");
      return true;
    } catch (err) {
      // No crítico — la app funciona igual sin push
      console.warn("[Push] Suscripción fallida (no crítico):", err);
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }, []);

  const alreadySubscribed =
    typeof window !== "undefined" &&
    localStorage.getItem(STORAGE_KEY) === "1" &&
    support === "granted";

  return { support, isSubscribing, subscribeToPush, alreadySubscribed };
}
