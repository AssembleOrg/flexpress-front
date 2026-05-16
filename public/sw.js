// Service Worker — push notifications

// Activar el SW nuevo apenas se instala, sin esperar a que se cierren todas las pestañas.
// Esto permite que cambios futuros del SW lleguen al usuario sin necesidad de reinstalar la PWA.
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Tomar control inmediato de las ventanas ya abiertas, así no hay un período donde
// el SW viejo y el nuevo coexisten.
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Flexpress', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Flexpress', {
      body: data.body || '',
      icon: data.icon || '/genfavicon-512.png',
      badge: '/genfavicon-512.png',
      data: data.data || {},
      requireInteraction: false,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const actionUrl = event.notification.data?.actionUrl || '/';
  // URL absoluta resuelta contra el scope del SW (mismo origen garantizado)
  const targetUrl = new URL(actionUrl, self.registration.scope).href;
  const targetOrigin = new URL(targetUrl).origin;

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Filtrar solo ventanas del mismo origen
      const sameOriginClients = allClients.filter((c) => {
        try {
          return new URL(c.url).origin === targetOrigin;
        } catch {
          return false;
        }
      });

      // Si hay ventana abierta del mismo origen: enfocar y pedirle que navegue
      if (sameOriginClients.length > 0) {
        const client = sameOriginClients[0];
        await client.focus();
        client.postMessage({ type: 'NAVIGATE', url: actionUrl });
        return;
      }

      // Si no hay ninguna: abrir nueva ventana en la URL completa
      if (clients.openWindow) {
        await clients.openWindow(targetUrl);
      }
    })(),
  );
});
