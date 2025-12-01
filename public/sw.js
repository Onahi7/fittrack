// Service Worker for Push Notifications
// This file handles push notifications when the app is closed

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Handle push notification received
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received', event);

  if (!event.data) {
    console.log('[SW] Push event but no data');
    return;
  }

  const data = event.data.json();
  console.log('[SW] Push data:', data);

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
    tag: data.data?.type || 'general',
    requireInteraction: false, // Auto-dismiss after some time
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();

  const data = event.notification.data;
  const action = event.action;

  // Determine URL based on action or notification type
  let url = '/';
  
  if (action === 'log') {
    // User clicked "Log" action button
    if (data.type === 'water_reminder') {
      url = '/water';
    } else if (data.type === 'meal_reminder') {
      url = '/log-meal';
    } else if (data.type === 'workout_reminder') {
      url = '/workouts';
    }
  } else if (action === 'checkin') {
    url = '/';
  } else if (data.url) {
    // Use custom URL from notification data
    url = data.url;
  }

  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            return client.navigate(url);
          }
        }
        
        // Open new window if app not open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
  
  // You can track dismissals here if needed
  const data = event.notification.data;
  if (data.type) {
    console.log(`[SW] User dismissed ${data.type} notification`);
  }
});
