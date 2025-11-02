const CACHE_NAME = 'crimefiles-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() =>
        new Response('<h1>Offline</h1><p>Internet connection not available.</p>', {
          headers: { 'Content-Type': 'text/html' }
        })
      );
    })
  );
});
