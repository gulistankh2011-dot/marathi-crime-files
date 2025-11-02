const CACHE_NAME = "marathi-crime-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/crime.html",
  "/gumshuda.html",
  "/lawarish.html",
  "/story.html",
  "/manifest.json",
  "/192.png",
  "/512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
