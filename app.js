/**
 * Nûr Vakit — Namaz & Kaza Takip Uygulaması
 * Dinamik Namaz Vakitleri API (Aladhan Diyanet Method=13) + Çevrimdışı Yedek Mod + LocalStorage
 */

const STORAGE_KEYS = {
    DAILY_RECORDS: 'nurvakit_daily_records_v1',
    KAZA_COUNTS: 'nurvakit_kaza_counts_v1',
    THEME: 'nurvakit_theme_v1',
    SELECTED_CITY: 'nurvakit_selected_city_v1',
    TIMINGS_CACHE: 'nurvakit_timings_cache_v1'
};

// Şehir Listesi (offsetMinutes: İstanbul'a göre yaklaşık yerel vakit farkı - çevrimdışı yedek mod için)
const CITIES = [
    { id: 'Istanbul', name: 'İstanbul', offsetMinutes: 0 },
    { id: 'Ankara', name: 'Ankara', offsetMinutes: -15 },
    { id: 'Izmir', name: 'İzmir', offsetMinutes: +7 },
    { id: 'Bursa', name: 'Bursa', offsetMinutes: 0 },
    { id: 'Antalya', name: 'Antalya', offsetMinutes: -7 },
    { id: 'Konya', name: 'Konya', offsetMinutes: -14 },
    { id: 'Adana', name: 'Adana', offsetMinutes: -25 },
    { id: 'Sanliurfa', name: 'Şanlıurfa', offsetMinutes: -39 },
    { id: 'Gaziantep', name: 'Gaziantep', offsetMinutes: -33 },
    { id: 'Kocaeli', name: 'Kocaeli', offsetMinutes: -4 },
    { id: 'Mersin', name: 'Mersin', offsetMinutes: -22 },
    { id: 'Diyarbakir', name: 'Diyarbakır', offsetMinutes: -45 },
    { id: 'Kayseri', name: 'Kayseri', offsetMinutes: -26 },
    { id: 'Eskisehir', name: 'Eskişehir', offsetMinutes: -6 },
    { id: 'Samsun', name: 'Samsun', offsetMinutes: -29 },
    { id: 'Trabzon', name: 'Trabzon', offsetMinutes: -43 },
    { id: 'Erzurum', name: 'Erzurum', offsetMinutes: -49 },
    { id: 'Malatya', name: 'Malatya', offsetMinutes: -37 },
    { id: 'Van', name: 'Van', offsetMinutes: -57 },
    { id: 'Sakarya', name: 'Sakarya', offsetMinutes: -6 }
];

// 6 Resmi Vakit Anahtarları
const SIX_VAKIT_META = [
    { key: 'imsak', label: 'İmsak', apiKey: 'Fajr', prayerId: 'sabah' },
    { key: 'gunes', label: 'Güneş', apiKey: 'Sunrise', prayerId: null },
    { key: 'ogle', label: 'Öğle', apiKey: 'Dhuhr', prayerId: 'ogle' },
    { key: 'ikindi', label: 'İkindi', apiKey: 'Asr', prayerId: 'ikindi' },
    { key: 'aksam', label: 'Akşam', apiKey: 'Maghrib', prayerId: 'aksam' },
    { key: 'yatsi', label: 'Yatsı', apiKey: 'Isha', prayerId: 'yatsi' }
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

// Çevrimdışı / Yedek Mod için varsayılan vakit hesaplayıcı (Şehir farkı dahil)
function getFallbackTimings(cityId, dateKey) {
    const cityObj = CITIES.find((c) => c.id === cityId) || CITIES[0];
    const offset = cityObj.offsetMinutes || 0;

    // İstanbul bazlı varsayılan saatler (Diyanet standartlarına yakın)
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
    selectedDateTimings: getFallbackTimings('Istanbul', toDateKey(new Date())),
    todayTimings: getFallbackTimings('Istanbul', toDateKey(new Date())),
    apiStatus: 'loading', // 'live' | 'cached' | 'offline' | 'loading'
    activePrayerIdNow: null, // Şu an hangi namazın vaktindeyiz ('sabah', 'ogle', 'ikindi', 'aksam', 'yatsi' veya null)
    activeVakitKeyNow: null  // 'imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'
};

// LocalStorage Yükleme & Kaydetme
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
    } catch (err) {
        console.error('Veri okuma hatası:', err);
    }
}

function saveDailyRecords() {
    try {
        localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(state.dailyRecords));
    } catch (err) {
        console.error('Veri kaydetme hatası:', err);
    }
}

function saveKazaCounts() {
    try {
        localStorage.setItem(STORAGE_KEYS.KAZA_COUNTS, JSON.stringify(state.kazaCounts));
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

// API'den Vakitleri Çek (veya Önbellek / Yedek Mod Kullan)
async function fetchTimings(cityId, dateKey, forceRefresh = false) {
    const cacheKey = `${cityId}_${dateKey}`;

    if (!forceRefresh && state.timingsCache[cacheKey]) {
        return { ...state.timingsCache[cacheKey], source: 'cached' };
    }

    const apiDate = toApiDateParam(dateKey);
    const url = `https://api.aladhan.com/v1/timingsByCity/${apiDate}?city=${encodeURIComponent(cityId)}&country=Turkey&method=13`;

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
        // Eğer önbellekte varsa önbellekten dön
        if (state.timingsCache[cacheKey]) {
            return { ...state.timingsCache[cacheKey], source: 'cached' };
        }
        // Yoksa çevrimdışı varsayılan saatlere düş (uygulama asla çökmez)
        return getFallbackTimings(cityId, dateKey);
    }
}

// Hem bugünün hem de seçili tarihin vakitlerini senkronize et
async function syncPrayerTimings(forceRefresh = false) {
    const todayKey = toDateKey(new Date());
    const cityId = state.selectedCity;

    // Yükleniyor durumu göster
    state.apiStatus = 'loading';
    renderApiStatusBadge();

    // Önce varsa önbellek veya yedek veriyi hemen göster (sıfır gecikme hissi)
    const immediateSelected = state.timingsCache[`${cityId}_${state.selectedDate}`]
        || getFallbackTimings(cityId, state.selectedDate);
    const immediateToday = state.timingsCache[`${cityId}_${todayKey}`]
        || getFallbackTimings(cityId, todayKey);

    state.selectedDateTimings = immediateSelected;
    state.todayTimings = immediateToday;
    updateLiveClockAndCountdown();
    renderSixTimingsGrid();
    renderPrayerList();

    // API'den güncel verileri çek
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
    const cityObj = CITIES.find((c) => c.id === state.selectedCity) || CITIES[0];

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
        text.textContent = `${cityObj.name} • Çevrimdışı Yedek Mod (Varsayılan Saatler)`;
    }
}

// Canlı Saat ve Bir Sonraki Vakte Geri Sayım Hesaplayıcı
function updateLiveClockAndCountdown() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const clockEl = document.getElementById('liveClock');
    if (clockEl) {
        clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

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
    let nextItem;
    let startSec;
    let endSec;

    if (currentIdx === -1) {
        // Gece 00:00 ile İmsak arası (Yatsı vakti devam ediyor)
        currentItem = {
            ...schedule[5],
            windowStr: `${t.yatsi} - ${t.imsak}`
        };
        nextItem = schedule[0];
        startSec = schedule[5].sec - 86400; // Dünkü yatsı
        endSec = schedule[0].sec;
    } else if (currentIdx === 5) {
        // Yatsıdan gece yarısı / yarınki imsaka kadar
        currentItem = {
            ...schedule[5],
            windowStr: `${t.yatsi} - ${t.imsak}`
        };
        nextItem = schedule[0];
        startSec = schedule[5].sec;
        endSec = schedule[0].sec + 86400; // Yarınki imsak
    } else {
        currentItem = {
            ...schedule[currentIdx],
            windowStr: `${schedule[currentIdx].timeStr} - ${schedule[currentIdx + 1].timeStr}`
        };
        nextItem = schedule[currentIdx + 1];
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

    // Vakit değiştiyse 6'lı vakit kutularını ve namaz listesini yeniden vurgula
    if (prevActiveVakit !== state.activeVakitKeyNow) {
        renderSixTimingsGrid();
        renderPrayerList();
    }
}

// 6 Resmi Vakit Kutucuklarını Render Et (İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı)
function renderSixTimingsGrid() {
    const grid = document.getElementById('sixTimingsGrid');
    if (!grid) return;

    const isTodaySelected = state.selectedDate === toDateKey(new Date());
    const timings = state.selectedDateTimings || getFallbackTimings(state.selectedCity, state.selectedDate);

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

// Şehir Seçim Menüsünü Doldur
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
            mode: {}, // 'eda' veya 'kaza'
            note: ''
        };
    }
    return state.dailyRecords[dateKey];
}

// Bir günde kaç vakit kılındığını hesapla
function getCompletedCountForDate(dateKey) {
    const record = state.dailyRecords[dateKey];
    if (!record || !record.prayers) return 0;
    return PRAYERS.reduce((acc, p) => acc + (record.prayers[p.id] ? 1 : 0), 0);
}

// Tema Yönetimi (Koyu / Açık)
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

    // Uzun Türkçe Tarih Formatı
    const formatter = new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
    });
    document.getElementById('selectedDateFormatted').textContent = formatter.format(selectedDateObj);

    // Tarih Input Değeri
    const datePicker = document.getElementById('datePicker');
    if (datePicker.value !== state.selectedDate) {
        datePicker.value = state.selectedDate;
    }

    // Bugün Rozeti ve "Bugün" Butonu
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

    // 7 Günlük Şerit
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

// Günlük İlerleme Çubuğunu (Progress Bar) Güncelle
function renderProgressBar() {
    const completedCount = getCompletedCountForDate(state.selectedDate);
    const totalCount = PRAYERS.length; // 5
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

// 5 Vakit Namaz Listesini Render Et (Otomatik Vakit Eşleşmeli)
function renderPrayerList(changedPrayerId = null) {
    const container = document.getElementById('prayerList');
    const record = getDayRecord(state.selectedDate);
    const timings = state.selectedDateTimings || getFallbackTimings(state.selectedCity, state.selectedDate);
    const isTodaySelected = state.selectedDate === toDateKey(new Date());

    container.innerHTML = '';

    PRAYERS.forEach((prayer) => {
        const isPrayed = Boolean(record.prayers[prayer.id]);
        const mode = record.mode?.[prayer.id] || 'eda';
        const isJustChanged = changedPrayerId === prayer.id;
        const isCurrentActivePrayer = isTodaySelected && state.activePrayerIdNow === prayer.id;

        // Vakit saatini belirle (Sabah için İmsak ve Güneş aralığını göster)
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
                <!-- Sol Kısım: İkon, Vakit İsmi ve Gerçek Vakit Saati -->
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

                            <!-- Gerçek Vakit Saati Rozeti -->
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

                <!-- Sağ Kısım: Kılındı / Kılınmadı İnteraktif Butonları -->
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

    // Günlük not alanını güncelle
    const noteInput = document.getElementById('dailyNote');
    if (noteInput) {
        noteInput.value = record.note || '';
    }

    // İkonları yenile
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

// Genel İstatistikleri ve Seri (Streak) Hesaplamasını Güncelle
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

    // Son 7 gün oranı
    const today = new Date();
    let last7Completed = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        last7Completed += getCompletedCountForDate(toDateKey(d));
    }
    const weeklyRate = Math.round((last7Completed / 35) * 100);

    // Seri (Streak) hesabı: Bugünden geriye 5/5 tamamlanan günler
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

// Şehir Değiştirme
function setSelectedCity(cityId) {
    state.selectedCity = cityId;
    try {
        localStorage.setItem(STORAGE_KEYS.SELECTED_CITY, cityId);
    } catch (e) {
        console.error(e);
    }
    syncPrayerTimings(false);
}

// Namaz Durumunu Değiştir (Kılındı / Kılınmadı)
function togglePrayerStatus(prayerId) {
    const record = getDayRecord(state.selectedDate);
    record.prayers[prayerId] = !record.prayers[prayerId];
    if (!record.mode) record.mode = {};
    if (record.prayers[prayerId] && !record.mode[prayerId]) {
        record.mode[prayerId] = 'eda';
    }

    saveDailyRecords();
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
    saveDailyRecords();
    renderPrayerList(prayerId);
}

// Tüm Ekranı Render Et
function renderAll() {
    renderCalendarSection();
    renderProgressBar();
    renderSixTimingsGrid();
    renderPrayerList();
    renderKazaSection();
    renderStats();
}

// Event Listener Kurulumu
function setupEventListeners() {
    // Tema Değiştirici
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Şehir Seçici
    document.getElementById('citySelect').addEventListener('change', (e) => {
        if (e.target.value) {
            setSelectedCity(e.target.value);
        }
    });

    // Vakitleri Yenile Butonu
    document.getElementById('refreshTimingsBtn').addEventListener('click', () => {
        syncPrayerTimings(true);
    });

    // Çevrimiçi / Çevrimdışı Olay Dinleyicileri
    window.addEventListener('online', () => syncPrayerTimings(false));
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
        saveDailyRecords();
        renderAll();
    });

    document.getElementById('resetDayBtn').addEventListener('click', () => {
        const record = getDayRecord(state.selectedDate);
        PRAYERS.forEach((p) => {
            record.prayers[p.id] = false;
        });
        saveDailyRecords();
        renderAll();
    });

    // Namaz Kartları Tıklama (Event Delegation)
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
        saveDailyRecords();

        const indicator = document.getElementById('noteSavedIndicator');
        indicator.classList.remove('opacity-0');
        clearTimeout(noteTimeout);
        noteTimeout = setTimeout(() => {
            indicator.classList.add('opacity-0');
        }, 1500);
    });

    // Sekme Geçişleri (Günlük 5 Vakit <-> Kaza Çetelesi)
    const tabDailyBtn = document.getElementById('tabDailyBtn');
    const tabKazaBtn = document.getElementById('tabKazaBtn');
    const dailySection = document.getElementById('dailySection');
    const kazaSection = document.getElementById('kazaSection');

    tabDailyBtn.addEventListener('click', () => {
        dailySection.classList.remove('hidden');
        kazaSection.classList.add('hidden');
        tabDailyBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm flex items-center gap-2';
        tabKazaBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2';
    });

    tabKazaBtn.addEventListener('click', () => {
        kazaSection.classList.remove('hidden');
        dailySection.classList.add('hidden');
        tabKazaBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm flex items-center gap-2';
        tabDailyBtn.className = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2';
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

        saveKazaCounts();
        renderKazaSection();
    });

    // +1 Günlük Tam Kaza Ekle
    document.getElementById('addFullDayKazaBtn').addEventListener('click', () => {
        KAZA_TYPES.forEach((t) => {
            state.kazaCounts[t.id] = (state.kazaCounts[t.id] || 0) + 1;
        });
        saveKazaCounts();
        renderKazaSection();
    });
}

// Başlat
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadFromStorage();
    initCitySelect();
    setupEventListeners();
    renderAll();
    updateLiveClockAndCountdown();
    setInterval(updateLiveClockAndCountdown, 1000);
    syncPrayerTimings(false);
});
