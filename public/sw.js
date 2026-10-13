// MindMeshAI Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have a new MindMeshAI alert',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: {
        url: data.url || '/',
        id: data.id,
        type: data.type
      },
      actions: [
        { action: 'ok', title: '✓ OK' },
        { action: 'done', title: 'Already Done' },
        { action: 'snooze', title: 'Remind in 2h' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'MindMeshAI Alert', options)
    );
  } catch (err) {
    console.error('Push handling error:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notifData = event.notification.data;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_ACTION',
            action: action,
            notificationData: notifData
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(notifData.url || '/');
      }
    })
  );
});
