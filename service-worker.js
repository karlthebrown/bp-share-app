// bump the version when you change files, so users get updates immediately
const CACHE_NAME = 'bp-share-medical-v11';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.ico',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k.startsWith('bp-share-medical'))
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      try {
        const url = new URL(e.request.url);
        if (e.request.method === 'GET' && url.origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        }
      } catch {}
      return resp;
    }).catch(() => {
      if (e.request.mode === 'navigate') return caches.match('./index.html');
    }))
  );
});
