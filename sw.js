const CACHE_NAME = 'powertrack-cache-v36';

const ASSETS_LOCAL = [
  './',
  'index.html',
  'app.html',
  'manuale.html',
  'manifest.json',
  'palestra.jpg',
  'logo.png',
  'logo.jpg',
  'favicon.ico',
  'favicon-32x32.png',
  'favicon-16x16.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon.svg',
  'icons/black_for_light_theme/allenamento.png',
  'icons/black_for_light_theme/carica_immagine.png',
  'icons/black_for_light_theme/catalogo.png',
  'icons/black_for_light_theme/incolla_appunti.png',
  'icons/black_for_light_theme/livelli.png',
  'icons/black_for_light_theme/moon.png',
  'icons/black_for_light_theme/note.png',
  'icons/black_for_light_theme/scheda.png',
  'icons/black_for_light_theme/storico.png',
  'icons/black_for_light_theme/suggerimento.png',
  'icons/black_for_light_theme/sun.png',
  'icons/black_for_light_theme/sync.png',
  'icons/black_for_light_theme/timer.png',
  'icons/white_for_dark_theme/allenamento.png',
  'icons/white_for_dark_theme/carica_immagine.png',
  'icons/white_for_dark_theme/catalogo.png',
  'icons/white_for_dark_theme/incolla_appunti.png',
  'icons/white_for_dark_theme/livelli.png',
  'icons/white_for_dark_theme/moon.png',
  'icons/white_for_dark_theme/note.png',
  'icons/white_for_dark_theme/scheda.png',
  'icons/white_for_dark_theme/storico.png',
  'icons/white_for_dark_theme/suggerimento.png',
  'icons/white_for_dark_theme/sun.png',
  'icons/white_for_dark_theme/sync.png',
  'icons/white_for_dark_theme/timer.png'
];

const ASSETS_CORS = [
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://unpkg.com/dexie@3/dist/dexie.js',
  'https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap'
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
