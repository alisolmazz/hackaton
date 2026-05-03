# Pro Sicht | Fintech AI Platform 🚀

**Pro Sicht**, işletmeler ve finansal kurumlar için geliştirilmiş, yapay zeka destekli, modern ve dinamik bir **B2B Finansal Yönetim ve Analiz Platformudur.** Hackathon kapsamında geliştirilen bu proje; kullanıcıların mali verilerini yönettiği bir **Kullanıcı Paneli** ve tüm bu verilerin, onay süreçlerinin yönetildiği bir **Admin Portalı** olmak üzere iki ana modülden oluşmaktadır.

Proje, görsel olarak **"Extreme Bimodal Glassmorphism"** tasarım felsefesiyle inşa edilmiştir; pürüzsüz karanlık ve aydınlık tema geçişlerine, modern blur efektlerine ve dinamik animasyonlara sahiptir.

---

## ✨ Öne Çıkan Özellikler

### 👔 Kullanıcı Paneli (User Workspace)
*   **Finansal Raporlama:** Şirketin gelir/gider dengesini, nakit akışını ve borç/alacak takibini interaktif grafiklerle izleme.
*   **Premium ve Uzman Analiz Talepleri:** Standart paketten premium özelliklere geçiş talebi oluşturma. Yatırım ve mali durum değerlendirmeleri için "Uzman Analizi" başvurusu yapma.
*   **Dinamik UI Değişimleri:** Hesap "Temel" (Basic) durumundan "Premium" durumuna geçtiğinde arayüzdeki menülerin, renklerin ve butonların yetki bazlı olarak anında güncellenmesi.
*   **PDF ve PPTX Çıktıları:** Hazırlanan finansal raporların tek tıkla profesyonel, yapay zeka destekli sunumlara (.pptx) ve tablolara dönüştürülebilmesi.

### 🛡️ Admin Portalı (Kontrol Merkezi)
*   **Firma Yönetimi:** Platforma kayıtlı tüm şirketlerin mali durumlarını, sistem loglarını ve kullanıcı hareketlerini tek bir ekranda görüntüleme.
*   **İşlem Logları:** CRUD operasyonlarının (Ekleme, Güncelleme, Silme, Giriş/Çıkış) canlı ve detaylı log ekranında izlenmesi.
*   **Talep Yönetimi:** Kullanıcılardan gelen Premium, Uzman Analizi ve Yatırım taleplerini onaylama veya reddetme.
*   **Kapsamlı Dashboard:** Platformun genel gelir/gider dengesini gösteren grafikler ve onay bekleyen bildirimleri anlık takip imkanı.

---

## 🛠️ Kullanılan Teknolojiler

Platform en güncel ve modern web teknolojileri ile geliştirilmiştir:

*   **Core:** Next.js 16.2 (App Router), React 19, TypeScript
*   **Tasarım & UI:** Tailwind CSS v4, Shadcn/ui, Lucide React, "Extreme Glassmorphism" (Aydınlık/Karanlık mod)
*   **Veri Yönetimi & Fetch:** React Query (@tanstack/react-query), Axios
*   **Form & Validasyon:** React Hook Form, Zod
*   **Veritabanı & Auth:** Supabase (Backend as a Service)
*   **Grafik & Harita:** Recharts (Etkileşimli finansal grafikler), Leaflet / React-Leaflet
*   **Dışa Aktarım (Export):** pptxgenjs, pdfkit, xlsx

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Gereksinimler
*   Node.js (v18.17 veya üzeri önerilir)
*   NPM veya Yarn paket yöneticisi

### 2. Kurulum
Projeyi klonladıktan veya indirdikten sonra kök dizinde bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
```

### 3. Ortam Değişkenleri
Projenin ana dizininde `.env.local` adında bir dosya oluşturun ve Supabase dahil gerekli değişkenlerinizi ekleyin (Hackathon sırasında mock veriler / hooklar da desteklenmektedir):
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Geliştirme Sunucusunu Başlatma
```bash
npm run dev
# veya
yarn dev
```
Sunucu başladığında tarayıcınızdan `http://localhost:3000` adresine giderek uygulamaya erişebilirsiniz.

---

## 📂 Proje Mimarisi (Klasör Yapısı)

```text
admin-panel/
├── app/
│   ├── (admin)/         # Admin portalı sayfaları ve layout'u
│   ├── user/            # Kullanıcı paneli sayfaları ve layout'u
│   ├── globals.css      # Tailwind v4 ve genel glassmorphism stilleri
│   └── layout.tsx       # Root layout ve Global Providers (Tema, QueryProvider)
├── components/          # Tekrar kullanılabilir UI bileşenleri
│   ├── layout/          # Admin header/sidebar vb.
│   ├── user/            # User header/sidebar vb.
│   ├── shared/          # Animasyonlar, DarkMode, EmptyState
│   └── ui/              # Shadcn temel UI komponentleri
├── hooks/               # Custom React hook'ları (Örn: usePremium, useTableFilters)
├── lib/                 # Auth, API fonksiyonları, Utils ve Sabitler
├── providers/           # React Query vb. sarmalayıcı sağlayıcılar
└── public/              # Logolar ve statik dosyalar
```

---

## 🎨 Tema ve Tasarım Yaklaşımı
Projede standart Tailwind temalarından uzaklaşılarak, renk geçişlerinin (gradient), bulanıklaştırmaların (blur/backdrop-filter) ve yarı saydam katmanların ağırlıkta olduğu özel bir tasarım sistemi kurulmuştur. Sistem hem **Aydınlık (Light)** hem de **Karanlık (Dark)** modlara tam uyumlu (Bimodal) tepki vermektedir. CSS animasyonları, mikroskobik sayfa geçişleri ve pürüzsüz "hover" detaylarına büyük önem verilmiştir.

---

> *Bu proje hackathon yarışması kapsamında vizyon odaklı, üst düzey performanslı ve kullanıcı dostu bir arayüz deneyimi sunmak üzere tasarlanmıştır.*
