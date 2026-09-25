// Network-first service worker: always try fresh files, fall back to the last cached copy when offline.
const CACHE = 'idle-garden-hero-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Bản lưu theo tài khoản không được đệm: máy dùng chung mà offline thì người này có thể
  // nhận bản lưu đã đệm của người kia.
  if (url.pathname.includes('/api/')) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('./'))),
  );
});
