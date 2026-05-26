const CACHE = 'global-recall-v29';

// CACHE CHECKLIST: when adding new JS module files, add their paths here AND
// bump the CACHE version string above. Silent stale-cache failures on deploy
// are the #1 debugging trap in this project. Night/dark textures are lazy-cached
// on first style switch — do NOT add them back here (saves ~4MB on first install).
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  'https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.js',
  'https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.css',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&family=Inter:wght@400;600;700&display=swap',
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_50m_admin_0_countries.geojson',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(PRECACHE.map(url =>
        cache.add(url).catch(() => console.warn('[SW] Failed to cache:', url))
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
