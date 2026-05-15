// Self-unregistering service worker.
// A previous app/PWA on this origin registered a service worker; once that
// registration is gone, browsers stop polling /sw.js.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        for (const client of clients) {
          client.navigate(client.url);
        }
      } catch {
        // ignore
      }
    })()
  );
});
