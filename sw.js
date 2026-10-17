/**
 * BakVakitGeldi — PWA Service Worker (sw.js)
 * - Ana ekrana eklenen PWA simgesine tıklandığında Vercel'deki en güncel sürümü anında çeker (Network-First + no-cache).
 * - İnternet olmadığında çevrimdışı (Offline Cache) çalışmaya devam eder.
 */

const CACHE_NAME = 'bakvakitgeldi-pwa-v8';
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css?v=8',
    './app.js?v=8',
    './manifest.json?v=8',
    './logo.png?v=2'
];

// Kurulum: Beklemeden yeni Service Worker'ı devreye al
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => null)
    );
});

// İstemciden gelen SKIP_WAITING mesajını dinle
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Aktivasyon: Tüm eski önbellekleri temizle ve açık tüm PWA pencerelerini hemen devral
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                    return null;
                })
            )
        ).then(() => self.clients.claim())
    );
});

// Ağ İstekleri: Uygulama dosyaları için her zaman önce Vercel canlı sunucusundan güncel hali çek (no-cache),
// yalnızca internet yoksa önbellekten (Offline Cache) yanıt ver.
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const isSameOrigin = req.url.startsWith(self.location.origin);

    event.respondWith(
        fetch(req, isSameOrigin ? { cache: 'no-cache' } : undefined)
            .then((networkRes) => {
                if (networkRes && networkRes.status === 200 && isSameOrigin) {
                    const resClone = networkRes.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => null);
                }
                return networkRes;
            })
            .catch(() =>
                caches.match(req, { ignoreSearch: true }).then((cachedRes) => cachedRes || caches.match('./index.html'))
            )
    );
});

// Bildirime tıklandığında uygulamayı öne getir
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow('./');
            }
            return null;
        })
    );
});
