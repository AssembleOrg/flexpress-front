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

export type PushSupport =
  | "unsupported" // el navegador no soporta push (o falta VAPID key)
  | "denied" // el usuario bloqueó las notificaciones — no se puede pedir de nuevo
  | "granted" // permiso concedido Y suscripción viva sincronizada con el backend
  | "default"; // aún no se concedió el permiso — se debe mostrar el botón (gesto)

function getVapidKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

/**
 * Envía (upsert) la suscripción actual al backend. Idempotente: el backend hace
 * upsert por endpoint, así que reenviar la misma no duplica.
 */
async function syncSubscriptionToBackend(
  sub: PushSubscription,
): Promise<boolean> {
  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false;
  await pushApi.subscribe({
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  });
  return true;
}

/**
 * Gestión sólida ("una vez y ya") del Web Push.
 *
 * PRINCIPIO: la fuente de verdad es el NAVEGADOR, no `localStorage`. En cada
 * arranque se lee el estado real y se auto-repara:
 *
 *  - Permiso `denied`  → estado "denied" (no se puede pedir; el usuario debe
 *    reactivar en ajustes del navegador).
 *  - Permiso `default` → estado "default" (falta el gesto humano). El único caso
 *    donde se muestra el botón "Activar notificaciones".
 *  - Permiso `granted` → AUTO-SINCRONIZA en silencio (sin gesto, permitido porque
 *    el permiso ya está dado):
 *      · Si hay suscripción viva → la reenvía al backend (por si expiró/cambió el
 *        endpoint o el backend la borró tras un 410). Estado "granted".
 *      · Si NO hay suscripción → RE-SUSCRIBE automáticamente y la envía. Estado
 *        "granted". Esto hace que una suscripción muerta (p.ej. tras deshabilitar
 *        y rehabilitar notificaciones) se regenere sola al abrir la app.
 *
 * `subscribeToPush()` (gesto/click) solo hace falta la PRIMERA vez, cuando el
 * permiso es `default` — obligatorio en iOS, que exige gesto para el permiso.
 */
export function usePushPermission(isAuthenticated: boolean) {
  const [support, setSupport] = useState<PushSupport>("unsupported");
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupport("unsupported");
      return;
    }
    const vapidKey = getVapidKey();
    if (!vapidKey) {
      setSupport("unsupported");
      return;
    }

    const perm = Notification.permission;
    if (perm === "denied") {
      setSupport("denied");
      return;
    }
    if (perm === "default") {
      setSupport("default");
      // Registrar el SW por adelantado para que esté listo al momento del gesto.
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .catch((err) => console.warn("[Push] SW register fallido:", err));
      return;
    }

    // perm === "granted": auto-sincronizar en silencio (no requiere gesto).
    let cancelled = false;
    (async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });
        // Esperar a que el SW esté activo antes de tocar pushManager.
        await navigator.serviceWorker.ready;

        let sub = await registration.pushManager.getSubscription();
        if (!sub) {
          // Permiso concedido pero sin suscripción → regenerarla sola.
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              vapidKey,
            ) as unknown as ArrayBuffer,
          });
        }

        await syncSubscriptionToBackend(sub);
        if (!cancelled) setSupport("granted");
      } catch (err) {
        // No crítico — la app funciona sin push. No degradamos a "default"
        // para no mostrar un botón que quizá tampoco funcione; el próximo
        // arranque reintenta la auto-sincronización.
        console.warn("[Push] Auto-sincronización fallida (no crítico):", err);
        if (!cancelled) setSupport("granted");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  /**
   * Pide permiso y suscribe. DEBE llamarse desde un gesto del usuario (click).
   * Solo necesario la primera vez (permiso `default`). Devuelve true si quedó
   * suscrito y sincronizado con el backend.
   */
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    if (!("serviceWorker" in navigator) || !("PushManager" in window))
      return false;

    const vapidKey = getVapidKey();
    if (!vapidKey) return false;

    setIsSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        updateViaCache: "none",
      });
      await navigator.serviceWorker.ready;

      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") {
        setSupport(permission === "denied" ? "denied" : "default");
        return false;
      }

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            vapidKey,
          ) as unknown as ArrayBuffer,
        }));

      const ok = await syncSubscriptionToBackend(subscription);
      if (!ok) return false;

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

  return { support, isSubscribing, subscribeToPush };
}
