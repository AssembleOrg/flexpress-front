'use client';

import { useEffect } from 'react';
import { pushApi } from '@/lib/api/push';

// Convierte la VAPID public key de base64url a Uint8Array (requerido por PushManager.subscribe)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

const STORAGE_KEY = 'fp_push_subscribed';

export function usePushPermission(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    // Si ya está suscrito en este dispositivo, no volver a suscribir
    if (localStorage.getItem(STORAGE_KEY) === '1') return;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    async function setup() {
      try {
        // Registrar el Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          updateViaCache: 'none',
        });

        // Pedir permiso solo si aún no se decidió
        const currentPermission = Notification.permission;
        if (currentPermission === 'denied') return;

        let permission: NotificationPermission = currentPermission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }
        if (permission !== 'granted') return;

        // Suscribir al push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey!) as unknown as ArrayBuffer,
        });

        const json = subscription.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

        // Guardar en el backend
        await pushApi.subscribe({
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        });

        localStorage.setItem(STORAGE_KEY, '1');
      } catch (err) {
        // No crítico — la app funciona igual sin push
        console.warn('[Push] Setup fallido (no crítico):', err);
      }
    }

    setup();
  }, [isAuthenticated]);
}
