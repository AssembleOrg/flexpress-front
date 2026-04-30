// Service Worker — maneja push notifications cuando la app está cerrada o en background

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
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const actionUrl = event.notification.data?.actionUrl || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) client.navigate(actionUrl);
            return;
          }
        }
        if (clients.openWindow) return clients.openWindow(actionUrl);
      }),
  );
});
