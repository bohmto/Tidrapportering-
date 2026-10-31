// SW.JS - Service Worker för tidsrapporteringsappen[span_1](start_span)[span_1](end_span)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Hantera meddelanden från appen (när timern startar, stoppas eller byter status)[span_2](start_span)[span_2](end_span)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'UPDATE_SHIFT_NOTIFICATION') {
    const { title, body, isRunning, isBreak } = event.data;

    const options = {
      body: body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%232563eb"/><text x="50" y="68" font-size="55" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="bold">T</text></svg>',
      tag: 'active-shift-notification', // Gör att notisen uppdateras i stället för att skapa nya[span_3](start_span)[span_3](end_span)
      renotify: false,
      ongoing: true, // Håller notisen kvar i mobilen så den inte sveps bort av misstag (där det stöds)[span_4](start_span)[span_4](end_span)
      silent: true,  // Gör att mobilen inte plingar till varje gång notisen synkas[span_5](start_span)[span_5](end_span)
      actions: [
        {
          action: 'toggle_break',
          title: isBreak ? '▶ Avsluta rast' : '☕ Starta rast'
        }
      ]
    };

    self.registration.showNotification(title, options);
  }

  if (event.data.type === 'CLEAR_NOTIFICATION') {
    self.registration.getNotifications({ tag: 'active-shift-notification' }).then((notifications) => {
      notifications.forEach((notification) => notification.close());
    });
  }
});

// Hantera klick på knappar direkt i notisen[span_6](start_span)[span_6](end_span)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'toggle_break') {
    // Skicka meddelande till appen att växla rast/arbete[span_7](start_span)[span_7](end_span)
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          client.postMessage({ type: 'TOGGLE_BREAK_ACTION' });
          return client.focus();
        }
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
    );
  } else {
    // Klick på själva notisen öppnar appen[span_8](start_span)[span_8](end_span)
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow('./');
      })
    );
  }
});
