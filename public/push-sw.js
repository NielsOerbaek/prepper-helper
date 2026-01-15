// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  if (!event.data) {
    return;
  }

  const data = event.data.json();

  // Add app name prefix if not already present
  const title = data.title.startsWith('Prepper') ? data.title : `Prepper: ${data.title}`;

  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle service worker installation
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});
