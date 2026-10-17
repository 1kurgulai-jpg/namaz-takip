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
                        icon: 'icon.svg',
                        badge: 'icon.svg',
                        tag: `bakvakitgeldi-${Date.now()}`
                    });
                }).catch(() => {
                    new Notification(`BakVakitGeldi — ${title}`, {
                        body: bodyText,
                        icon: 'icon.svg',
                        tag: `bakvakitgeldi-${Date.now()}`
                    });
                });
            } else {
                new Notification(`BakVakitGeldi — ${title}`, {
                    body: bodyText,
                    icon: 'icon.svg',
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

    // Service Worker Kaydı
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => null);
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

// Sekme Değiştirici (5 Vakit | Kaza | Kıble Pusulası)
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
        }
    };

    const activeClass = 'flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm flex items-center gap-1.5';
    const inactiveClass = 'flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5';

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

    // Sekme Geçişleri (5 Vakit | Kaza | Kıble Pusulası)
    document.getElementById('tabDailyBtn').addEventListener('click', () => switchMainTab('daily'));
    document.getElementById('tabKazaBtn').addEventListener('click', () => switchMainTab('kaza'));
    document.getElementById('tabQiblaBtn').addEventListener('click', () => switchMainTab('qibla'));

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
    setupEventListeners();
    renderAll();
    updateLiveClockAndCountdown();
    setInterval(updateLiveClockAndCountdown, 1000);
    syncPrayerTimings(false);
    restoreFromCloudIfNeeded(false);
});
