# 🌙 BakVakitGeldi — Namaz, Vakit, Kıble & Kaza Takip Uygulaması

Modern, mobil uyumlu (responsive), koyu/açık tema destekli ve resmi Diyanet namaz vakitleri entegrasyonuna sahip **Günlük Namaz, Kıble ve Kaza Takip** web uygulaması.

## ✨ Özellikler

- **📍 81 İlin Tamamı & Resmi Diyanet Vakitleri:** Türkiye'nin 81 ilinin tamamı alfabetik sırayla şehir menüsünde yer alır. Seçilen ilin koordinatlarına göre o günün İmsak, Güneş, Öğle, İkindi, Akşam ve Yatsı vakitlerini Diyanet hesaplama metoduyla (Aladhan API `method=13`) canlı olarak çeker.
- **🧭 İnteraktif Kıble Pusulası:** Cihazın yön/pusula sensörlerini (`DeviceOrientationEvent`) ve isteğe bağlı GPS konumunu kullanarak Kâbe-i Muazzama yönünü (Kıble açısını) canlı olarak gösterir.
- **🔔 Ezan Vakti Bildirimleri:** Tarayıcı Bildirimleri (`Notification API`) ve huzurlu sesli uyarı ile seçili ilde vakit girdiğinde (*"Sabah Vakti Girdi!"*, *"Öğle Vakti Girdi!"*) anında bildirim gönderir.
- **☁️ Şifresiz / Üyeliksiz Otomatik Bulut Yedekleme:** Kullanıcıdan e-posta veya şifre istemeden, arka planda üretilen deterministik Cihaz Kimliği (`UUID`) ile verileri `Firestore REST` ve çok katmanlı depolama (`IndexedDB` + `localStorage` + `BroadcastChannel`) üzerinden otomatik yedekler ve geri yükler.
- **✅ 5 Vakit Günlük Takip & Kaza Çetelesi:** Sabah, Öğle, İkindi, Akşam ve Yatsı namazlarını *Vaktinde (Eda)* veya *Kaza* olarak işaretleme, canlı yüzde (`%`) ilerleme çubuğu, 7 günlük takvim şeridi ve kaza borcu çetelesi.

## 🚀 Kurulum & Yayınlama (Deploy)

- **Yerel Çalıştırma:** `index.html` dosyasını tarayıcınızda açmanız yeterlidir.
- **Vercel / Netlify / GitHub Pages:** Doğrudan ana dizini (`/` veya `.`) yayın klasörü olarak seçerek saniyeler içinde canlıya alabilirsiniz.
