# 🏦 Pro Sicht Fintech Platformu

**BSMT Hackathon 2026 — Pro Sicht İş Birliği**

AI destekli, çok katmanlı finansal yönetim platformu. Finansal danışmanlık firmalarının müşteri verilerini merkezi olarak yönetmesini, yapay zeka ile otomatik analiz üretmesini ve .pptx sunum oluşturmasını sağlar.

---

## 📋 İçindekiler

- [Paneller](#paneller)
- [Teknoloji Stack](#teknoloji-stack)
- [Kurulum](#kurulum)
- [Demo Hesapları](#demo-hesapları)
- [Çevre Değişkenleri](#çevre-değişkenleri)
- [Proje Yapısı](#proje-yapısı)
- [AI Prompt Stratejisi](#ai-prompt-stratejisi)
- [Mimari Kararlar](#mimari-kararlar)
- [Deploy](#deploy)

---

## 🖥️ Paneller

Bu proje **tek Next.js uygulaması** içinde iki ayrı panel barındırır:

| Panel | URL | Kimler Kullanır | Tema |
|---|---|---|---|
| **Admin Paneli** | `/dashboard` | Danışmanlık firması yöneticileri | Koyu lacivert (#1a2f5e) |
| **Kullanıcı Paneli** | `/user/dashboard` | Sözleşmeli şirket yetkilileri | Koyu teal (#0f4c3a) |

### Admin Paneli Sayfaları
| Sayfa | Yol | Açıklama |
|---|---|---|
| Dashboard | `/dashboard` | Genel özet metrikleri ve grafikler |
| Firmalar | `/firmalar` | Firma listesi, ekleme, düzenleme, onaylama |
| Firma Detay | `/firmalar/[id]` | Firma bilgileri, OCR, durum yönetimi |
| Finansal Rapor | `/finansal-rapor/[firma_id]` | Mali veriler, bankalar, AI analiz, tahsilatlar |
| Finansal Durum | `/finansal-durum/[firma_id]` | Oran analizleri, nakit akış grafikleri |
| Yatırım | `/yatirim/[firma_id]` | Portföy yönetimi, risk haritası |
| Ön Sunum | `/on-sunum/[firma_id]` | .pptx sunum üretici |
| Firmalarımız | `/firmalarimiz` | Sözleşme, abonelik, iç süreç yönetimi |
| Premium Talepler | `/premium-talepler` | Premium talep onay/red yönetimi |
| Loglar | `/loglar` | İşlem, AI çağrı ve hata logları |

### Kullanıcı Paneli Sayfaları
| Sayfa | Yol | Açıklama |
|---|---|---|
| Dashboard | `/user/dashboard` | Onay durumu, metrikler, hızlı erişim |
| Firma Bilgileri | `/user/firma-bilgileri` | OCR ile kayıt, admin onay bekleme |
| Finansal Rapor | `/user/finansal-rapor` | 6 sekmeli (Mali, Banka, Tahsilat, Proje, AI🔒, Uzman🔒) |
| Nakit Akışı | `/user/nakit-akis` | AreaChart, kümülatif tablo, trend analizi |
| Borç/Alacak | `/user/borc-alacak` | PieChart, yaşlandırma analizi, vade takibi |
| Profil | `/user/profil` | Hesap, paket, bildirim, güvenlik ayarları |

---

## 🛠️ Teknoloji Stack

### Frontend
| Teknoloji | Versiyon | Kullanım |
|---|---|---|
| Next.js | 14 (App Router) | Sayfa yönetimi, SSR/CSR |
| TypeScript | 5.x | Tip güvenliği |
| Tailwind CSS | 4.x | Stil sistemi |
| shadcn/ui | latest | UI bileşen kütüphanesi |
| @tanstack/react-query | 5.x | Sunucu state yönetimi |
| Recharts | 2.x | Grafikler (Bar, Area, Pie, Line) |
| next-themes | latest | Dark mode |
| react-hook-form + zod | latest | Form validasyonu |
| sonner | latest | Toast bildirimleri |
| lucide-react | latest | İkonlar |
| axios | 1.x | HTTP istekleri |

### Backend (Ayrı Repo)
| Teknoloji | Kullanım |
|---|---|
| FastAPI (Python) | REST API |
| Anthropic Claude API | AI analiz + OCR |
| python-pptx | .pptx sunum üretimi |
| Supabase PostgreSQL | Veritabanı |

### Altyapı
| Servis | Kullanım |
|---|---|
| Vercel | Frontend hosting |
| Railway | Backend hosting |
| Supabase | DB + Auth + Storage |

---

## 🚀 Kurulum

```bash
# 1. Repo'yu klonla
git clone https://github.com/alisolmazz/fintech-admin.git
cd admin-panel

# 2. Bağımlılıkları yükle
npm install

# 3. Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını düzenle

# 4. Geliştirme sunucusunu başlat
npm run dev
```

Açılır:
- `http://localhost:3000/login` → Giriş sayfası
- `http://localhost:3000/dashboard` → Admin paneli
- `http://localhost:3000/user/dashboard` → Kullanıcı paneli

---

## 👤 Demo Hesapları

| Rol | Email | Şifre | Firma |
|---|---|---|---|
| Admin | `admin@prosicht.com` | `Admin1234!` | Pro Sicht (yönetici) |
| Kullanıcı 1 | `tech@turkiyetech.com` | `User1234!` | Türkiye Tech A.Ş. |
| Kullanıcı 2 | `gida@anadolugida.com` | `User1234!` | Anadolu Gıda Ltd. |
| Kullanıcı 3 | `ins@istinsat.com` | `User1234!` | İstanbul İnşaat A.Ş. |

> Demo hesapları `scripts/seed-data.ts` ile otomatik oluşturulabilir.

---

## ⚙️ Çevre Değişkenleri

| Değişken | Açıklama | Zorunlu |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'i | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | ✅ |
| `NEXT_PUBLIC_API_URL` | FastAPI backend URL | ✅ |

---

## 📁 Proje Yapısı

```
admin-panel/
├── app/
│   ├── (auth)/login/, register/
│   ├── (admin)/dashboard/, firmalar/, finansal-rapor/, loglar/ ...
│   └── (user)/dashboard/, firma-bilgileri/, finansal-rapor/ ...
├── components/
│   ├── layout/          → Admin Sidebar, Header
│   ├── user/            → UserSidebar, UserHeader, PremiumModal, BildirimDropdown ...
│   ├── shared/          → DarkModeToggle, LoadingSkeleton, EmptyState, ErrorBoundary ...
│   └── ui/              → shadcn/ui bileşenleri
├── hooks/
│   ├── useFirmalar.ts, useFirmam.ts, useFinansalRapor.ts
│   ├── usePremium.ts, useBildirimler.ts, useLogs.ts
│   ├── usePptx.ts, useTableFilters.ts
├── lib/
│   ├── api.ts, auth.ts, query-keys.ts
│   ├── toast.ts, validations.ts
├── context/             → PremiumModalContext
├── providers/           → QueryProvider
├── types/               → TypeScript arayüzleri
├── middleware.ts         → JWT rol bazlı yönlendirme
└── scripts/seed-data.ts → Demo veri seed script'i
```

---

## 🤖 AI Prompt Stratejisi

### 1. OCR — Firma Belgesi Okuma
- **Model:** Claude Sonnet
- **Kullanım:** PDF/görsel yükleme → firma form alanları otomatik dolar
- **Prompt:**
  ```
  Bu belgeden şirket bilgilerini çıkar ve JSON olarak döndür:
  { unvan, vergi_no, ticaret_sicil, kurulus_tarihi, faaliyet_alani,
    yetkili_kisi, telefon, adres }
  Emin olmadığın alanları boş string olarak bırak.
  ```
- **Güven Mekanizması:** Boş dönen alanlar sarı "⚠ Doğrulayın" badge'i ile işaretlenir

### 2. Finansal Analiz — LLM Rapor Üretimi
- **Model:** Claude Sonnet
- **Kullanım:** "AI Analiz Üret" butonu ile tetiklenir
- **6 Bölümlü Yapılandırılmış Prompt:**
  1. GÜÇLÜ YÖNLER
  2. ZAYIF YÖNLER
  3. RİSKLER
  4. LİKİDİTE DURUMU
  5. BORÇ/ÖZKAYNAK DENGESİ
  6. ÖNERİLER
- **Sektör bağlamı:** Firma faaliyet alanı prompt'a eklenerek sektör bazlı benchmarking yapılır

### 3. PPTX — Ön Sunum Üretimi
- **python-pptx** ile template-based oluşturma
- AI yalnızca "Özet Yorum" slaydını üretir
- Diğer slaytlar (mali tablo, bankalar, rasyolar) veritabanından direkt doldurulur

---

## 🏗️ Mimari Kararlar

| Karar | Açıklama |
|---|---|
| **Tek repo, iki panel** | Route groups `(admin)` ve `(user)` ile ayrım |
| **RBAC** | `middleware.ts` JWT decode + role kontrolü |
| **Server State** | `@tanstack/react-query` — `queryKeys` factory pattern |
| **URL Filtreleri** | `useTableFilters` hook — sayfa yenilenince filtreler korunur |
| **Forms** | `react-hook-form` + `zod` Türkçe hata mesajları |
| **Dark Mode** | CSS variables + `next-themes` her iki panelde |
| **Premium Kısıtlama** | `usePremiumErisimVar` hook + `KisitliAlan` bileşeni |
| **Bildirimler** | 30sn polling + optimistic updates |
| **Toast** | Merkezi `lib/toast.ts` — tüm panellerde tutarlı |

---

## 🚢 Deploy

### Frontend → Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```
Vercel Dashboard → Settings → Environment Variables'a `.env.example` değerlerini ekleyin.

### Backend → Railway
```bash
railway login
railway init
railway up
```
Railway Dashboard'dan ortam değişkenlerini ekleyin.

---

## 👥 Ekip

| İsim | Rol |
|---|---|
| Ali Solmaz | Next.js Admin + Kullanıcı Paneli |
| [İsim 2] | FastAPI Backend + AI Entegrasyonu |

---

## 📄 Lisans

Bu proje BSMT Hackathon 2026 kapsamında geliştirilmiştir.
