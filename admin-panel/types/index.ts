export type UserRole = 'admin' | 'user';
export type SozlesmeTuru = 'rapor' | 'analiz' | 'sistem' | 'diger';
export type TahsilatDurum = 'bekliyor' | 'odendi' | 'gecikti';
export type ProjeDurum = 'devam' | 'bitti';
export type PremiumPaket = 'temel_analiz' | 'uzman_gorusu' | 'premium_bundle';
export type PremiumTalepTipi = 'abonelik' | 'iptal';
export type TalepDurum = 'bekliyor' | 'onaylandi' | 'reddedildi';
export type IslemTuru = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'ocr' | 'premium';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  firmaAdi?: string;
  premium_aktif?: boolean;
  premium_paket?: PremiumPaket | null;
  created_at?: string;
}

export interface Firma {
  id: string;
  parent_id?: string;
  user_id: string;
  unvan: string;
  vergi_no: string;
  ticaret_sicil: string;
  kurulus_tarihi: string;
  faaliyet_alani: string;
  yetkili_kisi: string;
  telefon: string;
  adres: string;
  yillik_ciro: number;
  sozlesme_turu: SozlesmeTuru;
  sozlesme_baslangic: string;
  sozlesme_bitis: string;
  sozlesme_bedeli: number;
  onaylandi: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinansalRapor {
  id: string;
  firma_id: string;
  donem: string;
  toplam_gelir: number;
  toplam_gider: number;
  net_kar: number;
  toplam_varlik: number;
  toplam_borc: number;
  ozkaynak: number;
  nakit_ve_benzeri: number;
  ai_analiz: string | null;
  ai_analiz_tarihi: string | null;
  created_at: string;
  updated_at: string;
}

export interface Banka {
  id: string;
  firma_id: string;
  banka_adi: string;
  hesap_no: string;
  bakiye: number;
  kredi_limiti: number;
  kredi_kullanim: number;
}

export interface Tahsilat {
  id: string;
  firma_id: string;
  tutar: number;
  aciklama: string;
  vade_tarihi: string;
  odeme_tarihi: string | null;
  durum: TahsilatDurum;
}

export interface NakitAkis {
  id: string;
  firma_id: string;
  ay: string;
  giris: number;
  cikis: number;
  net: number;
  kumulatif: number;
}

export interface Proje {
  id: string;
  firma_id: string;
  proje_adi: string;
  durum: ProjeDurum;
  baslangic: string;
  bitis: string | null;
  tutar: number;
}

export interface PremiumTalep {
  id: string;
  firma_id: string;
  firma?: Firma;
  user_id?: string;
  user_email?: string;
  talep_eden?: string;
  firma_adi?: string;
  paket_turu: PremiumPaket;
  talep_tipi?: PremiumTalepTipi;
  durum: TalepDurum;
  red_nedeni?: string;
  created_at: string;
  updated_at?: string;
}

export interface PremiumErisim {
  id: string;
  firma_id: string;
  ozellik: 'ai_analiz' | 'uzman_gorusu' | 'on_sunum';
  aktif: boolean;
  bitis_tarihi: string | null;
}

export interface UzmanAnalizTalebi {
  id: string;
  user_email: string;
  talep_eden: string;
  firma_adi: string;
  durum: 'bekliyor' | 'tamamlandi';
  finansal_veriler: Record<string, unknown>;
  uzman_gorusu?: string;
  created_at: string;
  updated_at?: string;
}

export interface IslemLog {
  id: string;
  user_id: string;
  islem_turu: IslemTuru;
  tablo_adi: string;
  kayit_id: string;
  eski_deger: Record<string, unknown> | null;
  yeni_deger: Record<string, unknown> | null;
  ip_adresi: string;
  created_at: string;
}

export interface AICagriLog {
  id: string;
  firma_id: string;
  cagri_turu: 'ocr' | 'analiz' | 'pptx';
  prompt_uzunlugu: number;
  yanit_suresi_ms: number;
  basarili: boolean;
  hata_mesaji: string | null;
  created_at: string;
}

export interface Yatirim {
  id: string;
  firma_id: string;
  ad: string;
  tur: string;
  alis: number;
  guncel: number;
  risk: string;
  tarih: string;
  notlar?: string;
  created_at: string;
}

export interface OcrSonucu {
  unvan: string;
  vergi_no: string;
  ticaret_sicil: string;
  kurulus_tarihi: string;
  faaliyet_alani: string;
  yetkili_kisi: string;
  telefon: string;
  adres: string;
  yillik_ciro?: number;
  finansal_rapor?: {
    donem?: string;
    toplam_gelir?: number;
    toplam_gider?: number;
    net_kar?: number;
    toplam_varlik?: number;
    toplam_borc?: number;
    ozkaynak?: number;
    nakit_ve_benzeri?: number;
    bankalar?: Array<{ ad: string; bakiye: number; limit?: number; kullanim?: number; hesap?: string }>;
    bekleyen_tahsilatlar?: Array<{ aciklama: string; vade: string; tutar: number; gecikme?: number }>;
    yapilan_tahsilatlar?: Array<{ aciklama: string; tarih: string; tutar: number }>;
    projeler?: Array<{ ad: string; baslangic: string; bitis?: string | null; tutar: number; durum: string }>;
    donemsel_karsilastirma?: Array<{ d: string; gelir: number; gider: number }>;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}
