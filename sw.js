// sw.js - Service Worker för bakgrundsnotiser och rast-knappar

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_SHIFT_NOTIFICATION') {
    const { title, body, isRunning } = event.data;
    
    const options = {
      body: body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: 'active-shift-notification',
      renotify: false,
      ongoing: true,
      actions: [
        { action: 'toggle_break', title: '☕ Rast / Arbete' }
      ]
    };

    self.registration.showNotification(title, options);
  } else if (event.data && event.data.type === 'CLEAR_NOTIFICATION') {
    self.registration.getNotifications({ tag: 'active-shift-notification' }).then(notifications => {
      notifications.forEach(notification => notification.close());
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'toggle_break') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          client.postMessage({ type: 'TOGGLE_BREAK_ACTION' });
          return;
        }
      })
    );
  }
});
