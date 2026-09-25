// Build script replaces these placeholders with a content hash and the current build files.
const CACHE = '__CACHE_VERSION__';
const PRECACHE = __PRECACHE__;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('idle-garden-hero-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.includes('/api/')) return;
  const isStatic = url.pathname.includes('/assets/') || /\.(?:webp|svg|json|js|css|png)$/.test(url.pathname);
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (isStatic) {
      const cached = await cache.match(request);
      if (cached) return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return (await cache.match(request)) || (await cache.match('./index.html')) || Response.error();
    }
  })());
});
