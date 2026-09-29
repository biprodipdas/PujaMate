const CACHE = 'pujamate-v5-shell';
const SHELL = ['/', '/blog', '/bus', '/metro', '/food', '/explore', '/community', '/route-planner'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  // Never cache API responses or authentication-sensitive requests.
  if (new URL(request.url).pathname.startsWith('/auth/') || new URL(request.url).pathname.match(/^\/(pujas|crowd|community|blogs|passport|groups|notifications|next-pandal|routes|planner|emergency)(\/|$)/)) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && request.destination !== 'document') {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/')))
  );
});

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  event.waitUntil(self.registration.showNotification(data.title || 'PujaMate', {
    body: data.body || 'You have a new PujaMate update.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { pujaId: data.pujaId || null },
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/explore'));
});
