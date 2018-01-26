self.addEventListener('install', function (event) {
  console.log('[serviceWorker] installing service worker...', event);
});

self.addEventListener('activate', function (event) {
  console.log('[serviceWorker] activating service worker...', event);
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  console.log('[serviceWorker] fetching something...', event);
  event.respondWith(fetch(event.request));
});