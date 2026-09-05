const CACHE_NAME = "radio90-pwa-v3";
const STATIC_ASSETS = [
  "/manifest.json",
  "/logo.png",
  "/icon.png",
  "/appicon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/icons/maskable-icon-512x512.png"
];

// Install Event - Pre-cache Static Assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Delete all old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or non-HTTP protocols
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // Network-Only for Dashboard & Admin API requests to guarantee auth checks
  if (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/api/v1/admin")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response("Offline - Authentication Required", {
          status: 401,
          headers: { "Content-Type": "text/plain" },
        });
      })
    );
    return;
  }

  // Cache-First for static media assets (icons, logo)
  if (url.pathname.startsWith("/icons/") || url.pathname.endsWith(".png")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-First for everything else
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
