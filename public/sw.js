const CACHE_NAME = 'focusly-cache-v1';
const urlsToCache = [
  '/dashboard',
  '/tasks',
  '/focus',
  '/journal',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  (event as any).waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const fetchEvent = event as any;
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((response) => {
      return response || fetch(fetchEvent.request).catch(() => {
        if (fetchEvent.request.mode === 'navigate') {
          return caches.match('/dashboard');
        }
      });
    })
  );
});
