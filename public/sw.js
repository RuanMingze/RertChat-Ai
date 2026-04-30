const CACHE_NAME = 'static-cache-v1';
const STATIC_PAGES = [
  '/',
  '/settings/',
  '/faq/',
  '/keys/',
  '/conversations/',
  '/api-docs/',
  '/appdev/',
  '/appdev/view/',
];

const STATIC_ASSETS = [
  '/favicon.ico',
  '/favicon.png',
  '/favicon-192x192.png',
  '/favicon-512x512.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...STATIC_PAGES, ...STATIC_ASSETS]);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (event.request.method !== 'GET') {
    return;
  }
  
  const pathname = url.pathname;
  
  const isStaticPage = STATIC_PAGES.some(page => {
    if (page === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname === page || pathname === page.replace(/\/$/, '');
  });
  
  const isStaticAsset = STATIC_ASSETS.some(asset => pathname === asset);
  
  if (!isStaticPage && !isStaticAsset) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      });
    })
  );
});
