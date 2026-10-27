/* Safe Digital Ecosystem – offline service worker (production only; registered from main.jsx).
 * - Never touches non-GET requests (report submissions are POSTs) or /api and /uploads.
 * - App shell (index.html + built JS/CSS/images) is precached on install and served offline.
 */
const CACHE = 'sde-shell-v1';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const res = await fetch('/index.html', { cache: 'no-store' });
    const html = await res.clone().text();
    await cache.put('/index.html', res);
    const urls = new Set();
    html.replace(/(?:src|href)="(\/[^"]+)"/g, (_, u) => { if (!u.startsWith('/api')) urls.add(u); return _; });
    await Promise.all([...urls].map((u) => cache.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) return;

  // SPA navigations: network first, fall back to cached shell.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put('/index.html', fresh.clone());
        return fresh;
      } catch {
        return (await caches.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  // Static assets: cache first, then network (and store).
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') {
      const cache = await caches.open(CACHE);
      cache.put(req, res.clone());
    }
    return res;
  })());
});
