const CACHE_VERSION = "v2";
const CACHE_NAME = `kgpedia-pwa-cache-${CACHE_VERSION}`;
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/img2.png",
  "/icons/img1-icon.png",
  "/screenshots/screenshot1.png",
  "/screenshots/screenshot2.png"
  // Add more assets to cache as needed
];

self.addEventListener("install", (event) => {
    console.log('Service Worker: Installed');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching files');
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});


self.addEventListener("fetch", (event) => {
  const request = event.request;
  const acceptsHtml = request.headers.get('accept')?.includes('text/html');
  const isNavigate = request.mode === 'navigate';

  if (isNavigate || acceptsHtml) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

self.addEventListener("activate", (event) => {
    console.log('Service Worker: Activated');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body,
        icon: '/icons/img2.png',
        badge: '/icons/img1-icon.png',
        data: {
            url: data.url,
        },
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
