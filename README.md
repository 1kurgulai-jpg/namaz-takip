# 🌙 BakVakitGeldi — Namaz & Kaza Takip Uygulaması

Modern, mobil uyumlu (responsive), koyu/açık tema destekli ve resmi Diyanet namaz vakitleri entegrasyonuna sahip **Günlük Namaz ve Kaza Takip** web uygulaması.

## ✨ Özellikler

- **📍 Dinamik Şehir & Resmi Vakitler:** Seçilen şehre göre (İstanbul, Ankara, İzmir vb.) o günün İmsak, Güneş, Öğle, İkindi, Akşam ve Yatsı vakitlerini Diyanet hesaplama metoduyla (Aladhan API `method=13`) canlı olarak çeker.
- **⏱️ Canlı Saat & Geri Sayım Sayacı:** İçinde bulunulan vakit dilimini ve bir sonraki vakte kalan süreyi (`sa / dk / sn`) saniye bazında gösterir.
- **✅ 5 Vakit Günlük Takip & İlerleme Çubuğu:** Sabah, Öğle, İkindi, Akşam ve Yatsı namazlarını *Vaktinde (Eda)* veya *Kaza* olarak işaretleme, canlı yüzde (`%`) ilerleme çubuğu ve 7 günlük hızlı takvim şeridi.
- **📿 Kaza Namazı Çetelesi:** Geçmişten kalan kaza namazı borçlarını vakit bazında ekleyip düşebileceğiniz çetele tablosu.
- **📶 Çevrimdışı / Yedek Mod:** İnternet bağlantısı olmadığında önbellekteki (`localStorage`) veya şehir farkına göre hesaplanmış varsayılan vakitlerle kesintisiz çalışır.

## 🚀 Kurulum & Yayınlama (Deploy)

Bu proje saf HTML, Tailwind CSS ve Vanilla JavaScript ile geliştirildiği için herhangi bir derleme (`build`) adımına ihtiyaç duymaz.

- **Yerel Çalıştırma:** `index.html` dosyasını tarayıcınızda açmanız yeterlidir.
- **Vercel / Netlify / GitHub Pages:** Doğrudan ana dizini (`/` veya `.`) yayın klasörü olarak seçerek saniyeler içinde canlıya alabilirsiniz.
