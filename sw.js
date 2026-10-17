/**
 * BakVakitGeldi — PWA Service Worker (sw.js)
 * Çevrimdışı çalışma (Offline Cache) ve Bildirim tıklama yönetimi sağlar.
 */

const CACHE_NAME = 'bakvakitgeldi-pwa-v6';
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './logo.png',
    './logo.png?v=2'
];

// Kurulum: Temel uygulama dosyalarını önbelleğe al
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => null)
    );
});

// Aktivasyon: Eski önbellekleri temizle
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

// Ağ İstekleri: Önce Ağ, Çevrimdışıysa Önbellek
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    event.respondWith(
        fetch(req)
            .then((networkRes) => {
                if (networkRes && networkRes.status === 200 && req.url.startsWith(self.location.origin)) {
                    const resClone = networkRes.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => null);
                }
                return networkRes;
            })
            .catch(() => caches.match(req).then((cachedRes) => cachedRes || caches.match('./index.html')))
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
                return self.clients.openWindow('./index.html');
            }
            return null;
        })
    );
});
