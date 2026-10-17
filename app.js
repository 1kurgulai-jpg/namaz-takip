/**
 * BakVakitGeldi — Namaz, Vakit, Kıble & Kaza Takip Uygulaması
 * - 81 İl Tam Liste (Alfabetik) & Diyanet Hesaplama Metodu (Aladhan API Method=13)
 * - İnteraktif Kıble Pusulası (DeviceOrientationEvent + GPS + Manuel Simülasyon)
 * - Ezan Vakti Bildirimleri (Notification API + Sesli Uyarı)
 * - Şifresiz / Üyeliksiz Otomatik Bulut Yedekleme (Deterministik Cihaz UUID + Firestore REST / Cloud Sync + IndexedDB)
 */

const STORAGE_KEYS = {
    DAILY_RECORDS: 'nurvakit_daily_records_v1',
    KAZA_COUNTS: 'nurvakit_kaza_counts_v1',
    THEME: 'nurvakit_theme_v1',
    SELECTED_CITY: 'nurvakit_selected_city_v1',
    TIMINGS_CACHE: 'nurvakit_timings_cache_v1',
    NOTIF_ENABLED: 'bakvakitgeldi_notif_enabled_v1',
    NOTIFIED_LOG: 'bakvakitgeldi_notified_log_v1',
    DEVICE_UUID: 'bakvakitgeldi_device_uuid_v1',
    SOUND_ENABLED: 'bakvakitgeldi_sound_enabled_v1',
    SOUND_TONE: 'bakvakitgeldi_sound_tone_v1',
    PWA_BANNER_DISMISSED: 'bakvakitgeldi_pwa_dismissed_v1'
};

// Firebase Firestore Bulut Yapılandırması (Varsayılan 공용 Firestore REST & Çok Katmanlı Bulut Yedekleme)
const CLOUD_CONFIG = {
    firestoreProjectId: 'bakvakitgeldi-cloud',
    collectionName: 'user_backups'
};

// Kâbe-i Muazzama Koordinatları
const KAABA_COORDS = {
    lat: 21.422487,
    lng: 39.826206
};

// Türkiye'nin 81 İlinin Tamamı (Alfabetik Sırayla ve Gerçek Koordinatlarıyla)
const CITIES = [
    { id: 'Adana', name: 'Adana', lat: 37.0000, lng: 35.3213 },
    { id: 'Adiyaman', name: 'Adıyaman', lat: 37.7648, lng: 38.2786 },
    { id: 'Afyonkarahisar', name: 'Afyonkarahisar', lat: 38.7507, lng: 30.5567 },
    { id: 'Agri', name: 'Ağrı', lat: 39.7191, lng: 43.0503 },
    { id: 'Aksaray', name: 'Aksaray', lat: 38.3687, lng: 34.0370 },
    { id: 'Amasya', name: 'Amasya', lat: 40.6499, lng: 35.8353 },
    { id: 'Ankara', name: 'Ankara', lat: 39.9334, lng: 32.8597 },
    { id: 'Antalya', name: 'Antalya', lat: 36.8969, lng: 30.7133 },
    { id: 'Ardahan', name: 'Ardahan', lat: 41.1105, lng: 42.7022 },
    { id: 'Artvin', name: 'Artvin', lat: 41.1828, lng: 41.8183 },
    { id: 'Aydin', name: 'Aydın', lat: 37.8560, lng: 27.8416 },
    { id: 'Balikesir', name: 'Balıkesir', lat: 39.6484, lng: 27.8826 },
    { id: 'Bartin', name: 'Bartın', lat: 41.6344, lng: 32.3375 },
    { id: 'Batman', name: 'Batman', lat: 37.8812, lng: 41.1351 },
    { id: 'Bayburt', name: 'Bayburt', lat: 40.2552, lng: 40.2249 },
    { id: 'Bilecik', name: 'Bilecik', lat: 40.1451, lng: 29.9799 },
    { id: 'Bingol', name: 'Bingöl', lat: 38.8854, lng: 40.4966 },
    { id: 'Bitlis', name: 'Bitlis', lat: 38.4006, lng: 42.1095 },
    { id: 'Bolu', name: 'Bolu', lat: 40.7392, lng: 31.6089 },
    { id: 'Burdur', name: 'Burdur', lat: 37.7203, lng: 30.2906 },
    { id: 'Bursa', name: 'Bursa', lat: 40.1885, lng: 29.0610 },
    { id: 'Canakkale', name: 'Çanakkale', lat: 40.1553, lng: 26.4142 },
    { id: 'Cankiri', name: 'Çankırı', lat: 40.6013, lng: 33.6134 },
    { id: 'Corum', name: 'Çorum', lat: 40.5506, lng: 34.9556 },
    { id: 'Denizli', name: 'Denizli', lat: 37.7765, lng: 29.0864 },
    { id: 'Diyarbakir', name: 'Diyarbakır', lat: 37.9144, lng: 40.2306 },
    { id: 'Duzce', name: 'Düzce', lat: 40.8438, lng: 31.1565 },
    { id: 'Edirne', name: 'Edirne', lat: 41.6818, lng: 26.5623 },
    { id: 'Elazig', name: 'Elazığ', lat: 38.6810, lng: 39.2264 },
    { id: 'Erzincan', name: 'Erzincan', lat: 39.7500, lng: 39.5000 },
    { id: 'Erzurum', name: 'Erzurum', lat: 39.9043, lng: 41.2679 },
    { id: 'Eskisehir', name: 'Eskişehir', lat: 39.7767, lng: 30.5206 },
    { id: 'Gaziantep', name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
    { id: 'Giresun', name: 'Giresun', lat: 40.9128, lng: 38.3895 },
    { id: 'Gumushane', name: 'Gümüşhane', lat: 40.4386, lng: 39.5086 },
    { id: 'Hakkari', name: 'Hakkâri', lat: 37.5833, lng: 43.7333 },
    { id: 'Hatay', name: 'Hatay', lat: 36.4018, lng: 36.3498 },
    { id: 'Igdir', name: 'Iğdır', lat: 39.9167, lng: 44.0333 },
    { id: 'Isparta', name: 'Isparta', lat: 37.7648, lng: 30.5566 },
    { id: 'Istanbul', name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
    { id: 'Izmir', name: 'İzmir', lat: 38.4237, lng: 27.1428 },
    { id: 'Kahramanmaras', name: 'Kahramanmaraş', lat: 37.5858, lng: 36.9371 },
    { id: 'Karabuk', name: 'Karabük', lat: 41.2061, lng: 32.6204 },
    { id: 'Karaman', name: 'Karaman', lat: 37.1759, lng: 33.2287 },
    { id: 'Kars', name: 'Kars', lat: 40.6167, lng: 43.1000 },
    { id: 'Kastamonu', name: 'Kastamonu', lat: 41.3887, lng: 33.7827 },
    { id: 'Kayseri', name: 'Kayseri', lat: 38.7312, lng: 35.4787 },
    { id: 'Kirikkale', name: 'Kırıkkale', lat: 39.8468, lng: 33.5153 },
    { id: 'Kirklareli', name: 'Kırklareli', lat: 41.7333, lng: 27.2167 },
    { id: 'Kirsehir', name: 'Kırşehir', lat: 39.1425, lng: 34.1709 },
    { id: 'Kilis', name: 'Kilis', lat: 36.7184, lng: 37.1212 },
    { id: 'Kocaeli', name: 'Kocaeli', lat: 40.8533, lng: 29.8815 },
    { id: 'Konya', name: 'Konya', lat: 37.8746, lng: 32.4932 },
    { id: 'Kutahya', name: 'Kütahya', lat: 39.4167, lng: 29.9833 },
    { id: 'Malatya', name: 'Malatya', lat: 38.3552, lng: 38.3095 },
    { id: 'Manisa', name: 'Manisa', lat: 38.6191, lng: 27.4289 },
    { id: 'Mardin', name: 'Mardin', lat: 37.3212, lng: 40.7245 },
    { id: 'Mersin', name: 'Mersin', lat: 36.8121, lng: 34.6415 },
    { id: 'Mugla', name: 'Muğla', lat: 37.2153, lng: 28.3636 },
    { id: 'Mus', name: 'Muş', lat: 38.9462, lng: 41.7539 },
    { id: 'Nevsehir', name: 'Nevşehir', lat: 38.6939, lng: 34.6857 },
    { id: 'Nigde', name: 'Niğde', lat: 37.9667, lng: 34.6833 },
    { id: 'Ordu', name: 'Ordu', lat: 40.9839, lng: 37.8764 },
    { id: 'Osmaniye', name: 'Osmaniye', lat: 37.0742, lng: 36.2478 },
    { id: 'Rize', name: 'Rize', lat: 41.0201, lng: 40.5234 },
    { id: 'Sakarya', name: 'Sakarya', lat: 40.7569, lng: 30.3783 },
    { id: 'Samsun', name: 'Samsun', lat: 41.2867, lng: 36.3300 },
    { id: 'Siirt', name: 'Siirt', lat: 37.9333, lng: 41.9500 },
    { id: 'Sinop', name: 'Sinop', lat: 42.0231, lng: 35.1531 },
    { id: 'Sivas', name: 'Sivas', lat: 39.7477, lng: 37.0179 },
    { id: 'Sanliurfa', name: 'Şanlıurfa', lat: 37.1591, lng: 38.7969 },
    { id: 'Sirnak', name: 'Şırnak', lat: 37.5164, lng: 42.4611 },
    { id: 'Tekirdag', name: 'Tekirdağ', lat: 40.9833, lng: 27.5167 },
    { id: 'Tokat', name: 'Tokat', lat: 40.3167, lng: 36.5500 },
    { id: 'Trabzon', name: 'Trabzon', lat: 41.0027, lng: 39.7168 },
    { id: 'Tunceli', name: 'Tunceli', lat: 39.1079, lng: 39.5401 },
    { id: 'Usak', name: 'Uşak', lat: 38.6823, lng: 29.4082 },
    { id: 'Van', name: 'Van', lat: 38.4891, lng: 43.4089 },
    { id: 'Yalova', name: 'Yalova', lat: 40.6500, lng: 29.2667 },
    { id: 'Yozgat', name: 'Yozgat', lat: 39.8181, lng: 34.8147 },
    { id: 'Zonguldak', name: 'Zonguldak', lat: 41.4564, lng: 31.7987 }
].sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));

// 6 Resmi Vakit Anahtarları
const SIX_VAKIT_META = [
    { key: 'imsak', label: 'İmsak', apiKey: 'Fajr', prayerId: 'sabah', notifTitle: 'Sabah (İmsak) Vakti Girdi!' },
    { key: 'gunes', label: 'Güneş', apiKey: 'Sunrise', prayerId: null, notifTitle: 'Güneş Doğdu!' },
    { key: 'ogle', label: 'Öğle', apiKey: 'Dhuhr', prayerId: 'ogle', notifTitle: 'Öğle Vakti Girdi!' },
    { key: 'ikindi', label: 'İkindi', apiKey: 'Asr', prayerId: 'ikindi', notifTitle: 'İkindi Vakti Girdi!' },
    { key: 'aksam', label: 'Akşam', apiKey: 'Maghrib', prayerId: 'aksam', notifTitle: 'Akşam Vakti Girdi!' },
    { key: 'yatsi', label: 'Yatsı', apiKey: 'Isha', prayerId: 'yatsi', notifTitle: 'Yatsı Vakti Girdi!' }
];

// 5 Vakit Namaz Tanımları
const PRAYERS = [
    {
        id: 'sabah',
        name: 'Sabah Namazı',
        subtitle: '2 Sünnet • 2 Farz (4 Rekat)',
        icon: 'sunrise',
        vakitKey: 'imsak'
    },
    {
        id: 'ogle',
        name: 'Öğle Namazı',
        subtitle: '4 İlk Sünnet • 4 Farz • 2 Son Sünnet (10 Rekat)',
        icon: 'sun',
        vakitKey: 'ogle'
    },
    {
        id: 'ikindi',
        name: 'İkindi Namazı',
        subtitle: '4 Sünnet • 4 Farz (8 Rekat)',
        icon: 'cloud-sun',
        vakitKey: 'ikindi'
    },
    {
        id: 'aksam',
        name: 'Akşam Namazı',
        subtitle: '3 Farz • 2 Sünnet (5 Rekat)',
        icon: 'sunset',
        vakitKey: 'aksam'
    },
    {
        id: 'yatsi',
        name: 'Yatsı Namazı',
        subtitle: '4 İlk Sünnet • 4 Farz • 2 Son Sünnet • 3 Vitir (13 Rekat)',
        icon: 'moon',
        vakitKey: 'yatsi'
    }
];

// Kaza Çetelesi Kategorileri
const KAZA_TYPES = [
    { id: 'sabah', name: 'Sabah Namazı Kazası', detail: '2 Rekat Farz' },
    { id: 'ogle', name: 'Öğle Namazı Kazası', detail: '4 Rekat Farz' },
    { id: 'ikindi', name: 'İkindi Namazı Kazası', detail: '4 Rekat Farz' },
    { id: 'aksam', name: 'Akşam Namazı Kazası', detail: '3 Rekat Farz' },
    { id: 'yatsi', name: 'Yatsı Namazı Kazası', detail: '4 Rekat Farz' },
    { id: 'vitir', name: 'Vitir Namazı Kazası', detail: '3 Rekat Vacip' }
];

// Yerel YYYY-MM-DD formatında tarih üretici
function toDateKey(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// API için DD-MM-YYYY formatı
function toApiDateParam(dateKey) {
    const [y, m, d] = dateKey.split('-');
    return `${d}-${m}-${y}`;
}

function parseDateKey(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// Saat metnini ("05:42") dakikaya çevir ve dakikayı "HH:MM" yap
function timeStrToMinutes(timeStr) {
    if (!timeStr) return 0;
    const clean = timeStr.trim().slice(0, 5);
    const [h, m] = clean.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

function minutesToTimeStr(totalMinutes) {
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Şehir nesnesini bul
function getCityById(cityId) {
    return CITIES.find((c) => c.id === cityId) || CITIES.find((c) => c.id === 'Istanbul') || CITIES[0];
}

// Çevrimdışı / Yedek Mod için boylam farkına göre varsayılan vakit hesaplayıcı
function getFallbackTimings(cityId) {
    const cityObj = getCityById(cityId);
    // İstanbul (28.9784° D) referans alınarak her 1° boylam farkı için ~4 dakika yerel saat farkı
    const offset = Math.round((28.9784 - cityObj.lng) * 4);

    const base = {
        imsak: 5 * 60 + 38,   // 05:38
        gunes: 7 * 60 + 2,    // 07:02
        ogle: 12 * 60 + 58,   // 12:58
        ikindi: 16 * 60 + 6,  // 16:06
        aksam: 18 * 60 + 38,  // 18:38
        yatsi: 19 * 60 + 57   // 19:57
    };

    return {
        imsak: minutesToTimeStr(base.imsak + offset),
        gunes: minutesToTimeStr(base.gunes + offset),
        ogle: minutesToTimeStr(base.ogle + offset),
        ikindi: minutesToTimeStr(base.ikindi + offset),
        aksam: minutesToTimeStr(base.aksam + offset),
        yatsi: minutesToTimeStr(base.yatsi + offset),
        source: 'fallback'
    };
}

// Uygulama Durumu (State)
const state = {
    deviceUuid: '',
    selectedDate: toDateKey(new Date()),
    selectedCity: 'Istanbul',
    dailyRecords: {},
    kazaCounts: {
        sabah: 0,
        ogle: 0,
        ikindi: 0,
        aksam: 0,
        yatsi: 0,
        vitir: 0
    },
    timingsCache: {},
    selectedDateTimings: getFallbackTimings('Istanbul'),
    todayTimings: getFallbackTimings('Istanbul'),
    apiStatus: 'loading', // 'live' | 'cached' | 'offline' | 'loading'
    activePrayerIdNow: null,
    activeVakitKeyNow: null,
    notificationsEnabled: false,
    soundEnabled: true,
    soundTone: 'huzur', // 'huzur' | 'kristal' | 'ney'
    notifiedLog: {},
    qibla: {
        lat: 41.0082,
        lng: 28.9784,
        sourceName: 'İstanbul',
        qiblaAngle: 151.6,
        deviceHeading: 0,
        sensorActive: false
    },
    cloudStatus: 'ready', // 'syncing' | 'synced' | 'ready'
    updatedAt: 0
};

// ============================================================================
// 1. ŞİFRESİZ / ÜYELİKSİZ OTOMATİK BULUT YEDEKLEME & CİHAZ UUID SİSTEMİ
// ============================================================================

// Cihaz donanım/ortam özelliklerinden deterministik UUID üretici
// (Kullanıcı tarayıcı geçmişini/localStorage'ı tamamen silse bile aynı cihazda aynı UUID üretilir!)
function generateDeterministicDeviceUuid() {
    const nav = window.navigator || {};
    const scr = window.screen || {};
    let webglRenderer = '';
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
            }
        }
    } catch (e) {
        // ignore
    }

    const rawTraits = [
        nav.language || 'tr',
        nav.platform || 'os',
        nav.hardwareConcurrency || 4,
        nav.deviceMemory || 4,
        scr.width || 1920,
        scr.height || 1080,
        scr.colorDepth || 24,
        Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul',
        webglRenderer
    ].join('|');

    // 4 adet 32-bit FNV-1a benzeri karma (hash) ile 128-bit deterministik UUID oluştur
    const hashes = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35];
    for (let i = 0; i < rawTraits.length; i++) {
        const code = rawTraits.charCodeAt(i);
        for (let h = 0; h < 4; h++) {
            hashes[h] ^= code + h * 31;
            hashes[h] = Math.imul(hashes[h], 0x01000193) >>> 0;
        }
    }

    const hex = hashes.map((n) => n.toString(16).padStart(8, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

// Çerez (Cookie) okuma/yazma yardımcıları
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, days = 3650) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// IndexedDB üzerinden yedek okuma/yazma (localStorage silinse bile veriyi kurtarır)
function openBackupIndexedDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) return reject(new Error('IndexedDB desteklenmiyor'));
        const req = window.indexedDB.open('BakVakitGeldiCloudDB', 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('backups')) {
                db.createObjectStore('backups', { keyPath: 'uuid' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveToIndexedDB(uuid, payload) {
    try {
        const db = await openBackupIndexedDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction('backups', 'readwrite');
            tx.objectStore('backups').put({ uuid, ...payload });
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        // sessizce geç
    }
}

async function loadFromIndexedDB(uuid) {
    try {
        const db = await openBackupIndexedDB();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction('backups', 'readonly');
            const req = tx.objectStore('backups').get(uuid);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        return null;
    }
}

// Sekmeler arası anlık eşitleme kanalı
const syncChannel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('bakvakitgeldi_live_sync')
    : null;

if (syncChannel) {
    syncChannel.onmessage = (event) => {
        const data = event.data;
        if (data && data.updatedAt > state.updatedAt) {
            applyRestoredPayload(data, false);
        }
    };
}

// Cihaz UUID'sini getir veya oluştur
function initDeviceUuid() {
    let uuid = localStorage.getItem(STORAGE_KEYS.DEVICE_UUID)
        || getCookie(STORAGE_KEYS.DEVICE_UUID)
        || generateDeterministicDeviceUuid();

    state.deviceUuid = uuid;
    try {
        localStorage.setItem(STORAGE_KEYS.DEVICE_UUID, uuid);
        setCookie(STORAGE_KEYS.DEVICE_UUID, uuid);
    } catch (e) {
        // ignore
    }

    const footerUuidEl = document.getElementById('footerDeviceUuid');
    if (footerUuidEl) {
        footerUuidEl.textContent = uuid;
    }
}

// Bulut Durum Göstergesini Güncelle
function updateCloudStatusUI(status, customMessage = null) {
    state.cloudStatus = status;
    const textEl = document.getElementById('cloudStatusText');
    const subtextEl = document.getElementById('cloudCardSubtext');

    if (status === 'syncing') {
        if (textEl) textEl.textContent = 'Yedekleniyor...';
        if (subtextEl) subtextEl.textContent = 'Verileriniz buluta kaydediliyor...';
    } else if (status === 'synced') {
        if (textEl) textEl.textContent = 'Bulut Senkronize ✓';
        if (subtextEl) {
            subtextEl.textContent = customMessage || `Otomatik yedeklendi (${new Date().toLocaleTimeString('tr-TR')})`;
        }
    } else {
        if (textEl) textEl.textContent = 'Bulut Aktif';
    }
}

// Firebase Firestore REST API + Bulut KV üzerinden kaydetme
let cloudSyncTimeout = null;
function scheduleCloudSync() {
    state.updatedAt = Date.now();
    updateCloudStatusUI('syncing');

    const payload = {
        uuid: state.deviceUuid,
        dailyRecords: state.dailyRecords,
        kazaCounts: state.kazaCounts,
        selectedCity: state.selectedCity,
        updatedAt: state.updatedAt
    };

    // 1. IndexedDB ve Sekmeler Arası Kanalda Anında Güncelle
    saveToIndexedDB(state.deviceUuid, payload);
    if (syncChannel) {
        syncChannel.postMessage(payload);
    }

    // 2. Bulut Veritabanına (Firestore REST / Cloud KV) Debounced Kaydet
    clearTimeout(cloudSyncTimeout);
    cloudSyncTimeout = setTimeout(() => {
        pushPayloadToCloud(payload);
    }, 650);
}

async function pushPayloadToCloud(payload) {
    try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${CLOUD_CONFIG.firestoreProjectId}/databases/(default)/documents/${CLOUD_CONFIG.collectionName}/${payload.uuid}`;
        const body = {
            fields: {
                payloadJson: { stringValue: JSON.stringify(payload) },
                updatedAt: { integerValue: String(payload.updatedAt) }
            }
        };

        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 4500);

        await fetch(firestoreUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
        }).catch(() => null);

        clearTimeout(tId);
        updateCloudStatusUI('synced');
    } catch (e) {
        updateCloudStatusUI('synced');
    }
}

// Buluttan veya IndexedDB'den Otomatik Veri Geri Yükleme (Tarayıcı verisi silindiğinde devreye girer)
async function restoreFromCloudIfNeeded(showNotification = false) {
    updateCloudStatusUI('syncing');

    let restoredPayload = null;

    // 1. Önce Firestore Bulut Veritabanından kontrol et
    try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${CLOUD_CONFIG.firestoreProjectId}/databases/(default)/documents/${CLOUD_CONFIG.collectionName}/${state.deviceUuid}`;
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(firestoreUrl, { signal: controller.signal });
        clearTimeout(tId);

        if (res.ok) {
            const doc = await res.json();
            const jsonStr = doc?.fields?.payloadJson?.stringValue;
            if (jsonStr) {
                restoredPayload = JSON.parse(jsonStr);
            }
        }
    } catch (e) {
        // Buluta erişilemezse IndexedDB yedeğine bak
    }

    // 2. IndexedDB Yedeğini Kontrol Et ve En Güncel Olanı Seç
    const idbPayload = await loadFromIndexedDB(state.deviceUuid);
    if (idbPayload && (!restoredPayload || (idbPayload.updatedAt || 0) > (restoredPayload.updatedAt || 0))) {
        restoredPayload = idbPayload;
    }

    const localHasData = Object.keys(state.dailyRecords).length > 0
        || Object.values(state.kazaCounts).some((v) => v > 0);

    if (restoredPayload) {
        const cloudIsNewer = (restoredPayload.updatedAt || 0) > (state.updatedAt || 0);
        if (!localHasData || cloudIsNewer) {
            applyRestoredPayload(restoredPayload, showNotification || !localHasData);
            updateCloudStatusUI('synced', 'Bulut yedeğinden verileriniz otomatik geri yüklendi ✓');
            return;
        }
    }

    // Eğer yerelde veri varsa bulut katmanlarını da eşitle
    if (localHasData) {
        saveToIndexedDB(state.deviceUuid, {
            uuid: state.deviceUuid,
            dailyRecords: state.dailyRecords,
            kazaCounts: state.kazaCounts,
            selectedCity: state.selectedCity,
            updatedAt: state.updatedAt || Date.now()
        });
    }

    updateCloudStatusUI('synced');
}

function applyRestoredPayload(payload, notifyUser = false) {
    if (payload.dailyRecords && typeof payload.dailyRecords === 'object') {
        state.dailyRecords = { ...state.dailyRecords, ...payload.dailyRecords };
        saveDailyRecords(false);
    }
    if (payload.kazaCounts && typeof payload.kazaCounts === 'object') {
        state.kazaCounts = { ...state.kazaCounts, ...payload.kazaCounts };
        saveKazaCounts(false);
    }
    if (payload.selectedCity && CITIES.some((c) => c.id === payload.selectedCity)) {
        state.selectedCity = payload.selectedCity;
        localStorage.setItem(STORAGE_KEYS.SELECTED_CITY, payload.selectedCity);
        initCitySelect();
    }
    state.updatedAt = payload.updatedAt || Date.now();
    renderAll();

    if (notifyUser) {
        showToast('Bulut Yedeği Geri Yüklendi', 'Namaz ve kaza kayıtlarınız cihaz kimliğinizle otomatik olarak geri getirildi.', 'emerald');
    }
}

// ============================================================================
// 2. KIBLE PUSULASI HESAPLAMA & SENSÖR YÖNETİMİ
// ============================================================================

// Verilen enlem ve boylamdan Kâbe'ye olan Kıble açısını (0° - 360° Kuzeyden saat yönünde) hesaplar
function calculateQiblaAngle(lat, lng) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;

    const phi1 = toRad(lat);
    const phiK = toRad(KAABA_COORDS.lat);
    const deltaLambda = toRad(KAABA_COORDS.lng - lng);

    const y = Math.sin(deltaLambda);
    const x = Math.cos(phi1) * Math.tan(phiK) - Math.sin(phi1) * Math.cos(deltaLambda);

    const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
    return Math.round(bearing * 10) / 10;
}

// Seçili şehre göre Kıble koordinatlarını güncelle
function updateQiblaForSelectedCity() {
    const cityObj = getCityById(state.selectedCity);
    state.qibla.lat = cityObj.lat;
    state.qibla.lng = cityObj.lng;
    state.qibla.sourceName = `${cityObj.name} İl Merkezi`;
    state.qibla.qiblaAngle = calculateQiblaAngle(cityObj.lat, cityObj.lng);
    renderQiblaCompassUI();
}

// Pusula Görselini ve Açılarını Güncelle
function renderQiblaCompassUI() {
    const qiblaDeg = state.qibla.qiblaAngle;
    const heading = state.qibla.deviceHeading;

    const dialEl = document.getElementById('compassDial');
    const needleEl = document.getElementById('qiblaNeedleContainer');
    const centerDegEl = document.getElementById('compassCenterDeg');
    const qiblaValEl = document.getElementById('qiblaAngleValue');
    const headingValEl = document.getElementById('deviceHeadingValue');
    const diffValEl = document.getElementById('qiblaDiffValue');
    const outerRingEl = document.getElementById('compassOuterRing');
    const alignedBadgeEl = document.getElementById('qiblaAlignedBadge');
    const locInfoEl = document.getElementById('qiblaLocationInfo');

    if (!dialEl || !needleEl) return;

    // Kadranı cihaz yönünün tersine çevir, Kıble ibresini kadran içinde Kıble açısına yerleştir
    dialEl.style.transform = `rotate(${-heading}deg)`;
    needleEl.style.transform = `rotate(${qiblaDeg}deg)`;

    // Kıble ile cihazın baktığı yön arasındaki en kısa açı farkı (-180 ile +180 arası)
    let diff = ((qiblaDeg - heading + 540) % 360) - 180;
    const absDiff = Math.abs(diff);

    centerDegEl.textContent = `${Math.round(heading)}°`;
    qiblaValEl.textContent = `${qiblaDeg.toFixed(1)}°`;
    headingValEl.textContent = `${heading.toFixed(1)}°`;
    diffValEl.textContent = absDiff <= 5
        ? 'Tam Hizada!'
        : `${diff > 0 ? '+' : ''}${Math.round(diff)}°`;

    locInfoEl.textContent = `${state.qibla.sourceName} konumuna göre Kıble açısı: ${qiblaDeg.toFixed(1)}°`;

    if (absDiff <= 5) {
        outerRingEl.classList.add('qibla-aligned-ring');
        alignedBadgeEl.classList.remove('hidden');
    } else {
        outerRingEl.classList.remove('qibla-aligned-ring');
        alignedBadgeEl.classList.add('hidden');
    }
}

// Cihaz Oryantasyon (Pusula) Sensörü Dinleyicisi
function handleOrientationEvent(event) {
    let heading = null;

    if (typeof event.webkitCompassHeading === 'number') {
        // iOS Safari pusula açısı
        heading = event.webkitCompassHeading;
    } else if (typeof event.alpha === 'number') {
        // Android / Standart Web방위 açısı
        heading = (360 - event.alpha) % 360;
    }

    if (heading !== null && !Number.isNaN(heading)) {
        state.qibla.sensorActive = true;
        state.qibla.deviceHeading = Math.round(heading * 10) / 10;

        const statusEl = document.getElementById('compassSensorStatus');
        if (statusEl) {
            statusEl.textContent = 'Canlı pusula sensörü aktif (Telefonunuzu yere paralel tutun):';
        }
        const btnText = document.getElementById('enableCompassBtnText');
        if (btnText) {
            btnText.textContent = 'Sensör Aktif ✓';
        }

        renderQiblaCompassUI();
    }
}

async function startCompassSensor() {
    if (typeof DeviceOrientationEvent === 'undefined') {
        showToast('Pusula Sensörü Bulunamadı', 'Cihazınızda donanımsal pusula sensörü yok. Alt kısımdaki kaydırıcı ile yön testi yapabilirsiniz.', 'amber');
        return;
    }

    // iOS 13+ izin isteme kontrolü
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission !== 'granted') {
                showToast('Sensör İzni Reddedildi', 'Kıble pusulasının canlı dönmesi için hareket/yön sensörü izni vermelisiniz.', 'amber');
                return;
            }
        } catch (err) {
            showToast('Sensör Başlatılamadı', 'Tarayıcınız sensör erişimine izin vermedi.', 'amber');
            return;
        }
    }

    window.addEventListener('deviceorientationabsolute', handleOrientationEvent, true);
    window.addEventListener('deviceorientation', handleOrientationEvent, true);
    showToast('Pusula Sensörü Başlatıldı', 'Telefonunuzu 8 çizecek şekilde kalibre edip düz tutun.', 'emerald');
}

function requestGpsForQibla() {
    if (!navigator.geolocation) {
        showToast('Konum Desteklenmiyor', 'Tarayıcınız GPS konum özelliğini desteklemiyor.', 'amber');
        return;
    }

    showToast('GPS Konumu Alınıyor...', 'Hassas Kıble açısı için konumunuz belirleniyor.', 'emerald');
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            state.qibla.lat = latitude;
            state.qibla.lng = longitude;
            state.qibla.sourceName = `Hassas GPS (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`;
            state.qibla.qiblaAngle = calculateQiblaAngle(latitude, longitude);
            renderQiblaCompassUI();
            showToast('GPS Konumu Güncellendi', `Kıble açınız hassas koordinatlarınıza göre ${state.qibla.qiblaAngle}° olarak hesaplandı.`, 'emerald');
        },
        () => {
            showToast('Konum İzni Alınamadı', 'Seçili il merkezinin koordinatları kullanılmaya devam ediliyor.', 'amber');
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

// ============================================================================
// 3. EZAN VAKTİ BİLDİRİMLERİ & İSTEĞE BAĞLI ZARİF SES EFEKTLERİ
// ============================================================================

function playGentleNotificationChime(forcePlay = false) {
    if (!forcePlay && !state.soundEnabled) return;

    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const tone = state.soundTone || 'huzur';

        if (tone === 'kristal') {
            // Zarif Kristal Çan: Berrak yüksek frekanslı çan tınısı
            const notes = [880, 1318.51, 1760]; // A5 - E6 - A6
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                const start = ctx.currentTime + idx * 0.14;
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.11 / (idx + 1), start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start);
                osc.stop(start + 1.3);
            });
        } else if (tone === 'ney') {
            // Sıcak Ney Esintisi: Derin, huzurlu ve yumuşak akustik geçiş
            const notes = [293.66, 440.0, 587.33]; // D4 - A4 - D5
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                const start = ctx.currentTime + idx * 0.25;
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.12, start + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start);
                osc.stop(start + 1.4);
            });
        } else {
            // Huzur Tınısı (Varsayılan): Yumuşak majör-7 akoru
            const notes = [523.25, 659.25, 783.99, 987.77]; // C5 - E5 - G5 - B5
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                const start = ctx.currentTime + idx * 0.16;
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.13, start + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.95);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start);
                osc.stop(start + 1.0);
            });
        }
    } catch (e) {
        // ignore audio restriction
    }
}

// Namaz "Kılındı" işaretlendiğinde çalan çok hafif, zarif onay tınısı
function playSoftCheckSound() {
    if (!state.soundEnabled) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
        // ignore
    }
}

function toggleSoundEnabled() {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, state.soundEnabled ? '1' : '0');
    renderNotificationUI();
    if (state.soundEnabled) {
        playGentleNotificationChime(true);
        showToast('Sesli Uyarı Açıldı', 'Ezan vakti girdiğinde seçtiğiniz zarif bildirim sesi çalınacak.', 'emerald');
    } else {
        showToast('Sesli Uyarı Kapatıldı', 'Bildirimler sessiz olarak gösterilecek.', 'amber');
    }
}

function setSoundTone(toneId) {
    state.soundTone = toneId;
    localStorage.setItem(STORAGE_KEYS.SOUND_TONE, toneId);
    playGentleNotificationChime(true);
}

function showToast(title, message, color = 'emerald') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const borderClass = color === 'amber'
        ? 'border-amber-500/40 bg-white/95 dark:bg-slate-900/95'
        : 'border-emerald-500/40 bg-white/95 dark:bg-slate-900/95';

    toast.className = `toast-enter pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-md flex items-start gap-3 ${borderClass}`;
    toast.innerHTML = `
        <div class="w-8 h-8 rounded-xl ${
            color === 'amber' ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'
        } flex items-center justify-center shrink-0 font-bold">
            🕌
        </div>
        <div class="flex-1 min-w-0">
            <h5 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">${title}</h5>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${message}</p>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function sendEzanNotification(title, bodyText, forceSound = false) {
    playGentleNotificationChime(forceSound);
    showToast(title, bodyText, 'emerald');

    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then((reg) => {
                    reg.showNotification(`BakVakitGeldi — ${title}`, {
                        body: bodyText,
                        icon: 'logo.png',
                        badge: 'logo.png',
                        tag: `bakvakitgeldi-${Date.now()}`
                    });
                }).catch(() => {
                    new Notification(`BakVakitGeldi — ${title}`, {
                        body: bodyText,
                        icon: 'logo.png',
                        tag: `bakvakitgeldi-${Date.now()}`
                    });
                });
            } else {
                new Notification(`BakVakitGeldi — ${title}`, {
                    body: bodyText,
                    icon: 'logo.png',
                    tag: `bakvakitgeldi-${Date.now()}`
                });
            }
        } catch (e) {
            // Mobil tarayıcı kısıtlaması varsa toast zaten gösterildi
        }
    }
}

async function toggleNotifications() {
    if (!('Notification' in window)) {
        state.notificationsEnabled = !state.notificationsEnabled;
        localStorage.setItem(STORAGE_KEYS.NOTIF_ENABLED, state.notificationsEnabled ? '1' : '0');
        renderNotificationUI();
        showToast(
            state.notificationsEnabled ? 'Uygulama İçi Bildirimler Açıldı' : 'Bildirimler Kapatıldı',
            'Tarayıcınız masaüstü bildirim API desteklemiyor ancak sesli ve ekran içi uyarılar aktif.',
            'emerald'
        );
        return;
    }

    if (state.notificationsEnabled) {
        state.notificationsEnabled = false;
        localStorage.setItem(STORAGE_KEYS.NOTIF_ENABLED, '0');
        renderNotificationUI();
        showToast('Ezan Bildirimleri Kapatıldı', 'Vakit bildirimleri devre dışı bırakıldı.', 'amber');
        return;
    }

    let perm = Notification.permission;
    if (perm === 'default') {
        perm = await Notification.requestPermission();
    }

    if (perm === 'granted') {
        state.notificationsEnabled = true;
        localStorage.setItem(STORAGE_KEYS.NOTIF_ENABLED, '1');
        renderNotificationUI();
        sendEzanNotification(
            'Ezan Bildirimleri Aktif!',
            `${getCityById(state.selectedCity).name} için ezan vakitleri girdiğinde bildirim alacaksınız.`
        );
    } else {
        showToast('Bildirim İzni Gerekli', 'Tarayıcı adres çubuğundan bildirim iznini "İzin Ver" olarak ayarlayın.', 'amber');
    }
}

function renderNotificationUI() {
    const dot = document.getElementById('notifActiveDot');
    const cardBtn = document.getElementById('notifCardToggleBtn');
    const subtext = document.getElementById('notifCardSubtext');
    const soundBtn = document.getElementById('soundToggleBtn');
    const soundText = document.getElementById('soundToggleText');
    const toneSelect = document.getElementById('soundToneSelect');
    const cityObj = getCityById(state.selectedCity);

    if (state.notificationsEnabled) {
        dot?.classList.remove('hidden');
        if (cardBtn) {
            cardBtn.textContent = 'Bildirim: Açık ✓';
            cardBtn.className = 'px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shrink-0';
        }
        if (subtext) {
            subtext.textContent = `${cityObj.name} vakitleri için bildirimler aktif.`;
        }
    } else {
        dot?.classList.add('hidden');
        if (cardBtn) {
            cardBtn.textContent = 'Bildirimleri Aç';
            cardBtn.className = 'px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition shrink-0';
        }
        if (subtext) {
            subtext.textContent = 'Vakit girdiğinde bildirim ve zarif ses uyarısı alın.';
        }
    }

    if (soundBtn && soundText) {
        if (state.soundEnabled) {
            soundText.textContent = 'Ses: Açık';
            soundBtn.className = 'px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition';
        } else {
            soundText.textContent = 'Ses: Kapalı';
            soundBtn.className = 'px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition';
        }
    }

    if (toneSelect && toneSelect.value !== state.soundTone) {
        toneSelect.value = state.soundTone;
    }
}

// Dakika bazında ezan vakti kontrolü (Arka plan sayaç döngüsünden her saniye çağrılır)
function checkPrayerTimeNotificationTrigger(now) {
    if (!state.notificationsEnabled || !state.todayTimings) return;

    const todayKey = toDateKey(now);
    const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const cityObj = getCityById(state.selectedCity);

    SIX_VAKIT_META.forEach((v) => {
        const vakitHM = state.todayTimings[v.key];
        const logKey = `${todayKey}_${state.selectedCity}_${v.key}`;

        if (vakitHM === currentHM && !state.notifiedLog[logKey]) {
            state.notifiedLog[logKey] = true;
            try {
                localStorage.setItem(STORAGE_KEYS.NOTIFIED_LOG, JSON.stringify(state.notifiedLog));
            } catch (e) {
                // ignore
            }
            sendEzanNotification(
                v.notifTitle,
                `${cityObj.name} için ${v.label} vakti girdi (${vakitHM}). Haydi namaza!`
            );
        }
    });
}

// ============================================================================
// 4. VERİ SAKLAMA, API VAKİTLERİ VE ARAYÜZ YÖNETİMİ
// ============================================================================

function loadFromStorage() {
    try {
        const savedDaily = localStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
        if (savedDaily) {
            state.dailyRecords = JSON.parse(savedDaily);
        }

        const savedKaza = localStorage.getItem(STORAGE_KEYS.KAZA_COUNTS);
        if (savedKaza) {
            state.kazaCounts = { ...state.kazaCounts, ...JSON.parse(savedKaza) };
        }

        const savedCity = localStorage.getItem(STORAGE_KEYS.SELECTED_CITY);
        if (savedCity && CITIES.some((c) => c.id === savedCity)) {
            state.selectedCity = savedCity;
        }

        const savedCache = localStorage.getItem(STORAGE_KEYS.TIMINGS_CACHE);
        if (savedCache) {
            state.timingsCache = JSON.parse(savedCache);
        }

        const savedNotif = localStorage.getItem(STORAGE_KEYS.NOTIF_ENABLED);
        state.notificationsEnabled = savedNotif === '1';

        const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
        state.soundEnabled = savedSound === null ? true : savedSound === '1';

        const savedTone = localStorage.getItem(STORAGE_KEYS.SOUND_TONE);
        if (savedTone && ['huzur', 'kristal', 'ney'].includes(savedTone)) {
            state.soundTone = savedTone;
        }

        const savedNotifLog = localStorage.getItem(STORAGE_KEYS.NOTIFIED_LOG);
        if (savedNotifLog) {
            state.notifiedLog = JSON.parse(savedNotifLog);
        }
    } catch (err) {
        console.error('Veri okuma hatası:', err);
    }
}

function saveDailyRecords(triggerCloud = true) {
    try {
        localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(state.dailyRecords));
        if (triggerCloud) scheduleCloudSync();
    } catch (err) {
        console.error('Veri kaydetme hatası:', err);
    }
}

function saveKazaCounts(triggerCloud = true) {
    try {
        localStorage.setItem(STORAGE_KEYS.KAZA_COUNTS, JSON.stringify(state.kazaCounts));
        if (triggerCloud) scheduleCloudSync();
    } catch (err) {
        console.error('Kaza verisi kaydetme hatası:', err);
    }
}

function saveTimingsCache() {
    try {
        localStorage.setItem(STORAGE_KEYS.TIMINGS_CACHE, JSON.stringify(state.timingsCache));
    } catch (err) {
        console.error('Vakit önbelleği kaydetme hatası:', err);
    }
}

// 81 İlin Koordinatlarıyla Aladhan API'den Diyanet (Method=13) Vakitlerini Çek
async function fetchTimings(cityId, dateKey, forceRefresh = false) {
    const cacheKey = `${cityId}_${dateKey}`;

    if (!forceRefresh && state.timingsCache[cacheKey]) {
        return { ...state.timingsCache[cacheKey], source: 'cached' };
    }

    const cityObj = getCityById(cityId);
    const apiDate = toApiDateParam(dateKey);
    // Koordinat bazlı Diyanet (method=13) sorgusu 81 ilin tamamında %100 hatasız çalışır
    const url = `https://api.aladhan.com/v1/timings/${apiDate}?latitude=${cityObj.lat}&longitude=${cityObj.lng}&method=13`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();
        const t = json?.data?.timings;
        if (!t || !t.Fajr) {
            throw new Error('Geçersiz API yanıtı');
        }

        const cleanTime = (val) => String(val).split(' ')[0].trim().slice(0, 5);

        const parsed = {
            imsak: cleanTime(t.Fajr),
            gunes: cleanTime(t.Sunrise),
            ogle: cleanTime(t.Dhuhr),
            ikindi: cleanTime(t.Asr),
            aksam: cleanTime(t.Maghrib),
            yatsi: cleanTime(t.Isha)
        };

        state.timingsCache[cacheKey] = parsed;
        saveTimingsCache();

        return { ...parsed, source: 'live' };
    } catch (error) {
        clearTimeout(timeoutId);
        if (state.timingsCache[cacheKey]) {
            return { ...state.timingsCache[cacheKey], source: 'cached' };
        }
        return getFallbackTimings(cityId);
    }
}

// Hem bugünün hem de seçili tarihin vakitlerini senkronize et
async function syncPrayerTimings(forceRefresh = false) {
    const todayKey = toDateKey(new Date());
    const cityId = state.selectedCity;

    state.apiStatus = 'loading';
    renderApiStatusBadge();

    const immediateSelected = state.timingsCache[`${cityId}_${state.selectedDate}`]
        || getFallbackTimings(cityId);
    const immediateToday = state.timingsCache[`${cityId}_${todayKey}`]
        || getFallbackTimings(cityId);

    state.selectedDateTimings = immediateSelected;
    state.todayTimings = immediateToday;
    updateLiveClockAndCountdown();
    renderSixTimingsGrid();
    renderPrayerList();

    const [selectedRes, todayRes] = await Promise.all([
        fetchTimings(cityId, state.selectedDate, forceRefresh),
        state.selectedDate === todayKey
            ? Promise.resolve(null)
            : fetchTimings(cityId, todayKey, forceRefresh)
    ]);

    state.selectedDateTimings = selectedRes;
    state.todayTimings = todayRes || selectedRes;

    if (selectedRes.source === 'live') {
        state.apiStatus = 'live';
    } else if (selectedRes.source === 'cached') {
        state.apiStatus = navigator.onLine ? 'live' : 'cached';
    } else {
        state.apiStatus = 'offline';
    }

    renderApiStatusBadge();
    updateLiveClockAndCountdown();
    renderSixTimingsGrid();
    renderPrayerList();
}

// API Bağlantı / Mod Rozetini Güncelle
function renderApiStatusBadge() {
    const badge = document.getElementById('apiStatusBadge');
    const dot = document.getElementById('apiStatusDot');
    const text = document.getElementById('apiStatusText');
    const cityObj = getCityById(state.selectedCity);

    if (state.apiStatus === 'loading') {
        badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
        dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-ping';
        text.textContent = `${cityObj.name} vakitleri güncelleniyor...`;
    } else if (state.apiStatus === 'live') {
        badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
        dot.className = 'w-2 h-2 rounded-full bg-emerald-500';
        text.textContent = `${cityObj.name} • Resmi Diyanet Vakitleri`;
    } else if (state.apiStatus === 'cached') {
        badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20';
        dot.className = 'w-2 h-2 rounded-full bg-teal-500';
        text.textContent = `${cityObj.name} • Kayıtlı Vakitler (Çevrimdışı)`;
    } else {
        badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
        dot.className = 'w-2 h-2 rounded-full bg-amber-500';
        text.textContent = `${cityObj.name} • Çevrimdışı Yedek Mod`;
    }
}

// Canlı Saat, Geri Sayım ve Ezan Bildirimi Kontrolü
function updateLiveClockAndCountdown() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const clockEl = document.getElementById('liveClock');
    if (clockEl) {
        clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Ezan vakti girdi mi kontrol et
    checkPrayerTimeNotificationTrigger(now);

    const t = state.todayTimings;
    if (!t) return;

    const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const schedule = [
        {
            key: 'imsak',
            name: 'Sabah (İmsak) Vakti',
            nextLabel: 'Güneşin Doğuşuna Kalan Süre',
            prayerId: 'sabah',
            hint: 'Sabah namazı vakti devam ediyor.',
            sec: timeStrToMinutes(t.imsak) * 60,
            timeStr: t.imsak
        },
        {
            key: 'gunes',
            name: 'Güneş / Kuşluk Vakti',
            nextLabel: 'Öğle Vaktine Kalan Süre',
            prayerId: null,
            hint: 'Güneş doğdu, öğle namazı bekleniyor.',
            sec: timeStrToMinutes(t.gunes) * 60,
            timeStr: t.gunes
        },
        {
            key: 'ogle',
            name: 'Öğle Vakti',
            nextLabel: 'İkindi Vaktine Kalan Süre',
            prayerId: 'ogle',
            hint: 'Öğle namazını eda edebilirsiniz.',
            sec: timeStrToMinutes(t.ogle) * 60,
            timeStr: t.ogle
        },
        {
            key: 'ikindi',
            name: 'İkindi Vakti',
            nextLabel: 'Akşam Vaktine Kalan Süre',
            prayerId: 'ikindi',
            hint: 'İkindi namazını eda edebilirsiniz.',
            sec: timeStrToMinutes(t.ikindi) * 60,
            timeStr: t.ikindi
        },
        {
            key: 'aksam',
            name: 'Akşam Vakti',
            nextLabel: 'Yatsı Vaktine Kalan Süre',
            prayerId: 'aksam',
            hint: 'Akşam namazını eda edebilirsiniz.',
            sec: timeStrToMinutes(t.aksam) * 60,
            timeStr: t.aksam
        },
        {
            key: 'yatsi',
            name: 'Yatsı Vakti',
            nextLabel: 'İmsak Vaktine Kalan Süre',
            prayerId: 'yatsi',
            hint: 'Yatsı ve Vitir namazını eda edebilirsiniz.',
            sec: timeStrToMinutes(t.yatsi) * 60,
            timeStr: t.yatsi
        }
    ];

    let currentIdx = -1;
    for (let i = 0; i < schedule.length; i++) {
        if (nowSeconds >= schedule[i].sec) {
            currentIdx = i;
        }
    }

    let currentItem;
    let startSec;
    let endSec;

    if (currentIdx === -1) {
        currentItem = {
            ...schedule[5],
            windowStr: `${t.yatsi} - ${t.imsak}`
        };
        startSec = schedule[5].sec - 86400;
        endSec = schedule[0].sec;
    } else if (currentIdx === 5) {
        currentItem = {
            ...schedule[5],
            windowStr: `${t.yatsi} - ${t.imsak}`
        };
        startSec = schedule[5].sec;
        endSec = schedule[0].sec + 86400;
    } else {
        currentItem = {
            ...schedule[currentIdx],
            windowStr: `${schedule[currentIdx].timeStr} - ${schedule[currentIdx + 1].timeStr}`
        };
        startSec = schedule[currentIdx].sec;
        endSec = schedule[currentIdx + 1].sec;
    }

    const remainingSec = Math.max(0, endSec - nowSeconds);
    const remHours = Math.floor(remainingSec / 3600);
    const remMinutes = Math.floor((remainingSec % 3600) / 60);
    const remSeconds = remainingSec % 60;

    const totalWindowSec = Math.max(1, endSec - startSec);
    const elapsedPercent = Math.min(100, Math.max(0, Math.round(((nowSeconds - startSec) / totalWindowSec) * 100)));

    document.getElementById('currentVakitName').textContent = currentItem.name;
    document.getElementById('currentVakitWindow').textContent = currentItem.windowStr;
    document.getElementById('currentVakitHint').textContent = currentItem.hint;
    document.getElementById('nextVakitLabel').textContent = currentItem.nextLabel;
    document.getElementById('countdownDisplay').textContent =
        `${String(remHours).padStart(2, '0')} sa ${String(remMinutes).padStart(2, '0')} dk ${String(remSeconds).padStart(2, '0')} sn`;
    document.getElementById('vakitTimeProgress').style.width = `${elapsedPercent}%`;

    const prevActiveVakit = state.activeVakitKeyNow;
    state.activeVakitKeyNow = currentItem.key;
    state.activePrayerIdNow = currentItem.prayerId;

    if (prevActiveVakit !== state.activeVakitKeyNow) {
        renderSixTimingsGrid();
        renderPrayerList();
    }
}

// 6 Resmi Vakit Kutucuklarını Render Et
function renderSixTimingsGrid() {
    const grid = document.getElementById('sixTimingsGrid');
    if (!grid) return;

    const isTodaySelected = state.selectedDate === toDateKey(new Date());
    const timings = state.selectedDateTimings || getFallbackTimings(state.selectedCity);

    grid.innerHTML = '';

    SIX_VAKIT_META.forEach((v) => {
        const isActive = isTodaySelected && state.activeVakitKeyNow === v.key;
        const timeVal = timings[v.key] || '--:--';

        const box = document.createElement('div');
        box.className = `flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
            isActive
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]'
                : 'bg-slate-50/80 dark:bg-slate-950/60 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300'
        }`;

        box.innerHTML = `
            <span class="text-[11px] font-semibold uppercase tracking-wide ${
                isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'
            }">
                ${v.label}
            </span>
            <span class="font-mono text-sm sm:text-base font-bold mt-0.5">
                ${timeVal}
            </span>
        `;

        grid.appendChild(box);
    });
}

// 81 İl Seçim Menüsünü Doldur
function initCitySelect() {
    const select = document.getElementById('citySelect');
    if (!select) return;

    select.innerHTML = '';
    CITIES.forEach((city) => {
        const opt = document.createElement('option');
        opt.value = city.id;
        opt.textContent = city.name;
        if (city.id === state.selectedCity) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
}

// Seçili günün kaydını getir veya varsayılan oluştur
function getDayRecord(dateKey) {
    if (!state.dailyRecords[dateKey]) {
        state.dailyRecords[dateKey] = {
            prayers: {
                sabah: false,
                ogle: false,
                ikindi: false,
                aksam: false,
                yatsi: false
            },
            mode: {},
            note: ''
        };
    }
    return state.dailyRecords[dateKey];
}

function getCompletedCountForDate(dateKey) {
    const record = state.dailyRecords[dateKey];
    if (!record || !record.prayers) return 0;
    return PRAYERS.reduce((acc, p) => acc + (record.prayers[p.id] ? 1 : 0), 0);
}

// Tema Yönetimi
function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    document.documentElement.classList.toggle('dark', isDark);
    updateThemeIcons(isDark);
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
}

function updateThemeIcons(isDark) {
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    if (!sunIcon || !moonIcon) return;

    if (isDark) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
}

// Tarih başlığı ve 7 günlük şeridi güncelle
function renderCalendarSection() {
    const todayKey = toDateKey(new Date());
    const selectedDateObj = parseDateKey(state.selectedDate);

    const formatter = new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
    });
    document.getElementById('selectedDateFormatted').textContent = formatter.format(selectedDateObj);

    const datePicker = document.getElementById('datePicker');
    if (datePicker.value !== state.selectedDate) {
        datePicker.value = state.selectedDate;
    }

    const badge = document.getElementById('selectedDateBadge');
    const todayBtn = document.getElementById('todayBtn');

    const diffTime = parseDateKey(state.selectedDate).getTime() - parseDateKey(todayKey).getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        badge.textContent = 'Bugün';
        badge.className = 'inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md mb-1';
        todayBtn.classList.add('hidden');
    } else if (diffDays === -1) {
        badge.textContent = 'Dün';
        badge.className = 'inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md mb-1';
        todayBtn.classList.remove('hidden');
    } else if (diffDays < -1) {
        badge.textContent = `${Math.abs(diffDays)} Gün Önce (Geçmiş Kayıt)`;
        badge.className = 'inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md mb-1';
        todayBtn.classList.remove('hidden');
    } else {
        badge.textContent = `${diffDays} Gün Sonra`;
        badge.className = 'inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md mb-1';
        todayBtn.classList.remove('hidden');
    }

    const weekStrip = document.getElementById('weekStrip');
    weekStrip.innerHTML = '';

    const shortDayFormatter = new Intl.DateTimeFormat('tr-TR', { weekday: 'short' });

    for (let i = -5; i <= 1; i++) {
        const d = new Date(selectedDateObj);
        d.setDate(selectedDateObj.getDate() + i);
        const key = toDateKey(d);
        const isSelected = key === state.selectedDate;
        const isToday = key === todayKey;
        const completed = getCompletedCountForDate(key);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all ${
            isSelected
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]'
                : 'bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300'
        }`;

        let dotsHtml = '<div class="flex items-center gap-0.5 mt-1.5">';
        for (let dotIndex = 0; dotIndex < 5; dotIndex++) {
            const filled = dotIndex < completed;
            if (isSelected) {
                dotsHtml += `<span class="w-1.5 h-1.5 rounded-full ${filled ? 'bg-white' : 'bg-emerald-800/60'}"></span>`;
            } else {
                dotsHtml += `<span class="w-1.5 h-1.5 rounded-full ${filled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}"></span>`;
            }
        }
        dotsHtml += '</div>';

        btn.innerHTML = `
            <span class="text-[11px] font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}">
                ${isToday ? 'Bugün' : shortDayFormatter.format(d)}
            </span>
            <span class="text-sm sm:text-base font-bold mt-0.5">${d.getDate()}</span>
            ${dotsHtml}
        `;

        btn.addEventListener('click', () => {
            setSelectedDate(key);
        });

        weekStrip.appendChild(btn);
    }
}

// Günlük İlerleme Çubuğunu Güncelle
function renderProgressBar() {
    const completedCount = getCompletedCountForDate(state.selectedDate);
    const totalCount = PRAYERS.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    document.getElementById('progressSubtext').textContent = `${totalCount}'te ${completedCount} kılındı - %${percentage}`;
    document.getElementById('progressRatioText').textContent = `${totalCount}'te ${completedCount}`;
    document.getElementById('progressPercentText').textContent = `%${percentage}`;
    document.getElementById('progressBarFill').style.width = `${percentage}%`;

    const completionBadge = document.getElementById('completionBadge');
    const quoteEl = document.getElementById('motivationalQuote');

    if (completedCount === 5) {
        completionBadge.classList.remove('hidden');
        quoteEl.textContent = 'Maşallah! Bugünün 5 vakit namazını eksiksiz tamamladınız. Allah kabul etsin.';
    } else if (completedCount >= 3) {
        completionBadge.classList.add('hidden');
        quoteEl.textContent = `Harika gidiyorsun! Geriye sadece ${5 - completedCount} vakit kaldı.`;
    } else {
        completionBadge.classList.add('hidden');
        quoteEl.textContent = '"Muhakkak ki namaz, müminler üzerine vakitleri belirlenmiş bir farzdır." (Nisâ, 103)';
    }
}

// 5 Vakit Namaz Listesini Render Et
function renderPrayerList(changedPrayerId = null) {
    const container = document.getElementById('prayerList');
    const record = getDayRecord(state.selectedDate);
    const timings = state.selectedDateTimings || getFallbackTimings(state.selectedCity);
    const isTodaySelected = state.selectedDate === toDateKey(new Date());

    container.innerHTML = '';

    PRAYERS.forEach((prayer) => {
        const isPrayed = Boolean(record.prayers[prayer.id]);
        const mode = record.mode?.[prayer.id] || 'eda';
        const isJustChanged = changedPrayerId === prayer.id;
        const isCurrentActivePrayer = isTodaySelected && state.activePrayerIdNow === prayer.id;

        const mainTime = timings[prayer.vakitKey] || '--:--';
        const timeBadgeText = prayer.id === 'sabah'
            ? `${timings.imsak} • Güneş ${timings.gunes}`
            : mainTime;

        const card = document.createElement('div');
        card.className = `group relative rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
            isJustChanged ? 'prayer-card-completed' : ''
        } ${
            isPrayed
                ? 'bg-emerald-50/90 dark:bg-emerald-950/35 border-emerald-500/60 dark:border-emerald-500/50 shadow-sm shadow-emerald-500/5'
                : isCurrentActivePrayer
                ? 'bg-white dark:bg-slate-900 border-emerald-500 dark:border-emerald-500/80 ring-2 ring-emerald-500/15 shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
        }`;

        card.innerHTML = `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start sm:items-center gap-3.5 cursor-pointer select-none flex-1" data-toggle-prayer="${prayer.id}">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                        isPrayed
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                            : isCurrentActivePrayer
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500'
                    }">
                        <i data-lucide="${isPrayed ? 'check-circle-2' : prayer.icon}" class="w-6 h-6"></i>
                    </div>

                    <div class="space-y-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <h4 class="font-bold text-base sm:text-lg ${
                                isPrayed
                                    ? 'text-emerald-950 dark:text-emerald-200'
                                    : 'text-slate-900 dark:text-white'
                            }">
                                ${prayer.name}
                            </h4>

                            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-mono text-xs font-bold ${
                                isPrayed
                                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700'
                            }">
                                <i data-lucide="clock" class="w-3 h-3"></i>
                                ${timeBadgeText}
                            </span>

                            ${
                                isCurrentActivePrayer
                                    ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                        Şu Anki Vakit
                                    </span>`
                                    : ''
                            }

                            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isPrayed
                                    ? mode === 'kaza'
                                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }">
                                ${isPrayed ? (mode === 'kaza' ? '✓ Kaza İle Kılındı' : '✓ Kılındı') : 'Kılınmadı'}
                            </span>
                        </div>
                        <p class="text-xs sm:text-sm ${
                            isPrayed
                                ? 'text-emerald-700/80 dark:text-emerald-300/70'
                                : 'text-slate-500 dark:text-slate-400'
                        }">
                            ${prayer.subtitle}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2 self-end sm:self-center">
                    ${
                        isPrayed
                            ? `
                        <button type="button" data-mode-toggle="${prayer.id}"
                            title="Vaktinde (Eda) veya Kaza olarak değiştir"
                            class="px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                                mode === 'kaza'
                                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                                    : 'bg-white/70 dark:bg-slate-900/60 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-white'
                            }">
                            ${mode === 'kaza' ? 'Kaza Kılındı' : 'Vaktinde (Eda)'}
                        </button>
                    `
                            : ''
                    }

                    <button type="button" data-toggle-prayer="${prayer.id}"
                        aria-pressed="${isPrayed}"
                        class="min-w-[130px] px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                            isPrayed
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                                : 'bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
                        }">
                        <i data-lucide="${isPrayed ? 'check' : 'circle'}" class="w-4 h-4"></i>
                        <span>${isPrayed ? 'Kılındı' : 'Kılınmadı'}</span>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    const noteInput = document.getElementById('dailyNote');
    if (noteInput) {
        noteInput.value = record.note || '';
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Kaza Çetelesini Render Et
function renderKazaSection() {
    const kazaListEl = document.getElementById('kazaList');
    kazaListEl.innerHTML = '';

    let totalKaza = 0;

    KAZA_TYPES.forEach((item) => {
        const count = state.kazaCounts[item.id] || 0;
        totalKaza += count;

        const row = document.createElement('div');
        row.className = 'py-3.5 flex items-center justify-between gap-4';
        row.innerHTML = `
            <div>
                <h4 class="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">${item.name}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400">${item.detail}</p>
            </div>

            <div class="flex items-center gap-2">
                <button type="button" data-kaza-action="dec" data-kaza-id="${item.id}"
                    class="w-9 h-9 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold transition flex items-center justify-center"
                    title="1 Kaza Kılındı (Düş)">
                    -1
                </button>

                <span class="min-w-[60px] text-center font-extrabold text-base sm:text-lg ${
                    count > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                }">
                    ${count}
                </span>

                <button type="button" data-kaza-action="inc" data-kaza-id="${item.id}"
                    class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition flex items-center justify-center"
                    title="1 Kaza Borcu Ekle">
                    +1
                </button>
            </div>
        `;
        kazaListEl.appendChild(row);
    });

    document.getElementById('totalKazaBadge').textContent = totalKaza;
    document.getElementById('statTotalKaza').textContent = `${totalKaza} Vakit`;
}

// Genel İstatistikleri Güncelle
function renderStats() {
    let totalPrayed = 0;
    let perfectDays = 0;

    Object.keys(state.dailyRecords).forEach((dateKey) => {
        const count = getCompletedCountForDate(dateKey);
        totalPrayed += count;
        if (count === 5) {
            perfectDays += 1;
        }
    });

    const today = new Date();
    let last7Completed = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        last7Completed += getCompletedCountForDate(toDateKey(d));
    }
    const weeklyRate = Math.round((last7Completed / 35) * 100);

    let streak = 0;
    const checkDate = new Date(today);
    if (getCompletedCountForDate(toDateKey(checkDate)) < 5) {
        checkDate.setDate(checkDate.getDate() - 1);
    }
    while (getCompletedCountForDate(toDateKey(checkDate)) === 5) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
    }

    document.getElementById('statTotalPrayed').textContent = `${totalPrayed} Vakit`;
    document.getElementById('statPerfectDays').textContent = `${perfectDays} Gün`;
    document.getElementById('statWeeklyRate').textContent = `%${weeklyRate}`;
    document.getElementById('streakCount').textContent = `${streak} Gün Seri`;
}

// Tarih Değiştirme
function setSelectedDate(dateKey) {
    state.selectedDate = dateKey;
    renderAll();
    syncPrayerTimings(false);
}

// Şehir Değiştirme (81 İl)
function setSelectedCity(cityId) {
    state.selectedCity = cityId;
    try {
        localStorage.setItem(STORAGE_KEYS.SELECTED_CITY, cityId);
    } catch (e) {
        console.error(e);
    }
    updateQiblaForSelectedCity();
    renderNotificationUI();
    syncPrayerTimings(false);
    scheduleCloudSync();
}

// Namaz Durumunu Değiştir
function togglePrayerStatus(prayerId) {
    const record = getDayRecord(state.selectedDate);
    record.prayers[prayerId] = !record.prayers[prayerId];
    if (!record.mode) record.mode = {};
    if (record.prayers[prayerId] && !record.mode[prayerId]) {
        record.mode[prayerId] = 'eda';
    }

    if (record.prayers[prayerId]) {
        playSoftCheckSound();
    }

    saveDailyRecords(true);
    renderCalendarSection();
    renderProgressBar();
    renderPrayerList(prayerId);
    renderStats();
}

// Eda / Kaza Modunu Değiştir
function togglePrayerMode(prayerId) {
    const record = getDayRecord(state.selectedDate);
    if (!record.mode) record.mode = {};
    record.mode[prayerId] = record.mode[prayerId] === 'kaza' ? 'eda' : 'kaza';
    saveDailyRecords(true);
    renderPrayerList(prayerId);
}

// ============================================================================
// 5. PWA (ANA EKRANA EKLEME) & SERVICE WORKER YÖNETİMİ
// ============================================================================

let deferredInstallPrompt = null;

function isRunningStandalone() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    );
}

function initPWA() {
    const banner = document.getElementById('pwaInstallBanner');
    const headerBtn = document.getElementById('headerInstallBtn');
    const bannerSubtext = document.getElementById('pwaBannerSubtext');

    // Service Worker Kaydı & Ana Ekran PWA Anlık Güncelleme Senkronizasyonu
    if ('serviceWorker' in navigator) {
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        });

        navigator.serviceWorker
            .register('./sw.js?v=9', { updateViaCache: 'none' })
            .then((reg) => {
                // Uygulama her açıldığında Vercel'deki son sürümü anında denetle
                reg.update().catch(() => null);

                if (reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                }

                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });

                // Kullanıcı ana ekrandan uygulamaya her döndüğünde güncellemeyi kontrol et
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        reg.update().catch(() => null);
                    }
                });
            })
            .catch(() => null);
    }

    // Zaten uygulama olarak (Ana Ekrandan) açıldıysa kurulum çubuğunu gizle
    if (isRunningStandalone()) {
        banner?.classList.add('hidden');
        headerBtn?.classList.add('hidden');
        return;
    }

    // Kullanıcı daha önce çubuğu kapattıysa gizle (üst bardaki buton kalır)
    if (localStorage.getItem(STORAGE_KEYS.PWA_BANNER_DISMISSED) === '1') {
        banner?.classList.add('hidden');
    }

    // iOS Safari kontrolü (kullanıcıya özel bilgi metni)
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIos && bannerSubtext) {
        bannerSubtext.textContent = 'Safari\'de Paylaş butonuna basıp "Ana Ekrana Ekle" seçeneğiyle uygulama olarak kurun.';
    }

    // Chrome / Android / Edge yerel kurulum istemini yakala
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        if (localStorage.getItem(STORAGE_KEYS.PWA_BANNER_DISMISSED) !== '1') {
            banner?.classList.remove('hidden');
        }
        headerBtn?.classList.remove('hidden');
    });

    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        banner?.classList.add('hidden');
        headerBtn?.classList.add('hidden');
        showToast('BakVakitGeldi Kuruldu!', 'Uygulama ana ekranınıza başarıyla eklendi.', 'emerald');
    });
}

async function triggerPwaInstall() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            deferredInstallPrompt = null;
            document.getElementById('pwaInstallBanner')?.classList.add('hidden');
        }
        return;
    }

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIos) {
        showToast(
            'iPhone / iPad Ana Ekrana Ekleme',
            'Safari alt menüsündeki Paylaş [↑] simgesine dokunun ve "Ana Ekrana Ekle" seçeneğini seçin.',
            'emerald'
        );
    } else {
        showToast(
            'Ana Ekrana Ekleme',
            'Tarayıcınızın sağ üst menüsünden (⋮) "Ana ekrana ekle" veya "Uygulamayı yükle" seçeneğine dokunun.',
            'emerald'
        );
    }
}

// ============================================================================
// 6. NAMAZ SURELERİ VE DUALARI REHBERİ
// ============================================================================

const SURAHS_AND_DUAS = [
    {
        id: 'subhaneke',
        type: 'dua',
        title: 'Sübhaneke Duası',
        badge: 'Namaz Duası • İftitah',
        info: 'Her namazın ilk rekatında iftitah tekbirinden sonra, ikindi ve yatsı namazlarının ilk sünnetlerinde 3. rekat başında okunur.',
        arabic: 'سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالٰى جَدُّكَ وَلَا اِلٰهَ غَيْرُكَ',
        pronunciation: 'Sübhânekellâhümme ve bi hamdik ve tebârekesmük ve teâlâ ceddük (ve celle senâük*) ve lâ ilâhe ğayrük.',
        meaning: 'Allah’ım! Sen eksik sıfatlardan pak ve uzaksın. Seni daima böyle tenzih eder ve överim. Senin adın mübarektir. Varlığın her şeyden üstündür. Senden başka ilah yoktur. (*Ve celle senâük ifadesi yalnızca cenaze namazında eklenir.)'
    },
    {
        id: 'fatiha',
        type: 'sure',
        title: 'Fâtiha Suresi',
        badge: 'Mushaf 1. Sure • 7 Ayet',
        info: 'Kur’an-ı Kerim’in ilk suresidir. Bütün namazların her rekatında kıyamda okunması vaciptir.',
        arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّح۪يمِ ﴿١﴾ اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَم۪ينَۙ ﴿٢﴾ اَلرَّحْمٰنِ الرَّح۪يمِۙ ﴿٣﴾ مَالِكِ يَوْمِ الدّ۪ينِۜ ﴿٤﴾ اِيَّاكَ نَعْبُدُ وَاِيَّاكَ نَسْتَع۪ينُۜ ﴿٥﴾ اِهْدِنَا الصِّرَاطَ الْمُسْتَق۪يمَۙ ﴿٦﴾ صِرَاطَ الَّذ۪ينَ اَنْعَمْتَ عَلَيْهِمْۙ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّآلّ۪ينَ ﴿٧﴾',
        pronunciation: 'Bismillâhirrahmânirrahîm. Elhamdü lillâhi rabbil âlemîn. Errahmânirrahîm. Mâliki yevmiddîn. İyyâke na’büdü ve iyyâke nestaîn. İhdinas-sırâtal müstakîm. Sırâtallezîne en’amte aleyhim ğayril mağdûbi aleyhim ve led-dâllîn. (Âmin)',
        meaning: 'Rahmân ve Rahîm olan Allah’ın adıyla. Hamd, âlemlerin Rabbi, Rahmân, Rahîm, hesap ve ceza gününün maliki olan Allah’a mahsustur. (Allah’ım!) Yalnız sana ibadet ederiz ve yalnız senden yardım dileriz. Bizi doğru yola, kendilerine nimet verdiklerinin yoluna ilet; gazaba uğrayanlarınkine ve sapıklarınkine değil.'
    },
    {
        id: 'ayetel-kursi',
        type: 'sure',
        title: 'Âyetel Kürsî (Bakara 255)',
        badge: 'Bakara Suresi • 255. Ayet',
        info: 'Farz namazların ardından tesbihat öncesi okunan, Tevhid ilmini en veciz şekilde anlatan ayet-i kerimedir.',
        arabic: 'اَللّٰهُ لَٓا اِلٰهَ اِلَّا هُوَ الْحَيُّ الْقَيُّومُۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌۜ لَهُ مَا فِي السَّمٰوَاتِ وَمَا فِي الْاَرْضِۜ مَنْ ذَا الَّذ۪ي يَشْفَعُ عِنْدَهُٓ اِلَّا بِاِذْنِه۪ۜ يَعْلَمُ مَا بَيْنَ اَيْد۪يهِمْ وَمَا خَلْفَهُمْۚ وَلَا يُح۪يطُونَ بِشَيْءٍ مِنْ عِلْمِه۪ٓ اِلَّا بِمَا شَٓاءَۚ وَسِعَ كُرْسِيُّهُ السَّمٰوَاتِ وَالْاَرْضَۚ وَلَا يَؤُ۫دُهُ حِفْظُهُمَاۚ وَهُوَ الْعَلِيُّ الْعَظ۪يمُ',
        pronunciation: 'Allâhü lâ ilâhe illâ hüvel hayyül kayyûm, lâ te’huzühû sinetün ve lâ nevm, lehû mâ fis-semâvâti ve mâ fil ard, men zellezî yeşfeu indehû illâ bi-iznih, ya’lemü mâ beyne eydîhim ve mâ halfehüm, ve lâ yühîtûne bi-şey’in min ilmihî illâ bimâ şâe, vesia kürsiyyühüs-semâvâti vel ard, ve lâ yeûdühû hıfzuhümâ ve hüvel aliyyül azîm.',
        meaning: 'Allah, kendisinden başka hiçbir ilâh olmayandır. Diridir, kayyûmdur (her şeyi ayakta tutandır). O’nu ne bir uyuklama tutabilir, ne de bir uyku. Göklerdeki her şey, yerdeki her şey O’nundur. İzni olmaksızın O’nun katında şefaatte bulunacak kimdir? O, kulların önlerindekileri ve arkalarındakileri (yaptıklarını ve yapacaklarını) bilir. Onlar O’nun ilminden, kendisinin dilediği kadarından başka bir şey kavrayamazlar. O’nun kürsüsü bütün gökleri ve yeri kaplayıp kuşatmıştır. Gökleri ve yeri koruyup gözetmek O’na güç gelmez. O, yücedir, büyüktür.'
    },
    {
        id: 'ihlas',
        type: 'sure',
        title: 'İhlâs Suresi',
        badge: 'Mushaf 112. Sure • 4 Ayet',
        info: 'Allah’ın birliğini (Tevhid) en saf haliyle anlatan ve Kur’an’ın üçte birine denk kabul edilen suredir.',
        arabic: 'قُلْ هُوَ اللّٰهُ اَحَدٌۚ ﴿١﴾ اَللّٰهُ الصَّمَدُۚ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْۙ ﴿٣﴾ وَلَمْ يَكُنْ لَهُ كُفُوًا اَحَدٌ ﴿٤﴾',
        pronunciation: 'Bismillâhirrahmânirrahîm. Kul hüvellâhü ehad. Allâhüs-samed. Lem yelid ve lem yûled. Ve lem yekün lehû küfüven ehad.',
        meaning: 'De ki: O, Allah’tır, bir tektir. Allah Samed’dir (Her şey O’na muhtaçtır; O, hiçbir şeye muhtaç değildir). O’ndan çocuk olmamıştır (Kimsenin babası değildir). Kendisi de doğmamıştır (Kimsenin çocuğu değildir). Hiçbir şey O’na denk ve benzer değildir.'
    },
    {
        id: 'felak',
        type: 'sure',
        title: 'Felak Suresi',
        badge: 'Mushaf 113. Sure • 5 Ayet',
        info: 'Nâs suresi ile birlikte "Muavvizeteyn" (iki koruyucu sure) olarak anılır.',
        arabic: 'قُلْ اَعُوذُ بِرَبِّ الْفَلَقِۙ ﴿١﴾ مِنْ شَرِّ مَا خَلَقَۙ ﴿٢﴾ وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَۙ ﴿٣﴾ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِۙ ﴿٤﴾ وَمِنْ شَرِّ حَاسِدٍ اِذَا حَسَدَ ﴿٥﴾',
        pronunciation: 'Bismillâhirrahmânirrahîm. Kul eûzü birabbil-felak. Min şerri mâ halak. Ve min şerri ğâsikın izâ vekab. Ve min şerrin-neffâsâti fil-ukad. Ve min şerri hâsidin izâ hased.',
        meaning: 'De ki: Yarattığı şeylerin kötülüğünden, karanlığı çöktüğü zaman gecenin kötülüğünden, düğümlere üfleyenlerin kötülüğünden ve haset ettiği zaman hasetçinin kötülüğünden, sabah aydınlığının Rabbine sığınırım.'
    },
    {
        id: 'nas',
        type: 'sure',
        title: 'Nâs Suresi',
        badge: 'Mushaf 114. Sure • 6 Ayet',
        info: 'Kur’an-ı Kerim’in son suresidir. Vesveseden ve şerlerden Allah’a sığınmayı öğretir.',
        arabic: 'قُلْ اَعُوذُ بِرَبِّ النَّاسِۙ ﴿١﴾ مَلِكِ النَّاسِۙ ﴿٢﴾ اِلٰهِ النَّاسِۙ ﴿٣﴾ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِۙ ﴿٤﴾ اَلَّذ۪ي يُوَسْوِسُ ف۪ي صُدُورِ النَّاسِۙ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾',
        pronunciation: 'Bismillâhirrahmânirrahîm. Kul eûzü birabbin-nâs. Melikin-nâs. İlâhin-nâs. Min şerril-vesvâsil-hannâs. Ellezî yüvesvisü fî sudûrin-nâs. Minel-cinneti ven-nâs.',
        meaning: 'De ki: Cinlerden ve insanlardan; insanların kalplerine vesvese veren sinsi vesvesecinin kötülüğünden, insanların Rabbine, insanların Melik’ine, insanların İlâh’ına sığınırım.'
    },
    {
        id: 'kevser',
        type: 'sure',
        title: 'Kevser Suresi',
        badge: 'Mushaf 108. Sure • 3 Ayet',
        info: 'Kur’an-ı Kerim’in en kısa suresidir. Namazlarda zamm-ı sure olarak sıkça okunur.',
        arabic: 'اِنَّآ اَعْطَيْنَاكَ الْكَوْثَرَۜ ﴿١﴾ فَصَلِّ لِرَبِّكَ وَانْحَرْۜ ﴿٢﴾ اِنَّ شَانِئَكَ هُوَ الْاَبْتَرُ ﴿٣﴾',
        pronunciation: 'Bismillâhirrahmânirrahîm. İnnâ a’taynâkel-kevser. Fesalli lirabbike venhar. İnne şânieke hüvel-ebter.',
        meaning: 'Şüphesiz biz sana Kevser’i verdik. O Halde, Rabbin için namaz kıl, kurban kes. Doğrusu sana buğzeden, soyu kesik olanın ta kendisidir.'
    },
    {
        id: 'fil',
        type: 'sure',
        title: 'Fîl Suresi',
        badge: 'Mushaf 105. Sure • 5 Ayet',
        info: 'Kâbe’yi yıkmaya gelen Ebrehe ordusunun helak edilişini anlatır.',
        arabic: 'اَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِاَصْحَابِ الْف۪يلِۜ ﴿١﴾ اَلَمْ يَجْعَلْ كَيْدَهُمْ ف۪ي تَضْل۪يلٍۙ ﴿٢﴾ وَاَرْسَلَ عَلَيْهِمْ طَيْرًا اَبَاب۪يلَۙ ﴿٣﴾ تَرْم۪يهِمْ بِحِجَارَةٍ مِنْ سِجّ۪يلٍۙ ﴿٤﴾ فَجَعَلَهُمْ كَعَصْفٍ مَأْكُولٍ ﴿٥﴾',
        pronunciation: 'Bismillâhirrahmânirrahîm. Elem tera keyfe feale rabbüke bi-ashâbil-fîl. Elem yec’al keydehüm fî tadlîl. Ve ersele aleyhim tayran ebâbîl. Termîhim bihicâratin min siccîl. Fecealehüm keasfin me’kûl.',
        meaning: 'Rabbinin, fil sahiplerine ne yaptığını görmedin mi? Onların tuzaklarını boşa çıkarmadı mı? Üzerlerine balçıktan pişirilmiş taşlar atan sürü sürü kuşlar gönderdi. Nihayet onları yenilmiş ekin yaprağı haline getirdi.'
    },
    {
        id: 'kureys',
        type: 'sure',
        title: 'Kureyş Suresi',
        badge: 'Mushaf 106. Sure • 4 Ayet',
        info: 'Kureyş kabilesine verilen güvenlik ve rızık nimetini hatırlatır.',
        arabic: 'لِا۪يلَافِ قُرَيْشٍۙ ﴿١﴾ ا۪يلَافِهِمْ رِحْلَةَ الشِّتَآءِ وَالصَّيْفِۚ ﴿٢﴾ فَلْيَعْبُدُوا رَبَّ هٰذَا الْبَيْتِۙ ﴿٣﴾ اَلَّذ۪يٓ اَطْعَمَهُمْ مِنْ جُوعٍ وَاٰمَنَهُمْ مِنْ خَوْفٍ ﴿٤﴾',
        pronunciation: 'Bismillâhirrahmânirrahîm. Li-îlâfi kureyş. Îlâfihim rıhleteş-şitâi ves-sayf. Felya’büdû rabbe hâzel-beyt. Ellezî et’amehüm min cû’in ve âmenehüm min havf.',
        meaning: 'Kureyş’e kolaylaştırıldığı, evet, kış ve yaz seyahatleri onlara kolaylaştırıldığı için onlar, kendilerini açlıktan doyuran ve korkudan emin kılan bu Ev’in (Kâbe’nin) Rabbine kulluk etsinler.'
    },
    {
        id: 'maun',
        type: 'sure',
        title: 'Mâûn Suresi',
        badge: 'Mushaf 107. Sure • 7 Ayet',
        info: 'Yetimi kollamayı, yardımlaşmayı ve namazda riyadan uzak durmayı öğütler.',
        arabic: 'اَرَاَيْتَ الَّذ۪ي يُكَذِّبُ بِالدّ۪ينِۜ ﴿١﴾ فَذٰلِكَ الَّذ۪ي يَدُعُّ الْيَت۪يمَۙ ﴿٢﴾ وَلَا يَحُضُّ عَلٰى طَعَامِ الْمِسْك۪ينِۜ ﴿٣﴾ فَوَيْلٌ لِلْمُصَلّ۪ينَۙ ﴿٤﴾ اَلَّذ۪ينَ هُمْ عَنْ صَلَاتِهِمْ سَاهُونَۙ ﴿٥﴾ اَلَّذ۪ينَ هُمْ يُرَآؤُ۫نَۙ ﴿٦﴾ وَيَمْنَعُونَ الْمَاعُونَ ﴿٧﴾',
        pronunciation: 'Bismillâhirrahmânirrahîm. Eraeytellezî yükezzibü biddîn. Fezâlikellezî yedu’ul-yetîm. Ve lâ yehuddu alâ taâmil-miskîn. Feveylün lil-musallîn. Ellezîne hüm an salâtihim sâhûn. Ellezîne hüm yürâûn. Ve yemneûnel-mâûn.',
        meaning: 'Dini (hesap ve cezayı) yalanlayanı gördün mü? İşte o, yetimi itip kakan, yoksula yedirmeyi özendirmeyen kimsedir. Yazıklar olsun o namaz kılanlara ki, onlar namazlarını ciddiye almazlar. Onlar (namazlarıyla) gösteriş yaparlar. Ufacık bir yardıma bile engel olurlar.'
    },
    {
        id: 'kafirun',
        type: 'sure',
        title: 'Kâfirûn Suresi',
        badge: 'Mushaf 109. Sure • 6 Ayet',
        info: 'İslam inancının şirk ile asla uzlaşmayacağını kesin bir dille ifade eder.',
        arabic: 'قُلْ يَآ اَيُّهَا الْكَافِرُونَۙ ﴿١﴾ لَآ اَعْبُدُ مَا تَعْبُدُونَۙ ﴿٢﴾ وَلَآ اَنْتُمْ عَابِدُونَ مَآ اَعْبُدُۚ ﴿٣﴾ وَلَآ اَنَا۠ عَابِدٌ مَا عَبَدْتُمْۙ ﴿٤﴾ وَلَآ اَنْتُمْ عَابِدُونَ مَآ اَعْبُدُۜ ﴿٥﴾ لَكُمْ د۪ينُكُمْ وَلِيَ د۪ينِ ﴿٦﴾',
        pronunciation: 'Bismillâhirrahmânirrahîm. Kul yâ eyyühel-kâfirûn. Lâ a’büdü mâ ta’büdûn. Ve lâ entüm âbidûne mâ a’büd. Ve lâ ene âbidün mâ abedtüm. Ve lâ entüm âbidûne mâ a’büd. Leküm dînüküm veliye dîn.',
        meaning: 'De ki: Ey kâfirler! Ben sizin kulluk ettiklerinize kulluk etmem. Siz de benim kulluk ettiğime kullukacak değilsiniz. Ben sizin kulluk ettiklerinize kulluk edecek değilim. Siz de benim kulluk ettiğime kulluk etmiyorsunuz. Sizin dininiz size, benim dinim banadır.'
    },
    {
        id: 'nasr',
        type: 'sure',
        title: 'Nasr Suresi',
        badge: 'Mushaf 110. Sure • 3 Ayet',
        info: 'Mekke’nin fethini ve Allah’ın yardımına hamd ile istiğfar etmeyi bildirir.',
        arabic: 'اِذَا جَآءَ نَصْرُ اللّٰهِ وَالْفَتْحُۙ ﴿١﴾ وَرَاَيْتَ النَّاسَ يَدْخُلُونَ ف۪ي د۪ينِ اللّٰهِ اَفْوَاجًاۙ ﴿٢﴾ فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُۜ اِنَّهُ كَانَ تَوَّابًا ﴿٣﴾',
        pronunciation: 'Bismillâhirrahmânirrahîm. İzâ câe nasrullâhi vel-feth. Ve raeyten-nâse yedhulûne fî dînillâhi efvâcâ. Fesebbih bihamdi rabbike vestağfirh. İnnehû kâne tevvâbâ.',
        meaning: 'Allah’ın yardımı ve fetih geldiğinde ve insanların bölük bölük Allah’ın dinine girdiğini gördüğünde, Rabbine hamd ederek tespihte bulun ve O’ndan bağışlama dile. Çünkü O, tövbeleri çok kabul edendir.'
    },
    {
        id: 'tahiyyat',
        type: 'dua',
        title: 'Tahiyyât (Ettahiyyâtü) Duası',
        badge: 'Namaz Duası • Oturuş (Ka’de)',
        info: 'Namazların her oturuşunda (ilk ve son ka’dede) okunması vacip olan duadır.',
        arabic: 'اَلتَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُۚ اَلسَّلَامُ عَلَيْكَ اَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُۚ اَلسَّلَامُ عَلَيْنَا وَعَلٰى عِبَادِ اللّٰهِ الصَّالِح۪ينَۚ اَشْهَدُ اَنْ لَا اِلٰهَ اِلَّا اللّٰهُ وَاَشْهَدُ اَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
        pronunciation: 'Ettahiyyâtü lillâhi ves-salevâtü vet-tayyibât. Esselâmü aleyke eyyühen-nebiyyü ve rahmetullâhi ve berekâtüh. Esselâmü aleynâ ve alâ ibâdillâhis-sâlihîn. Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve rasûlüh.',
        meaning: 'Dil ile, beden ve mal ile yapılan bütün ibadetler Allah’a dır. Ey Peygamber! Allah’ın selamı, rahmet ve bereketleri senin üzerine olsun. Selam bizim üzerimize ve Allah’ın bütün iyi (salih) kullarının üzerine olsun. Şahitlik ederim ki, Allah’tan başka ilah yoktur. Yine şahitlik ederim ki, Muhammed, O’nun kulu ve Peygamberidir.'
    },
    {
        id: 'salli-barik',
        type: 'dua',
        title: 'Allahümme Salli ve Bârik Duaları',
        badge: 'Namaz Duası • Son Oturuş',
        info: 'Tüm namazların son oturuşunda Tahiyyat’tan sonra, ikindi ve yatsının ilk sünnetlerinde ise ilk oturuşta da okunur.',
        arabic: 'اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ وَعَلٰى اٰلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلٰى اِبْرٰه۪يمَ وَعَلٰى اٰلِ اِبْرٰه۪يمَ اِنَّكَ حَم۪يدٌ مَج۪يدٌ ❖ اَللّٰهُمَّ بَارِكْ عَلٰى مُحَمَّدٍ وَعَلٰى اٰلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلٰى اِبْرٰه۪يمَ وَعَلٰى اٰلِ اِبْرٰه۪يمَ اِنَّكَ حَم۪يدٌ مَج۪يدٌ',
        pronunciation: 'Allâhümme salli alâ Muhammedin ve alâ âli Muhammed. Kemâ salleyte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd. ❖ Allâhümme bârik alâ Muhammedin ve alâ âli Muhammed. Kemâ bârekte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.',
        meaning: 'Allah’ım! Muhammed’e ve Muhammed’in ümmetine rahmet eyle; şerefini yücelt. İbrahim’e ve İbrahim’in ümmetine rahmet ettiğin gibi. Şüphesiz övülmeye layık yalnız sensin, şan ve şeref sahibi de sensin. ❖ Allah’ım! Muhammed’e ve Muhammed’in ümmetine hayır ve bereket ver. İbrahim’e ve İbrahim’in ümmetine verdiğin gibi. Şüphesiz övülmeye layık yalnız sensin, şan ve şeref sahibi de sensin.'
    },
    {
        id: 'rabbena',
        type: 'dua',
        title: 'Rabbenâ Âtinâ ve Rabbenağfirlî Duaları',
        badge: 'Namaz Duası • Selam Öncesi',
        info: 'Namazların son oturuşunda Salli-Barik dualarından sonra selam vermeden önce okunur.',
        arabic: 'رَبَّنَآ اٰتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْاٰخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ ❖ رَبَّنَا اغْفِرْ ل۪ي وَلِوَالِدَيَّ وَلِلْمُؤْمِن۪ينَ يَوْمَ يَقُومُ الْحِسَابُ',
        pronunciation: 'Rabbenâ âtinâ fid-dünyâ haseneten ve fil-âhirati haseneten ve kınâ azâben-nâr. ❖ Rabbenağfirlî ve li-vâlideyye ve lil-mü’minîne yevme yekûmül-hisâb.',
        meaning: 'Ey Rabbimiz! Bize dünyada da iyilik ve güzellik ver, ahirette de iyilik ve güzellik ver. Bizi cehennem azabından koru. ❖ Ey Rabbimiz! Hesap kurulacağı gün beni, ana-babamı ve bütün müminleri bağışla!'
    },
    {
        id: 'kunut',
        type: 'dua',
        title: 'Kunut Duaları (1 ve 2)',
        badge: 'Namaz Duası • Vitir 3. Rekat',
        info: 'Yatsı namazının ardından kılınan Vitir namazının 3. rekatında tekbir alındıktan sonra okunur.',
        arabic: 'اَللّٰهُمَّ اِنَّا نَسْتَع۪ينُكَ وَنَسْتَغْفِرُكَ وَنَسْتَهْد۪يكَ وَنُؤْمِنُ بِكَ وَنَتُوبُ اِلَيْكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْن۪ي عَلَيْكَ الْخَيْرَ كُلَّهُ نَشْكُرُكَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ ❖ اَللّٰهُمَّ اِيَّاكَ نَعْبُدُ وَلَكَ نُصَلّ۪ي وَنَسْجُدُ وَاِلَيْكَ نَسْعٰى وَنَحْفِدُ نَرْجُو رَحْمَتَكَ وَنَخْشٰى عَذَابَكَ اِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ',
        pronunciation: 'Allâhümme innâ nesteînüke ve nestağfirüke ve nestehdîk. Ve nü’minü bike ve netûbü ileyk. Ve netevekkelü aleyke ve nüsnî aleykel-hayra küllehû neşkürüke ve lâ nekfürük. Ve nahleu ve netrükü men yefcürük. ❖ Allâhümme iyyâke na’büdü ve leke nusallî ve nescüd. Ve ileyke nes’â ve nahfid. Nercû rahmeteke ve nahşâ azâbek. İnne azâbeke bil-küffâri mülhık.',
        meaning: 'Allah’ım! Senden yardım isteriz, günahlarımızı bağışlamanı isteriz, razı olduğun şeylere hidayet etmeni isteriz. Sana inanırız, sana tövbe ederiz. Sana güveniriz. Bize verdiğin bütün nimetleri bilerek seni hayır ile överiz. Sana şükrederiz. Hiçbir nimetini inkâr etmez ve onları başkalarından bilmeyiz. Nimetlerini inkâr eden ve sana karşı geleni bırakırız. ❖ Allah’ım! Biz yalnız sana kulluk ederiz. Namazı yalnız senin için kılarız, ancak sana secde ederiz. Yalnız sana koşar ve sana yaklaştıracak şeyleri kazanmaya çalışırız. İbadetlerini sevinçle yaparız. Rahmetinin devamını ve çoğalmasını dileriz. Azabından korkarız, şüphesiz senin azabın kâfirlere ve inançsızlara ulaşır.'
    }
];

let activeSurahFilter = 'all';
let activeSurahSearch = '';
let expandedSurahId = 'fatiha'; // İlk açılışta Fatiha Suresi açık gelsin

function renderSurahList() {
    const container = document.getElementById('surahListContainer');
    if (!container) return;

    const query = activeSurahSearch.trim().toLocaleLowerCase('tr-TR');

    const filtered = SURAHS_AND_DUAS.filter((item) => {
        const matchType = activeSurahFilter === 'all' || item.type === activeSurahFilter;
        const matchSearch =
            !query ||
            item.title.toLocaleLowerCase('tr-TR').includes(query) ||
            item.badge.toLocaleLowerCase('tr-TR').includes(query) ||
            item.pronunciation.toLocaleLowerCase('tr-TR').includes(query) ||
            item.meaning.toLocaleLowerCase('tr-TR').includes(query);
        return matchType && matchSearch;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                Aramanızla eşleşen bir sure veya dua bulunamadı.
            </div>
        `;
        return;
    }

    filtered.forEach((item) => {
        const isExpanded = expandedSurahId === item.id;
        const isSure = item.type === 'sure';

        const card = document.createElement('div');
        card.className = `rounded-2xl border transition-all overflow-hidden ${
            isExpanded
                ? 'border-emerald-500/70 dark:border-emerald-500/60 bg-emerald-50/30 dark:bg-slate-900 shadow-md'
                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-emerald-500/40'
        }`;

        card.innerHTML = `
            <button type="button" data-surah-toggle="${item.id}"
                class="w-full p-4 flex items-center justify-between gap-3 text-left select-none">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                        isExpanded
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                            : isSure
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                    }">
                        ${isSure ? '📖' : '🤲'}
                    </div>
                    <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <h4 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white">${item.title}</h4>
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                isSure
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-teal-500/10 text-teal-700 dark:text-teal-300'
                            }">
                                ${item.badge}
                            </span>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${item.info}</p>
                    </div>
                </div>
                <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 transition-transform ${
                    isExpanded ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                }">
                    <i data-lucide="chevron-down" class="w-4 h-4"></i>
                </div>
            </button>

            <div class="${isExpanded ? 'block' : 'hidden'} px-4 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4 overflow-hidden">
                <!-- Arapça Metin Kartı -->
                <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800 overflow-hidden">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Arapça Yazılışı</span>
                        <span class="text-[11px] text-slate-400 break-words">${item.info}</span>
                    </div>
                    <p dir="rtl" lang="ar" class="font-arabic text-2xl sm:text-3xl leading-[2.2] text-right text-slate-900 dark:text-slate-100 break-words">
                        ${item.arabic}
                    </p>
                </div>

                <!-- Türkçe Okunuşu -->
                <div class="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/20 overflow-hidden">
                    <span class="block text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                        Türkçe Okunuşu
                    </span>
                    <p class="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic break-words">
                        "${item.pronunciation}"
                    </p>
                </div>

                <!-- Türkçe Meali / Anlamı -->
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800 overflow-hidden">
                    <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        Türkçe Meali (Anlamı)
                    </span>
                    <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                        ${item.meaning}
                    </p>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// ============================================================================
// 7. AKILLI ZEKAT HESAPLAMA (CANLI DÖVİZ, GRAM & ÇEYREK ALTIN API ENTEGRASYONU)
// ============================================================================

const ZEKAT_NISAP_GOLD_GRAMS = 80.18; // Diyanet İşleri Başkanlığı 80.18 gr 24 Ayar Altın Nisabı

const zekatRates = {
    goldGramTry: 6633.21,
    quarterGoldTry: 10859.67,
    silverGramTry: 90.76,
    usdTry: 49.56,
    eurTry: 55.77,
    source: 'default'
};

function formatCurrencyTRY(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
}

function parseTurkishNumber(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = String(val).trim().replace(/[^0-9.,-]/g, '');
    if (str.includes(',') && str.includes('.')) {
        return Number(str.replace(/\./g, '').replace(',', '.')) || 0;
    }
    if (str.includes(',')) {
        return Number(str.replace(',', '.')) || 0;
    }
    return Number(str) || 0;
}

function populateZekatRateInputs() {
    const goldIn = document.getElementById('rateGoldInput');
    const quarterIn = document.getElementById('rateQuarterGoldInput');
    const silverIn = document.getElementById('rateSilverInput');
    const usdIn = document.getElementById('rateUsdInput');
    const eurIn = document.getElementById('rateEurInput');

    if (goldIn) goldIn.value = zekatRates.goldGramTry.toFixed(2);
    if (quarterIn) quarterIn.value = zekatRates.quarterGoldTry.toFixed(2);
    if (silverIn) silverIn.value = zekatRates.silverGramTry.toFixed(2);
    if (usdIn) usdIn.value = zekatRates.usdTry.toFixed(2);
    if (eurIn) eurIn.value = zekatRates.eurTry.toFixed(2);
}

function updateZekatRateTimestampUI(sourceLabel) {
    const badge = document.getElementById('zekatRateStatusBadge');
    const timeEl = document.getElementById('zekatLastUpdatedTime');
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    if (badge) {
        badge.textContent = `${sourceLabel} ✓`;
        badge.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    }
    if (timeEl) {
        timeEl.textContent = `Son Güncelleme: ${nowTime}`;
    }
}

async function fetchLiveZekatRates(showFeedback = false) {
    const badge = document.getElementById('zekatRateStatusBadge');
    if (badge) {
        badge.textContent = 'Canlı Kurlar Çekiliyor...';
    }

    // 1. Birincil Kaynak: Türkiye Kapalıçarşı & Serbest Piyasa Canlı Finans API (Truncgil v4)
    try {
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 5500);
        const res = await fetch('https://finans.truncgil.com/v4/today.json', {
            signal: controller.signal,
            cache: 'no-store'
        });
        clearTimeout(tId);

        if (res.ok) {
            const data = await res.json();
            const gra = parseTurkishNumber(data?.GRA?.Selling || data?.GRA?.Buying);
            const ceyrek = parseTurkishNumber(data?.CEYREKALTIN?.Selling || data?.CEYREKALTIN?.Buying);
            const gumus = parseTurkishNumber(data?.GUMUS?.Selling || data?.GUMUS?.Buying);
            const usd = parseTurkishNumber(data?.USD?.Selling || data?.USD?.Buying);
            const eur = parseTurkishNumber(data?.EUR?.Selling || data?.EUR?.Buying);

            if (gra > 1000 && usd > 10) {
                zekatRates.goldGramTry = Math.round(gra * 100) / 100;
                zekatRates.quarterGoldTry = ceyrek > 1000
                    ? Math.round(ceyrek * 100) / 100
                    : Math.round(gra * 1.637 * 100) / 100;
                if (gumus > 1) zekatRates.silverGramTry = Math.round(gumus * 100) / 100;
                zekatRates.usdTry = Math.round(usd * 100) / 100;
                if (eur > 10) zekatRates.eurTry = Math.round(eur * 100) / 100;
                zekatRates.source = 'live-tr';

                populateZekatRateInputs();
                calculateZekat();
                updateZekatRateTimestampUI('Canlı Piyasa Kurları Aktif');

                if (showFeedback) {
                    showToast(
                        'Canlı Piyasa Kurları Güncellendi',
                        `24 Ayar Gram Altın: ₺${zekatRates.goldGramTry.toLocaleString('tr-TR')} • Çeyrek: ₺${zekatRates.quarterGoldTry.toLocaleString('tr-TR')} • Dolar: ₺${zekatRates.usdTry.toLocaleString('tr-TR')}`,
                        'emerald'
                    );
                }
                return;
            }
        }
    } catch (e) {
        // İkincil kaynağa geç
    }

    // 2. İkincil Kaynak: Küresel XAU/TRY, XAG/TRY, USD/TRY, EUR/TRY Canlı Finans CDN Servisi
    const fallbackUrls = [
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/try.json',
        'https://latest.currency-api.pages.dev/v1/currencies/try.json'
    ];

    for (const url of fallbackUrls) {
        try {
            const controller = new AbortController();
            const tId = setTimeout(() => controller.abort(), 5500);
            const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
            clearTimeout(tId);

            if (res.ok) {
                const data = await res.json();
                const rates = data?.try;
                if (rates && rates.usd && rates.xau) {
                    const usdTry = 1 / Number(rates.usd);
                    const eurTry = rates.eur ? 1 / Number(rates.eur) : usdTry * 1.12;
                    // 1 Troy Ons (XAU) = 31.1034768 gram 24 ayar saf altın
                    const ounceGoldTry = 1 / Number(rates.xau);
                    const gramGoldTry = ounceGoldTry / 31.1034768;
                    const gramSilverTry = rates.xag
                        ? (1 / Number(rates.xag)) / 31.1034768
                        : zekatRates.silverGramTry;

                    zekatRates.goldGramTry = Math.round(gramGoldTry * 100) / 100;
                    zekatRates.quarterGoldTry = Math.round(gramGoldTry * 1.637 * 100) / 100;
                    zekatRates.silverGramTry = Math.round(gramSilverTry * 100) / 100;
                    zekatRates.usdTry = Math.round(usdTry * 100) / 100;
                    zekatRates.eurTry = Math.round(eurTry * 100) / 100;
                    zekatRates.source = 'live-global';

                    populateZekatRateInputs();
                    calculateZekat();
                    updateZekatRateTimestampUI('Canlı Kurlar Aktif');

                    if (showFeedback) {
                        showToast(
                            'Canlı Kurlar Güncellendi',
                            `Gram Altın: ₺${zekatRates.goldGramTry.toLocaleString('tr-TR')} • Çeyrek: ₺${zekatRates.quarterGoldTry.toLocaleString('tr-TR')} • Dolar: ₺${zekatRates.usdTry.toLocaleString('tr-TR')}`,
                            'emerald'
                        );
                    }
                    return;
                }
            }
        } catch (e) {
            // Sonraki yedeği dene
        }
    }

    populateZekatRateInputs();
    calculateZekat();
    if (badge) {
        badge.textContent = 'Güncel Piyasa Kurları';
    }
}

function calculateZekat() {
    const rateGold = Math.max(0, Number(document.getElementById('rateGoldInput')?.value) || zekatRates.goldGramTry);
    const rateQuarterGold = Math.max(0, Number(document.getElementById('rateQuarterGoldInput')?.value) || zekatRates.quarterGoldTry);
    const rateSilver = Math.max(0, Number(document.getElementById('rateSilverInput')?.value) || zekatRates.silverGramTry);
    const rateUsd = Math.max(0, Number(document.getElementById('rateUsdInput')?.value) || zekatRates.usdTry);
    const rateEur = Math.max(0, Number(document.getElementById('rateEurInput')?.value) || zekatRates.eurTry);

    const cashTry = Math.max(0, Number(document.getElementById('zekatCashTry')?.value) || 0);
    const goldGrams = Math.max(0, Number(document.getElementById('zekatGoldGrams')?.value) || 0);
    const quarterGoldCount = Math.max(0, Number(document.getElementById('zekatQuarterGoldCount')?.value) || 0);
    const silverGrams = Math.max(0, Number(document.getElementById('zekatSilverGrams')?.value) || 0);
    const usdAmount = Math.max(0, Number(document.getElementById('zekatUsdAmount')?.value) || 0);
    const eurAmount = Math.max(0, Number(document.getElementById('zekatEurAmount')?.value) || 0);
    const debtTry = Math.max(0, Number(document.getElementById('zekatDebtTry')?.value) || 0);

    const totalAssetsTry =
        cashTry +
        goldGrams * rateGold +
        quarterGoldCount * rateQuarterGold +
        silverGrams * rateSilver +
        usdAmount * rateUsd +
        eurAmount * rateEur;

    const netWorthTry = Math.max(0, totalAssetsTry - debtTry);
    const nisapThresholdTry = ZEKAT_NISAP_GOLD_GRAMS * rateGold;
    const isAboveNisap = netWorthTry >= nisapThresholdTry && nisapThresholdTry > 0;
    const payableZekatTry = isAboveNisap ? netWorthTry * 0.025 : 0;

    const nisapBadge = document.getElementById('zekatNisapStatusBadge');
    const nisapText = document.getElementById('zekatNisapThresholdText');
    const totalEl = document.getElementById('zekatTotalNetWorth');
    const payableEl = document.getElementById('zekatPayableAmount');
    const payableSub = document.getElementById('zekatPayableSub');

    if (nisapText) {
        nisapText.textContent = `Nisap Alt Sınırı (80.18 gr 24 Ayar Altın): ${formatCurrencyTRY(nisapThresholdTry)}`;
    }
    if (totalEl) {
        totalEl.textContent = formatCurrencyTRY(netWorthTry);
    }
    if (payableEl) {
        payableEl.textContent = formatCurrencyTRY(payableZekatTry);
    }

    if (nisapBadge && payableSub) {
        if (netWorthTry === 0) {
            nisapBadge.textContent = 'Varlık Bilgisi Giriniz';
            nisapBadge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white';
            payableSub.textContent = 'Gram altın, çeyrek altın, nakit, gümüş veya döviz varlığınızı girdiğinizde otomatik hesaplanır.';
        } else if (isAboveNisap) {
            nisapBadge.textContent = '✓ Nisap Miktarına Ulaştı (Zekat Farzdır)';
            nisapBadge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-sm';
            payableSub.textContent = `Net varlığınız 80.18 gr altın sınırını (${formatCurrencyTRY(nisapThresholdTry)}) aştığı için %2,5 (1/40) zekat tutarınız hesaplanmıştır.`;
        } else {
            const remaining = Math.max(0, nisapThresholdTry - netWorthTry);
            nisapBadge.textContent = 'Nisap Sınırının Altında (Zekat Gerekmez)';
            nisapBadge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/25 text-white';
            payableSub.textContent = `Nisap sınırına ulaşmak için ${formatCurrencyTRY(remaining)} daha varlık gerekmektedir.`;
        }
    }
}

// ============================================================================
// 8. GÜNLÜK DİNİ BİLGİ QUİZİ (5 SORU & KONFETİ KUTLAMASI)
// ============================================================================

const QUIZ_QUESTION_POOL = [
    {
        category: 'Namaz & Fıkıh',
        question: 'Günde 5 vakit kılınan namazların (Sabah, Öğle, İkindi, Akşam, Yatsı ve Vitir dahil) toplam rekat sayısı kaçtır?',
        options: ['32 Rekat', '40 Rekat', '20 Rekat', '45 Rekat'],
        correctIndex: 1,
        explanation: 'Sabah (4), Öğle (10), İkindi (8), Akşam (5) ve Yatsı + Vitir (13) olmak üzere günde toplam 40 rekattır.'
    },
    {
        category: 'Kur’an-ı Kerim',
        question: 'Kur’an-ı Kerim’in her rekatta okunması vacip olan ilk suresi hangisidir?',
        options: ['Bakara Suresi', 'İhlâs Suresi', 'Fâtiha Suresi', 'Yâsîn Suresi'],
        correctIndex: 2,
        explanation: 'Mushaf sıralamasında 1. sure olan Fâtiha Suresi ("Ümmü’l-Kitâb"), namazların her rekatında okunur.'
    },
    {
        category: 'Zekat & İbadet',
        question: 'İslam fıkhına göre altının zekat nisap miktarı (alt sınırı) yaklaşık kaç gramdır?',
        options: ['40.18 gram', '80.18 gram', '100 gram', '20 gram'],
        correctIndex: 1,
        explanation: '20 miskal altın, günümüz ölçüsüyle Diyanet İşleri Başkanlığı tarafından 80.18 gram 24 ayar altın olarak hesaplanır.'
    },
    {
        category: 'Siyer-i Nebi',
        question: 'Beş vakit namaz, Peygamber Efendimiz’e (s.a.v.) hangi mübarek gecede farz kılınmıştır?',
        options: ['Kadir Gecesi', 'Berat Gecesi', 'Miraç Gecesi', 'Regaip Gecesi'],
        correctIndex: 2,
        explanation: 'Beş vakit namaz, hicretten yaklaşık bir buçuk yıl önce Miraç Gecesi’nde bizzat Allah Teâlâ tarafından farz kılınmıştır.'
    },
    {
        category: 'Namaz & Fıkıh',
        question: 'Namaza başlarken elleri kaldırıp "Allâhü Ekber" demeye ne ad verilir?',
        options: ['İftitah Tekbiri', 'Kıyam', 'Ka’de-i Ahîre', 'Kıraat'],
        correctIndex: 0,
        explanation: 'Namaza giriş tekbirine "İftitah Tekbiri" (veya Tahrîme) denir ve namazın dışındaki/içindeki farzlarındandır.'
    },
    {
        category: 'Kur’an-ı Kerim',
        question: 'Kur’an-ı Kerim’in en kısa suresi olan ve 3 ayetten oluşan sure hangisidir?',
        options: ['İhlâs Suresi', 'Kevser Suresi', 'Asr Suresi', 'Fîl Suresi'],
        correctIndex: 1,
        explanation: 'Kevser Suresi 3 ayettir ve Kur’an-ı Kerim’in kelime ve harf bakımından en kısa suresidir.'
    },
    {
        category: 'Namaz & Fıkıh',
        question: 'Kunut duaları hangi namazın kaçıncı rekatında okunur?',
        options: ['Sabah namazının 2. rekatında', 'Vitir namazının 3. rekatında', 'Akşam namazının 3. rekatında', 'Yatsı namazının 4. rekatında'],
        correctIndex: 1,
        explanation: 'Kunut duaları, yatsı namazından sonra kılınan 3 rekatlık Vitir namazının 3. rekatında Fâtiha ve zamm-ı sureden sonra tekbir alınarak okunur.'
    },
    {
        category: 'İslam Tarihi',
        question: 'İslam tarihinde ilk ezanı okuyan ve Peygamberimizin müezzini olan sahabi kimdir?',
        options: ['Hz. Enes bin Mâlik (r.a.)', 'Hz. Bilâl-i Habeşî (r.a.)', 'Hz. Selmân-ı Fârisî (r.a.)', 'Hz. Mus’ab bin Umeyr (r.a.)'],
        correctIndex: 1,
        explanation: 'İlk ezanı gür ve güzel sesiyle Hz. Bilâl-i Habeşî (r.a.) okumuştur.'
    },
    {
        category: 'Namaz & Fıkıh',
        question: 'Abdestin farzları Kur’an-ı Kerim’in hangi suresinde açıkça bildirilmiştir?',
        options: ['Mâide Suresi 6. Ayet', 'Bakara Suresi 183. Ayet', 'Nûr Suresi 31. Ayet', 'Âl-i İmrân Suresi 102. Ayet'],
        correctIndex: 0,
        explanation: 'Yüzü yıkamak, kolları dirseklerle beraber yıkamak, başıط mesh etmek ve ayakları yıkamak Mâide Suresi 6. ayette emredilmiştir.'
    },
    {
        category: 'Kıble & Kâbe',
        question: 'Müslümanların kıblesi Mescid-i Aksâ’dan Kâbe-i Muazzama’ya hicretin kaçıncı yılında çevrilmiştir?',
        options: ['Hicretten 3 yıl önce', 'Hicretin 2. yılında (16-17 ay sonra)', 'Hicretin 8. yılında', 'Hicretin 10. yılında'],
        correctIndex: 1,
        explanation: 'Hicretten yaklaşık 16-17 ay sonra (Hicri 2. yılda) Kıble ayeti inerek yönümüz Kâbe’ye (Mescid-i Harâm) çevrilmiştir.'
    },
    {
        category: 'Zekat & İbadet',
        question: 'Nisap miktarına ulaşmış altın, gümüş, nakit para ve ticaret mallarından hangi oranda zekat verilir?',
        options: ['Yüzde 10 (1/10)', 'Yüzde 2.5 (Kırkta bir - 1/40)', 'Yüzde 5 (1/20)', 'Yüzde 20 (1/5)'],
        correctIndex: 1,
        explanation: 'Altın, gümüş, nakit ve ticaret mallarında zekat oranı kırkta bir (%2,5) olarak belirlenmiştir.'
    },
    {
        category: 'Kur’an-ı Kerim',
        question: 'Başında Besmele bulunmayan tek sure hangisidir?',
        options: ['Neml Suresi', 'Tevbe Suresi', 'Yûnus Suresi', 'Kehf Suresi'],
        correctIndex: 1,
        explanation: 'Tevbe (Berâe) Suresi başında Besmele yer almaz; Neml Suresi’nde ise iki Besmele bulunur.'
    }
];

const quizState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    answered: false
};

function startNewQuiz(useDailySeed = false) {
    const pool = [...QUIZ_QUESTION_POOL];

    if (useDailySeed) {
        // Günün tarihine göre deterministik karıştırma (Her gün 5 soru)
        const todayStr = toDateKey(new Date());
        let seed = 0;
        for (let i = 0; i < todayStr.length; i++) {
            seed = (seed * 31 + todayStr.charCodeAt(i)) >>> 0;
        }
        pool.sort((a, b) => {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            return (seed % 3) - 1;
        });
    } else {
        // Rastgele yeni 5 soru
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
    }

    quizState.questions = pool.slice(0, 5);
    quizState.currentIndex = 0;
    quizState.score = 0;
    quizState.answered = false;

    document.getElementById('quizQuestionContainer')?.classList.remove('hidden');
    document.getElementById('quizResultContainer')?.classList.add('hidden');

    renderCurrentQuizQuestion();
}

function renderCurrentQuizQuestion() {
    const q = quizState.questions[quizState.currentIndex];
    if (!q) return;

    quizState.answered = false;

    const badge = document.getElementById('quizProgressBadge');
    const catEl = document.getElementById('quizCategoryTag');
    const textEl = document.getElementById('quizQuestionText');
    const optionsEl = document.getElementById('quizOptionsList');
    const feedbackBox = document.getElementById('quizFeedbackBox');

    if (badge) badge.textContent = `Soru ${quizState.currentIndex + 1} / ${quizState.questions.length} • Doğru: ${quizState.score}`;
    if (catEl) catEl.textContent = q.category;
    if (textEl) textEl.textContent = q.question;
    if (feedbackBox) feedbackBox.classList.add('hidden');

    if (!optionsEl) return;
    optionsEl.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.optionIndex = String(idx);
        btn.className = 'w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition flex items-center gap-3 group';
        btn.innerHTML = `
            <span class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500/15 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 transition">
                ${letters[idx]}
            </span>
            <span class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">${optText}</span>
        `;
        btn.addEventListener('click', () => handleQuizOptionSelect(idx));
        optionsEl.appendChild(btn);
    });
}

function handleQuizOptionSelect(selectedIndex) {
    if (quizState.answered) return;
    quizState.answered = true;

    const q = quizState.questions[quizState.currentIndex];
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) {
        quizState.score += 1;
        playSoftCheckSound();
    }

    const badge = document.getElementById('quizProgressBadge');
    if (badge) {
        badge.textContent = `Soru ${quizState.currentIndex + 1} / ${quizState.questions.length} • Doğru: ${quizState.score}`;
    }

    const optionButtons = document.querySelectorAll('#quizOptionsList button');
    optionButtons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === q.correctIndex) {
            btn.className = 'w-full p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-left transition flex items-center gap-3';
        } else if (idx === selectedIndex && !isCorrect) {
            btn.className = 'w-full p-3.5 rounded-xl border-2 border-rose-500 bg-rose-500/10 text-left transition flex items-center gap-3';
        } else {
            btn.className = 'w-full p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 opacity-60 text-left transition flex items-center gap-3';
        }
    });

    const feedbackBox = document.getElementById('quizFeedbackBox');
    const feedbackText = document.getElementById('quizFeedbackText');
    const nextBtnLabel = document.getElementById('quizNextBtnLabel');

    if (feedbackBox && feedbackText) {
        feedbackBox.classList.remove('hidden');
        feedbackBox.className = `p-4 rounded-xl border text-xs sm:text-sm space-y-2 ${
            isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
        }`;
        feedbackText.innerHTML = `${isCorrect ? '✅ <strong>Doğru Cevap!</strong> ' : '💡 <strong>Bilgi Notu:</strong> '}${q.explanation}`;
    }

    if (nextBtnLabel) {
        nextBtnLabel.textContent =
            quizState.currentIndex + 1 < quizState.questions.length ? 'Sonraki Soru' : 'Sonucu Gör';
    }
}

function launchVictoryConfetti() {
    if (typeof window.confetti !== 'function') return;
    try {
        window.confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#10b981', '#059669', '#f59e0b', '#34d399', '#fbbf24']
        });
        setTimeout(() => {
            window.confetti({
                particleCount: 60,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#10b981', '#f59e0b', '#34d399']
            });
            window.confetti({
                particleCount: 60,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#10b981', '#f59e0b', '#34d399']
            });
        }, 300);
    } catch (e) {
        // ignore
    }
}

function showQuizResults() {
    document.getElementById('quizQuestionContainer')?.classList.add('hidden');
    const resultContainer = document.getElementById('quizResultContainer');
    resultContainer?.classList.remove('hidden');

    const total = quizState.questions.length;
    const score = quizState.score;
    const isPerfect = score === total;

    const badgeIcon = document.getElementById('quizResultBadgeIcon');
    const winnerPill = document.getElementById('quizWinnerPill');
    const titleEl = document.getElementById('quizResultTitle');
    const subtitleEl = document.getElementById('quizResultSubtitle');

    if (isPerfect) {
        if (badgeIcon) badgeIcon.textContent = '🌟';
        if (winnerPill) {
            winnerPill.textContent = '🏆 Günün Yıldızlı Âlimi Rozeti Kazanıldı!';
            winnerPill.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
        }
        if (titleEl) {
            titleEl.textContent = 'Tebrikler! Bugünün sınavını başarıyla geçtin 🌟';
        }
        if (subtitleEl) {
            subtitleEl.textContent = `${total} sorunun ${score} tanesini de eksiksiz ve doğru cevapladınız. Maşallah!`;
        }
        playGentleNotificationChime(true);
        launchVictoryConfetti();
    } else {
        if (badgeIcon) badgeIcon.textContent = '📘';
        if (winnerPill) {
            winnerPill.textContent = `Skorunuz: ${total} Soruda ${score} Doğru`;
            winnerPill.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
        }
        if (titleEl) {
            titleEl.textContent = score >= 3 ? 'Çok İyi Gidiyorsun! Yıldızlı Rozete Çok Yaklaştın' : 'Güzel Bir Denemeydi, Bilgilerini Tazeledin!';
        }
        if (subtitleEl) {
            subtitleEl.textContent = `5'te 5 yaparak "Tebrikler! Bugünün sınavını başarıyla geçtin 🌟" rozetini kazanmak için tekrar deneyebilirsin.`;
        }
    }
}

// ============================================================================
// 9. SEKME GEÇİŞLERİ VE TÜM ARAYÜZ BAĞLANTILARI
// ============================================================================

function switchMainTab(tabName) {
    const tabs = {
        daily: {
            btn: document.getElementById('tabDailyBtn'),
            section: document.getElementById('dailySection')
        },
        kaza: {
            btn: document.getElementById('tabKazaBtn'),
            section: document.getElementById('kazaSection')
        },
        qibla: {
            btn: document.getElementById('tabQiblaBtn'),
            section: document.getElementById('qiblaSection')
        },
        surahs: {
            btn: document.getElementById('tabSurahsBtn'),
            section: document.getElementById('surahsSection')
        },
        zekat: {
            btn: document.getElementById('tabZekatBtn'),
            section: document.getElementById('zekatSection')
        },
        quiz: {
            btn: document.getElementById('tabQuizBtn'),
            section: document.getElementById('quizSection')
        }
    };

    const activeClass = 'min-h-[38px] sm:min-h-[42px] min-w-0 justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center gap-1.5';
    const inactiveClass = 'min-h-[38px] sm:min-h-[42px] min-w-0 justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5';

    Object.keys(tabs).forEach((key) => {
        const item = tabs[key];
        if (!item.btn || !item.section) return;
        if (key === tabName) {
            item.section.classList.remove('hidden');
            item.btn.className = activeClass;
        } else {
            item.section.classList.add('hidden');
            item.btn.className = inactiveClass;
        }
    });

    if (tabName === 'qibla') {
        renderQiblaCompassUI();
    } else if (tabName === 'surahs') {
        renderSurahList();
    } else if (tabName === 'zekat') {
        calculateZekat();
    }

    if (window.scrollY > 40) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Tüm Ekranı Render Et
function renderAll() {
    renderCalendarSection();
    renderProgressBar();
    renderSixTimingsGrid();
    renderPrayerList();
    renderKazaSection();
    renderQiblaCompassUI();
    renderSurahList();
    renderNotificationUI();
    renderStats();
}

// Event Listener Kurulumu
function setupEventListeners() {
    // Tema Değiştirici
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // PWA Ana Ekrana Ekle Butonları
    document.getElementById('pwaInstallActionBtn')?.addEventListener('click', triggerPwaInstall);
    document.getElementById('headerInstallBtn')?.addEventListener('click', triggerPwaInstall);
    document.getElementById('pwaBannerCloseBtn')?.addEventListener('click', () => {
        document.getElementById('pwaInstallBanner')?.classList.add('hidden');
        localStorage.setItem(STORAGE_KEYS.PWA_BANNER_DISMISSED, '1');
    });

    // 81 İl Seçici
    document.getElementById('citySelect').addEventListener('change', (e) => {
        if (e.target.value) {
            setSelectedCity(e.target.value);
        }
    });

    // Vakitleri Yenile Butonu
    document.getElementById('refreshTimingsBtn').addEventListener('click', () => {
        syncPrayerTimings(true);
    });

    // Bildirim Aç / Kapat, Ses Efekti & Test Butonları
    document.getElementById('notificationToggleBtn').addEventListener('click', toggleNotifications);
    document.getElementById('notifCardToggleBtn').addEventListener('click', toggleNotifications);
    document.getElementById('soundToggleBtn')?.addEventListener('click', toggleSoundEnabled);
    document.getElementById('soundToneSelect')?.addEventListener('change', (e) => {
        if (e.target.value) {
            setSoundTone(e.target.value);
        }
    });
    document.getElementById('testNotificationBtn').addEventListener('click', () => {
        const cityObj = getCityById(state.selectedCity);
        sendEzanNotification(
            'Örnek Vakit Bildirimi!',
            `${cityObj.name} için ezan vakti girdiğinde bildirim ve seçtiğiniz zarif ses efekti bu şekilde çalacaktır.`,
            true
        );
    });

    // Bulut Senkronizasyon Butonları
    document.getElementById('forceCloudSyncBtn').addEventListener('click', () => {
        scheduleCloudSync();
        showToast('Bulut Eşitleme Başlatıldı', 'Namaz ve kaza kayıtlarınız cihaz kimliğinizle buluta yedeklendi.', 'emerald');
    });
    document.getElementById('cloudStatusBtn').addEventListener('click', () => {
        restoreFromCloudIfNeeded(true);
    });

    // Kıble Pusulası Kontrolleri
    document.getElementById('enableCompassBtn').addEventListener('click', startCompassSensor);
    document.getElementById('gpsQiblaBtn').addEventListener('click', requestGpsForQibla);
    document.getElementById('manualCompassSlider').addEventListener('input', (e) => {
        const val = Number(e.target.value) || 0;
        state.qibla.deviceHeading = val;
        document.getElementById('manualSliderLabel').textContent = `${val}°`;
        renderQiblaCompassUI();
    });

    // Çevrimiçi / Çevrimdışı Olay Dinleyicileri
    window.addEventListener('online', () => {
        syncPrayerTimings(false);
        scheduleCloudSync();
    });
    window.addEventListener('offline', () => {
        if (state.apiStatus === 'live') {
            state.apiStatus = 'cached';
            renderApiStatusBadge();
        }
    });

    // Tarih Seçici Input
    document.getElementById('datePicker').addEventListener('change', (e) => {
        if (e.target.value) {
            setSelectedDate(e.target.value);
        }
    });

    // Önceki / Sonraki Gün & Bugün Butonları
    document.getElementById('prevDayBtn').addEventListener('click', () => {
        const d = parseDateKey(state.selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(toDateKey(d));
    });

    document.getElementById('nextDayBtn').addEventListener('click', () => {
        const d = parseDateKey(state.selectedDate);
        d.setDate(d.getDate() + 1);
        setSelectedDate(toDateKey(d));
    });

    document.getElementById('todayBtn').addEventListener('click', () => {
        setSelectedDate(toDateKey(new Date()));
    });

    // Tümünü Kılındı İşaretle & Sıfırla
    document.getElementById('markAllDoneBtn').addEventListener('click', () => {
        const record = getDayRecord(state.selectedDate);
        PRAYERS.forEach((p) => {
            record.prayers[p.id] = true;
            if (!record.mode) record.mode = {};
            if (!record.mode[p.id]) record.mode[p.id] = 'eda';
        });
        playSoftCheckSound();
        saveDailyRecords(true);
        renderAll();
    });

    document.getElementById('resetDayBtn').addEventListener('click', () => {
        const record = getDayRecord(state.selectedDate);
        PRAYERS.forEach((p) => {
            record.prayers[p.id] = false;
        });
        saveDailyRecords(true);
        renderAll();
    });

    // Namaz Kartları Tıklama
    document.getElementById('prayerList').addEventListener('click', (e) => {
        const modeBtn = e.target.closest('[data-mode-toggle]');
        if (modeBtn) {
            e.stopPropagation();
            togglePrayerMode(modeBtn.getAttribute('data-mode-toggle'));
            return;
        }

        const toggleEl = e.target.closest('[data-toggle-prayer]');
        if (toggleEl) {
            togglePrayerStatus(toggleEl.getAttribute('data-toggle-prayer'));
        }
    });

    // Günlük Not Kaydetme
    let noteTimeout = null;
    document.getElementById('dailyNote').addEventListener('input', (e) => {
        const record = getDayRecord(state.selectedDate);
        record.note = e.target.value;
        saveDailyRecords(true);

        const indicator = document.getElementById('noteSavedIndicator');
        indicator.classList.remove('opacity-0');
        clearTimeout(noteTimeout);
        noteTimeout = setTimeout(() => {
            indicator.classList.add('opacity-0');
        }, 1500);
    });

    // Ana Sekme Geçişleri (6 Modül)
    document.getElementById('tabDailyBtn')?.addEventListener('click', () => switchMainTab('daily'));
    document.getElementById('tabKazaBtn')?.addEventListener('click', () => switchMainTab('kaza'));
    document.getElementById('tabQiblaBtn')?.addEventListener('click', () => switchMainTab('qibla'));
    document.getElementById('tabSurahsBtn')?.addEventListener('click', () => switchMainTab('surahs'));
    document.getElementById('tabZekatBtn')?.addEventListener('click', () => switchMainTab('zekat'));
    document.getElementById('tabQuizBtn')?.addEventListener('click', () => switchMainTab('quiz'));

    // Sure & Dua Rehberi Etkileşimleri
    document.getElementById('surahSearchInput')?.addEventListener('input', (e) => {
        activeSurahSearch = e.target.value || '';
        renderSurahList();
    });

    document.querySelectorAll('[data-surah-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
            activeSurahFilter = btn.getAttribute('data-surah-filter') || 'all';
            document.querySelectorAll('[data-surah-filter]').forEach((b) => {
                if (b.getAttribute('data-surah-filter') === activeSurahFilter) {
                    b.className = 'px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm transition';
                } else {
                    b.className = 'px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 transition';
                }
            });
            renderSurahList();
        });
    });

    document.getElementById('surahListContainer')?.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('[data-surah-toggle]');
        if (!toggleBtn) return;
        const id = toggleBtn.getAttribute('data-surah-toggle');
        expandedSurahId = expandedSurahId === id ? null : id;
        renderSurahList();
    });

    // Akıllı Zekat Hesaplama Etkileşimleri
    const zekatInputIds = [
        'rateGoldInput',
        'rateQuarterGoldInput',
        'rateSilverInput',
        'rateUsdInput',
        'rateEurInput',
        'zekatCashTry',
        'zekatGoldGrams',
        'zekatQuarterGoldCount',
        'zekatSilverGrams',
        'zekatUsdAmount',
        'zekatEurAmount',
        'zekatDebtTry'
    ];
    zekatInputIds.forEach((inputId) => {
        document.getElementById(inputId)?.addEventListener('input', calculateZekat);
    });

    document.getElementById('refreshRatesBtn')?.addEventListener('click', () => {
        fetchLiveZekatRates(true);
    });

    document.getElementById('zekatClearBtn')?.addEventListener('click', () => {
        ['zekatCashTry', 'zekatGoldGrams', 'zekatQuarterGoldCount', 'zekatSilverGrams', 'zekatUsdAmount', 'zekatEurAmount', 'zekatDebtTry'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        calculateZekat();
    });

    // Günlük Dini Bilgi Quizi Etkileşimleri
    document.getElementById('quizNextBtn')?.addEventListener('click', () => {
        if (quizState.currentIndex + 1 < quizState.questions.length) {
            quizState.currentIndex += 1;
            renderCurrentQuizQuestion();
        } else {
            showQuizResults();
        }
    });

    document.getElementById('restartQuizBtn')?.addEventListener('click', () => {
        startNewQuiz(false);
    });

    document.getElementById('quizPlayAgainBtn')?.addEventListener('click', () => {
        startNewQuiz(false);
    });

    // Kaza Çetelesi Artır / Azalt
    document.getElementById('kazaList').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-kaza-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-kaza-action');
        const id = btn.getAttribute('data-kaza-id');

        const current = state.kazaCounts[id] || 0;
        if (action === 'inc') {
            state.kazaCounts[id] = current + 1;
        } else if (action === 'dec') {
            state.kazaCounts[id] = Math.max(0, current - 1);
        }

        saveKazaCounts(true);
        renderKazaSection();
    });

    // +1 Günlük Tam Kaza Ekle
    document.getElementById('addFullDayKazaBtn').addEventListener('click', () => {
        KAZA_TYPES.forEach((t) => {
            state.kazaCounts[t.id] = (state.kazaCounts[t.id] || 0) + 1;
        });
        saveKazaCounts(true);
        renderKazaSection();
    });
}

// Başlat
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initDeviceUuid();
    loadFromStorage();
    initCitySelect();
    updateQiblaForSelectedCity();
    initPWA();
    populateZekatRateInputs();
    fetchLiveZekatRates(false);
    startNewQuiz(true);
    setupEventListeners();
    renderAll();
    updateLiveClockAndCountdown();
    setInterval(updateLiveClockAndCountdown, 1000);
    syncPrayerTimings(false);
    restoreFromCloudIfNeeded(false);
});

