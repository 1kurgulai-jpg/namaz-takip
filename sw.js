/**
 * BakVakitGeldi — PWA Service Worker (sw.js)
 * - Ana ekrana eklenen PWA simgesine tıklandığında Vercel'deki en güncel sürümü anında çeker (Network-First + no-cache).
 * - İnternet olmadığında çevrimdışı (Offline Cache) çalışmaya devam eder.
 */

const CACHE_NAME = 'bakvakitgeldi-pwa-v15';
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css?v=15',
    './app.js?v=15',
    './manifest.json?v=15',
    './logo.png?v=2'
];

let swPrayerSchedule = null;

const SW_VAKIT_META = [
    { key: 'imsak', label: 'İmsak (Sabah)', notifTitle: 'Sabah Namazı Vakti Girdi' },
    { key: 'gunes', label: 'Güneş', notifTitle: 'Güneş Doğdu (Sabah Vakti Çıktı)' },
    { key: 'ogle', label: 'Öğle', notifTitle: 'Öğle Namazı Vakti Girdi' },
    { key: 'ikindi', label: 'İkindi', notifTitle: 'İkindi Namazı Vakti Girdi' },
    { key: 'aksam', label: 'Akşam', notifTitle: 'Akşam Namazı Vakti Girdi' },
    { key: 'yatsi', label: 'Yatsı', notifTitle: 'Yatsı Namazı Vakti Girdi' }
];

function swTimeStrToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return -1;
    const parts = timeStr.split(':');
    if (parts.length < 2) return -1;
    return Number(parts[0]) * 60 + Number(parts[1]);
}

function checkSwPrayerSchedule() {
    if (!swPrayerSchedule || !swPrayerSchedule.notificationsEnabled || !swPrayerSchedule.todayTimings) {
        return;
    }
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (swPrayerSchedule.todayKey !== todayKey) return;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    SW_VAKIT_META.forEach((v) => {
        const vakitHM = swPrayerSchedule.todayTimings[v.key];
        if (!vakitHM) return;
        const vakitMin = swTimeStrToMinutes(vakitHM);
        if (vakitMin < 0) return;

        const diff = nowMinutes - vakitMin;
        const logKey = `${todayKey}_${swPrayerSchedule.cityId}_${v.key}`;

        if (diff >= 0 && diff <= 20 && !swPrayerSchedule.notifiedLog[logKey]) {
            swPrayerSchedule.notifiedLog[logKey] = true;
            if (self.registration && typeof self.registration.showNotification === 'function') {
                self.registration.showNotification(`BakVakitGeldi — ${v.notifTitle}`, {
                    body: `${swPrayerSchedule.cityName} için ${v.label} vakti girdi (${vakitHM}). Haydi namaza!`,
                    icon: 'logo.png?v=2',
                    badge: 'logo.png?v=2',
                    tag: `bakvakitgeldi-ezan-${logKey}`,
                    renotify: true,
                    vibrate: [200, 100, 200]
                }).catch(() => null);
            }
        }
    });
}

// Kurulum: Beklemeden yeni Service Worker'ı devreye al
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => null)
    );
});

// İstemciden gelen SKIP_WAITING ve SYNC_PRAYER_SCHEDULE mesajlarını dinle
self.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data.type === 'SYNC_PRAYER_SCHEDULE') {
        swPrayerSchedule = event.data;
        checkSwPrayerSchedule();
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
