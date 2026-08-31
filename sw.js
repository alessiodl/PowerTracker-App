const CACHE_NAME = 'powertrack-cache-v9';

const ASSETS_LOCAL = [
  './',
  'index.html',
  'manifest.json',
  'icon.svg'
];

const ASSETS_CORS = [
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://unpkg.com/dexie@3/dist/dexie.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap'
];

const ASSETS_NO_CORS = [
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Clicca sugli asset locali (stessa origine)
      await cache.addAll(ASSETS_LOCAL);
      
      // 2. Clicca sugli asset esterni che supportano CORS (Vue, Dexie, Google Fonts)
      await cache.addAll(ASSETS_CORS);
      
      // 3. Carica gli asset esterni senza CORS (come Tailwind CDN) in modalità no-cors
      for (const url of ASSETS_NO_CORS) {
        try {
          const req = new Request(url, { mode: 'no-cors' });
          const res = await fetch(req);
          await cache.put(req, res);
        } catch (err) {
          console.error('Errore nel caching di un asset senza CORS:', url, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
