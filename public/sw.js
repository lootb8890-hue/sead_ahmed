const CACHE_NAME = 'clan-app-v2'; // Bumped version to force cache clear

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

self.addEventListener('activate', (event) => {
  // Clear all caches on activate to ensure we don't serve stale Vite assets
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-First strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Optionally cache the new response here if needed, but for Vite it's safer to just rely on browser cache or Vercel edge
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
