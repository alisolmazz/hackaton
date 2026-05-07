import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';
import { getCurrentUser, getToken, logout } from './auth';
import type {
  ApiResponse, PaginatedResponse,
  Firma, FinansalRapor, Banka, Tahsilat, Proje,
  PremiumTalep, PremiumErisim, PremiumPaket, TalepDurum, UzmanAnalizTalebi,
  IslemLog, AICagriLog, OcrSonucu, Yatirim
} from '@/types';
import type { FirmaFilters, TalepFilters, LogFilters } from './query-keys';

// Bildirim tipi (API'den gelecek)
export interface Bildirim {
  id: string;
  tip: 'firma_onay' | 'premium_onay' | 'premium_red' | 'vade_yaklasan' | 'vade_gecti';
  mesaj: string;
  tarih: string;
  okundu: boolean;
  link?: string;
}

// Create Axios Instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 3000,
});

// Request Interceptor: JWT Ekleme
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Hata Yönetimi
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const isExpectedMockFallback = !error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error');
    if (isExpectedMockFallback) {
      return Promise.reject(error);
    }

    const endpoint = error.config?.url || 'unknown-endpoint';
    const status = error.response?.status || (error.code === 'ECONNABORTED' ? 408 : 0);
    const tur = error.response?.statusText || error.code || error.name || 'ApiError';
    addErrorLog({
      endpoint,
      kod: status,
      tur,
      kullanici: typeof window !== 'undefined' ? getLoggedInEmail() || 'anon' : 'server',
      stack: `${error.name}: ${error.message}\n${error.stack || ''}`,
    });
    // Sessizce hata döndür — mock fallback'ler devreye girecek
    return Promise.reject(error);
  }
);

// Eski uyumluluk için export
export const api = apiClient;

// ──────────────────────────────────────────────
// MOCK VERİLER (Backend yokken demo amaçlı)
// ──────────────────────────────────────────────
const MOCK_FIRMALAR: Firma[] = [
  {
    id: '1', user_id: 'u1', unvan: 'Türkiye Tech A.Ş.', vergi_no: '1234567890',
    ticaret_sicil: 'TSM-2019-45678', kurulus_tarihi: '2019-03-15', faaliyet_alani: 'Yazılım ve Bilişim',
    yetkili_kisi: 'Mehmet Yıldırım', telefon: '+905321234567', adres: 'Maslak, Sarıyer/İstanbul',
    yillik_ciro: 12500000, sozlesme_turu: 'analiz', sozlesme_baslangic: '2024-01-01',
    sozlesme_bitis: '2025-01-01', sozlesme_bedeli: 60000, onaylandi: true,
    created_at: '2024-01-15T10:00:00Z', updated_at: '2024-04-20T14:30:00Z',
  },
  {
    id: '2', user_id: 'u2', unvan: 'Anadolu Gıda Ltd. Şti.', vergi_no: '9876543210',
    ticaret_sicil: 'TSM-2015-12345', kurulus_tarihi: '2015-07-20', faaliyet_alani: 'Gıda Üretim ve Dağıtım',
    yetkili_kisi: 'Ayşe Kara', telefon: '+905559876543', adres: 'Organize Sanayi, Konya',
    yillik_ciro: 28000000, sozlesme_turu: 'rapor', sozlesme_baslangic: '2024-03-01',
    sozlesme_bitis: '2025-03-01', sozlesme_bedeli: 45000, onaylandi: true,
    created_at: '2024-02-10T09:00:00Z', updated_at: '2024-05-01T11:00:00Z',
  },
  {
    id: '3', user_id: 'u3', unvan: 'İstanbul İnşaat A.Ş.', vergi_no: '5678901234',
    ticaret_sicil: 'TSM-2010-99887', kurulus_tarihi: '2010-11-05', faaliyet_alani: 'İnşaat ve Taahhüt',
    yetkili_kisi: 'Hasan Demir', telefon: '+905445678901', adres: 'Ataşehir, Kadıköy/İstanbul',
    yillik_ciro: 85000000, sozlesme_turu: 'sistem', sozlesme_baslangic: '2024-06-01',
    sozlesme_bitis: '2025-06-01', sozlesme_bedeli: 120000, onaylandi: false,
    created_at: '2024-04-01T08:00:00Z', updated_at: '2024-04-28T16:00:00Z',
  },
];

const MOCK_LOGS: IslemLog[] = [
  { id: 'l1', user_id: 'u0', islem_turu: 'create', tablo_adi: 'firmalar', kayit_id: '1', eski_deger: null, yeni_deger: { unvan: 'Türkiye Tech' }, ip_adresi: '192.168.1.1', created_at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'l2', user_id: 'u0', islem_turu: 'update', tablo_adi: 'firmalar', kayit_id: '2', eski_deger: { ciro: 25000000 }, yeni_deger: { ciro: 28000000 }, ip_adresi: '192.168.1.1', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'l3', user_id: 'u1', islem_turu: 'login', tablo_adi: 'auth', kayit_id: 'u1', eski_deger: null, yeni_deger: null, ip_adresi: '10.0.0.5', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'l4', user_id: 'u0', islem_turu: 'create', tablo_adi: 'premium_talepler', kayit_id: 'pt1', eski_deger: null, yeni_deger: { paket: 'premium_bundle' }, ip_adresi: '192.168.1.1', created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'l5', user_id: 'u0', islem_turu: 'update', tablo_adi: 'finansal_raporlar', kayit_id: 'fr1', eski_deger: null, yeni_deger: { ai_analiz: 'generated' }, ip_adresi: '192.168.1.1', created_at: new Date(Date.now() - 48 * 3600000).toISOString() },
];

const MOCK_TALEPLER: PremiumTalep[] = [
  { id: 'pt1', firma_id: '1', user_id: 'u1', user_email: 'ahmet@technova.com', talep_eden: 'Ahmet Yilmaz', firma_adi: 'Turkiye Tech A.S.', paket_turu: 'premium_bundle', durum: 'onaylandi', created_at: '2024-04-15T10:00:00Z', updated_at: '2024-04-15T11:00:00Z' },
  { id: 'pt2', firma_id: '2', user_id: 'u2', user_email: 'ayse@anadolugida.com', talep_eden: 'Ayse Kara', firma_adi: 'Anadolu Gida Ltd. Sti.', paket_turu: 'temel_analiz', durum: 'bekliyor', created_at: '2024-04-28T14:00:00Z' },
  { id: 'pt3', firma_id: '3', user_id: 'u3', user_email: 'hasan@istanbulinsaat.com', talep_eden: 'Hasan Demir', firma_adi: 'Istanbul Insaat A.S.', paket_turu: 'uzman_gorusu', durum: 'reddedildi', created_at: '2024-04-20T09:00:00Z', red_nedeni: 'Eksik firma evraki' },
];

const PREMIUM_TALEPLER_KEY = 'mock_premium_talepler';
const PREMIUM_ERISIMLER_KEY = 'mock_premium_erisimler';
const UZMAN_ANALIZ_TALEPLERI_KEY = 'mock_uzman_analiz_talepleri';
const AI_ANALIZ_KEY = 'mock_ai_finansal_analizler';
const OCR_FINANSAL_TASLAK_KEY = 'mock_ocr_finansal_taslaklar';
const MOCK_FIRMALAR_KEY = 'mock_firmalar';
const SYSTEM_LOGS_KEY = 'mock_system_logs';
const MOCK_YATIRIMLAR_KEY = 'mock_yatirimlar';
const MOCK_BANKALAR_KEY = 'mock_bankalar';
const MOCK_TAHSILATLAR_KEY = 'mock_tahsilatlar';
const MOCK_PROJELER_KEY = 'mock_projeler';
const MOCK_NAKIT_AKIS_KEY = 'mock_nakit_akis';
const AI_LOGS_KEY = 'mock_real_ai_logs';
const ERROR_LOGS_KEY = 'mock_real_error_logs';

export interface SystemLog {
  id: string;
  zaman: string;
  kullanici: string;
  islem_turu: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'ocr' | 'premium';
  tablo: string;
  kayit_id: string;
  eski_deger: Record<string, unknown> | null;
  yeni_deger: Record<string, unknown> | null;
}

export interface LocalErrorLog {
  id: string;
  zaman: string;
  endpoint: string;
  kod: number;
  tur: string;
  kullanici: string;
  cozuldu: boolean;
  stack: string;
}

export const addSystemLog = (log: Omit<SystemLog, 'id' | 'zaman'>): void => {
  if (typeof window === 'undefined') return;
  const logs = readLocalJson<SystemLog[]>(SYSTEM_LOGS_KEY, []);
  logs.unshift({
    id: `LOG-${Date.now()}`,
    zaman: new Date().toISOString(),
    ...log,
  });
  // En fazla 200 log tut
  writeLocalJson(SYSTEM_LOGS_KEY, logs.slice(0, 200));
};

export const getSystemLogs = (): SystemLog[] => {
  return readLocalJson<SystemLog[]>(SYSTEM_LOGS_KEY, []);
};

export const addAICagriLog = (log: Omit<AICagriLog, 'id' | 'created_at'>): void => {
  if (typeof window === 'undefined') return;
  const logs = readLocalJson<AICagriLog[]>(AI_LOGS_KEY, []);
  logs.unshift({
    id: `AI-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    created_at: new Date().toISOString(),
    ...log,
  });
  writeLocalJson(AI_LOGS_KEY, logs.slice(0, 300));
};

export const getLocalAICagriLoglari = (): AICagriLog[] => {
  return readLocalJson<AICagriLog[]>(AI_LOGS_KEY, []);
};

export const addErrorLog = (log: Omit<LocalErrorLog, 'id' | 'zaman' | 'cozuldu'>): void => {
  if (typeof window === 'undefined') return;
  const logs = readLocalJson<LocalErrorLog[]>(ERROR_LOGS_KEY, []);
  logs.unshift({
    id: `ERR-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    zaman: new Date().toISOString(),
    cozuldu: false,
    ...log,
  });
  writeLocalJson(ERROR_LOGS_KEY, logs.slice(0, 300));
};

export const getLocalErrorLogs = (): LocalErrorLog[] => {
  const logs = readLocalJson<LocalErrorLog[]>(ERROR_LOGS_KEY, []);
  return logs.filter(log => !(log.kod === 0 && (log.tur === 'ERR_NETWORK' || log.stack.includes('Network Error'))));
};

export const getLocalYatirimlar = (): Yatirim[] => {
  return readLocalJson<Yatirim[]>(MOCK_YATIRIMLAR_KEY, []);
};

export const writeLocalYatirimlar = (yatirimlar: Yatirim[]) => {
  writeLocalJson(MOCK_YATIRIMLAR_KEY, yatirimlar);
};

export const getLocalBankalar = (): Banka[] => readLocalJson<Banka[]>(MOCK_BANKALAR_KEY, []);
export const writeLocalBankalar = (data: Banka[]) => writeLocalJson(MOCK_BANKALAR_KEY, data);

export const getLocalTahsilatlar = (): Tahsilat[] => readLocalJson<Tahsilat[]>(MOCK_TAHSILATLAR_KEY, []);
export const writeLocalTahsilatlar = (data: Tahsilat[]) => writeLocalJson(MOCK_TAHSILATLAR_KEY, data);

export const getLocalProjeler = (): Proje[] => readLocalJson<Proje[]>(MOCK_PROJELER_KEY, []);
export const writeLocalProjeler = (data: Proje[]) => writeLocalJson(MOCK_PROJELER_KEY, data);

export const getLocalNakitAkis = (): any[] => readLocalJson<any[]>(MOCK_NAKIT_AKIS_KEY, []);
export const writeLocalNakitAkis = (data: any[]) => writeLocalJson(MOCK_NAKIT_AKIS_KEY, data);

const getLocalFirmalar = (): Firma[] => {
  const stored = readLocalJson<Firma[] | null>(MOCK_FIRMALAR_KEY, null);
  if (stored) return stored;
  writeLocalJson(MOCK_FIRMALAR_KEY, MOCK_FIRMALAR);
  return MOCK_FIRMALAR;
};

export const saveLocalFirma = (payload: Partial<Firma>): Firma => {
  const firmalar = getLocalFirmalar();
  const email = getLoggedInEmail() || 'anon';
  const existing = firmalar.find(f => f.user_id === email);
  const now = new Date().toISOString();

  if (existing) {
    const updated = { ...existing, ...payload, updated_at: now, onaylandi: true };
    const next = firmalar.map(f => f.id === existing.id ? updated : f);
    writeLocalJson(MOCK_FIRMALAR_KEY, next);
    addSystemLog({ kullanici: email, islem_turu: 'update', tablo: 'firmalar', kayit_id: existing.id, eski_deger: { unvan: existing.unvan }, yeni_deger: { unvan: updated.unvan } });
    return updated;
  }

  const newFirma: Firma = {
    id: `firma-${Date.now()}`,
    user_id: email,
    unvan: payload.unvan || '',
    vergi_no: payload.vergi_no || '',
    ticaret_sicil: payload.ticaret_sicil || '',
    kurulus_tarihi: payload.kurulus_tarihi || '',
    faaliyet_alani: payload.faaliyet_alani || '',
    yetkili_kisi: payload.yetkili_kisi || '',
    telefon: payload.telefon || '',
    adres: payload.adres || '',
    yillik_ciro: payload.yillik_ciro || 0,
    sozlesme_turu: payload.sozlesme_turu || 'rapor',
    sozlesme_baslangic: payload.sozlesme_baslangic || now.split('T')[0],
    sozlesme_bitis: payload.sozlesme_bitis || '',
    sozlesme_bedeli: payload.sozlesme_bedeli || 0,
    onaylandi: true,
    created_at: now,
    updated_at: now,
  };
  writeLocalJson(MOCK_FIRMALAR_KEY, [newFirma, ...firmalar]);
  addSystemLog({ kullanici: email, islem_turu: 'create', tablo: 'firmalar', kayit_id: newFirma.id, eski_deger: null, yeni_deger: { unvan: newFirma.unvan, vergi_no: newFirma.vergi_no } });
  return newFirma;
};

export const getLocalFirmam = (): Firma | null => {
  const email = getLoggedInEmail() || 'anon';
  return getLocalFirmalar().find(f => f.user_id === email) || null;
};

export const PREMIUM_PAKET_ADLARI: Record<PremiumPaket, string> = {
  temel_analiz: 'Temel Analiz',
  uzman_gorusu: 'Uzman Gorusu',
  premium_bundle: 'Premium Bundle',
};

type PremiumHesapDurumu = {
  hasPremium: boolean;
  talepDurum: 'yok' | TalepDurum;
  talep: PremiumTalep | null;
  paket: PremiumPaket | null;
  iptalTalebiBekliyor: boolean;
};

// Güvenlik: Hassas finansal verilerin istemci tarafında "At-Rest" şifrelenmesi
const ENCRYPTION_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'prosicht-hackathon-secure-key-2024';

const readLocalJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    
    // Şifreyi çöz (Decrypt)
    const bytes = CryptoJS.AES.decrypt(raw, ENCRYPTION_SECRET);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    
    // Eğer şifre çözülemezse (veya eski şifresiz veriyse), düz parse etmeyi dene
    if (!decryptedData) {
      return JSON.parse(raw) as T;
    }
    
    return JSON.parse(decryptedData) as T;
  } catch {
    // Fallback if data is completely corrupted or format changes
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) as T : fallback;
    } catch {
      return fallback;
    }
  }
};

const writeLocalJson = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  // Veriyi şifrele (At-Rest Encryption)
  const jsonString = JSON.stringify(value);
  const encryptedData = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_SECRET).toString();
  
  localStorage.setItem(key, encryptedData);
  window.dispatchEvent(new Event('premium-data-changed'));
};

const getMockUsers = (): any[] => readLocalJson<any[]>('mock_users', []);

const getLoggedInEmail = () => {
  if (typeof window === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split('; sb-email=');
  return parts.length === 2 ? decodeURIComponent(parts.pop()?.split(';').shift() || '') : '';
};

const getCurrentMockUser = () => {
  const email = getLoggedInEmail();
  return getMockUsers().find(user => user.email === email) || null;
};

const getLocalPremiumTalepler = (): PremiumTalep[] => {
  const current = readLocalJson<PremiumTalep[] | null>(PREMIUM_TALEPLER_KEY, null);
  if (current) return current;
  writeLocalJson(PREMIUM_TALEPLER_KEY, MOCK_TALEPLER);
  return MOCK_TALEPLER;
};

const getTalepUserKey = (talep: PremiumTalep) => talep.user_email || talep.user_id || talep.firma_id;

const getUserKey = (user: any) => user?.email || `mock-id-${user?.email || 'anon'}`;

const buildFirmaIdForUser = (user: any) => user?.firmaId || user?.firma_id || `firma-${user?.email || 'anon'}`;

const getPaketOzellikleri = (paket: PremiumPaket): PremiumErisim['ozellik'][] => {
  if (paket === 'temel_analiz') return ['ai_analiz'];
  if (paket === 'uzman_gorusu') return ['uzman_gorusu'];
  return ['ai_analiz', 'uzman_gorusu', 'on_sunum'];
};

const setLocalUserPremium = (talep: PremiumTalep, aktif: boolean) => {
  const users = getMockUsers();
  const userKey = getTalepUserKey(talep);
  const nextUsers = users.map(user => {
    const matches = user.email === userKey || `mock-id-${user.email}` === userKey;
    return matches
      ? { ...user, premium_aktif: aktif, premium_paket: aktif ? talep.paket_turu : null }
      : user;
  });
  writeLocalJson('mock_users', nextUsers);
};

const setLocalPremiumErisimler = (talep: PremiumTalep, aktif: boolean) => {
  const erisimler = readLocalJson<PremiumErisim[]>(PREMIUM_ERISIMLER_KEY, []);
  const withoutUserPackage = erisimler.filter(item => item.firma_id !== talep.firma_id);
  const next = aktif
    ? [
        ...withoutUserPackage,
        ...getPaketOzellikleri(talep.paket_turu).map((ozellik, index) => ({
          id: `${talep.id}-${ozellik}-${index}`,
          firma_id: talep.firma_id,
          ozellik,
          aktif: true,
          bitis_tarihi: null,
        })),
      ]
    : withoutUserPackage;
  writeLocalJson(PREMIUM_ERISIMLER_KEY, next);
};

const createLocalPremiumTalep = async (paketTuru: PremiumPaket): Promise<PremiumTalep> => {
  const authUser = await getCurrentUser();
  const mockUser = getCurrentMockUser();
  if (!authUser && !mockUser) {
    throw new Error('Premium talebi icin once giris yapmalisiniz.');
  }

  const user = mockUser || authUser;
  const userKey = getUserKey(user);
  const talepler = getLocalPremiumTalepler();
  const existingPending = talepler.find(talep => getTalepUserKey(talep) === userKey && talep.durum === 'bekliyor' && (talep.talep_tipi || 'abonelik') === 'abonelik');
  const now = new Date().toISOString();

  if (existingPending) {
    const updated = { ...existingPending, paket_turu: paketTuru, updated_at: now };
    const next = talepler.map(talep => talep.id === existingPending.id ? updated : talep);
    writeLocalJson(PREMIUM_TALEPLER_KEY, next);
    return updated;
  }

  const talep: PremiumTalep = {
    id: `pt-${Date.now()}`,
    firma_id: buildFirmaIdForUser(user),
    user_id: authUser?.id || `mock-id-${user.email}`,
    user_email: user.email,
    talep_eden: user.name || user.adSoyad || user.email,
    firma_adi: user.firmaAdi || 'Firma bilgisi yok',
    paket_turu: paketTuru,
    talep_tipi: 'abonelik',
    durum: 'bekliyor',
    created_at: now,
  };
  writeLocalJson(PREMIUM_TALEPLER_KEY, [talep, ...talepler]);
  return talep;
};

const createLocalPremiumIptalTalebi = async (): Promise<PremiumTalep> => {
  const authUser = await getCurrentUser();
  const mockUser = getCurrentMockUser();
  if (!authUser && !mockUser) {
    throw new Error('Premium iptal talebi icin once giris yapmalisiniz.');
  }

  const user = mockUser || authUser;
  const userKey = getUserKey(user);
  const talepler = getLocalPremiumTalepler();
  const kullaniciTalepleri = talepler
    .filter(talep => getTalepUserKey(talep) === userKey || talep.user_id === authUser?.id)
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
  const mevcutBekleyenIptal = kullaniciTalepleri.find(talep => talep.talep_tipi === 'iptal' && talep.durum === 'bekliyor');
  const aktifTalep = kullaniciTalepleri.find(talep => (talep.talep_tipi || 'abonelik') === 'abonelik' && talep.durum === 'onaylandi');

  if (mevcutBekleyenIptal) return mevcutBekleyenIptal;
  if (!Boolean(user.premium_aktif) && !aktifTalep) {
    throw new Error('Iptal edilebilecek aktif premium uyeliginiz bulunmuyor.');
  }

  const now = new Date().toISOString();
  const talep: PremiumTalep = {
    id: `pt-cancel-${Date.now()}`,
    firma_id: aktifTalep?.firma_id || buildFirmaIdForUser(user),
    user_id: authUser?.id || `mock-id-${user.email}`,
    user_email: user.email,
    talep_eden: user.name || user.adSoyad || user.email,
    firma_adi: user.firmaAdi || aktifTalep?.firma_adi || 'Firma bilgisi yok',
    paket_turu: (user.premium_paket || aktifTalep?.paket_turu || 'premium_bundle') as PremiumPaket,
    talep_tipi: 'iptal',
    durum: 'bekliyor',
    created_at: now,
  };

  writeLocalJson(PREMIUM_TALEPLER_KEY, [talep, ...talepler]);
  return talep;
};

const updateLocalPremiumTalep = (talepId: string, durum: TalepDurum, redNedeni?: string) => {
  const talepler = getLocalPremiumTalepler();
  let updatedTalep: PremiumTalep | null = null;
  const next = talepler.map(talep => {
    if (talep.id !== talepId) return talep;
    updatedTalep = {
      ...talep,
      durum,
      red_nedeni: redNedeni,
      updated_at: new Date().toISOString(),
    };
    return updatedTalep;
  });

  if (!updatedTalep) throw new Error('Premium talebi bulunamadi.');
  writeLocalJson(PREMIUM_TALEPLER_KEY, next);
  const savedTalep = updatedTalep as PremiumTalep;
  const isIptalTalebi = savedTalep.talep_tipi === 'iptal';
  if (durum === 'onaylandi') {
    setLocalUserPremium(savedTalep, !isIptalTalebi);
    setLocalPremiumErisimler(savedTalep, !isIptalTalebi);
  } else if (durum === 'reddedildi' && !isIptalTalebi) {
    setLocalUserPremium(savedTalep, false);
    setLocalPremiumErisimler(savedTalep, false);
  }
  return savedTalep;
};

export const getPremiumHesapDurumu = async (): Promise<PremiumHesapDurumu> => {
  const authUser = await getCurrentUser();
  const mockUser = getCurrentMockUser();
  const user = mockUser || authUser;
  if (!user) return { hasPremium: false, talepDurum: 'yok', talep: null, paket: null, iptalTalebiBekliyor: false };

  const userKey = getUserKey(user);
  const talepler = getLocalPremiumTalepler()
    .filter(talep => getTalepUserKey(talep) === userKey || talep.user_id === authUser?.id)
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
  const latest = talepler[0] || null;
  const latestAbonelik = talepler.find(talep => (talep.talep_tipi || 'abonelik') === 'abonelik');
  const onayliAbonelik = talepler.find(talep => (talep.talep_tipi || 'abonelik') === 'abonelik' && talep.durum === 'onaylandi');
  const onayliIptal = talepler.find(talep => talep.talep_tipi === 'iptal' && talep.durum === 'onaylandi');
  const iptalTalebiBekliyor = talepler.some(talep => talep.talep_tipi === 'iptal' && talep.durum === 'bekliyor');
  const abonelikTarihi = onayliAbonelik ? new Date(onayliAbonelik.updated_at || onayliAbonelik.created_at).getTime() : 0;
  const iptalTarihi = onayliIptal ? new Date(onayliIptal.updated_at || onayliIptal.created_at).getTime() : 0;
  const hasPremium = (Boolean(user.premium_aktif) || Boolean(onayliAbonelik)) && iptalTarihi <= abonelikTarihi;

  return {
    hasPremium,
    talepDurum: hasPremium ? 'onaylandi' : latestAbonelik?.durum || latest?.durum || 'yok',
    talep: iptalTalebiBekliyor ? talepler.find(talep => talep.talep_tipi === 'iptal' && talep.durum === 'bekliyor') || latest : latestAbonelik || latest,
    paket: (user.premium_paket || latestAbonelik?.paket_turu || latest?.paket_turu || null) as PremiumPaket | null,
    iptalTalebiBekliyor,
  };
};

// ──────────────────────────────────────────────
// HELPER: API çağrısı yap, başarısızsa mock data dön
// ──────────────────────────────────────────────
async function tryOrMock<T>(apiFn: () => Promise<T>, mockData: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return mockData;
  }
}

async function postGeminiFirmaOcr(file: File): Promise<ApiResponse<OcrSonucu>> {
  const startedAt = performance.now();
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/gemini/firma-ocr', {
      method: 'POST',
      body: formData,
    });
    const payload = await response.json();

    addAICagriLog({
      firma_id: 'ocr-document',
      cagri_turu: 'ocr',
      prompt_uzunlugu: file.size,
      yanit_suresi_ms: Math.round(performance.now() - startedAt),
      basarili: response.ok,
      hata_mesaji: response.ok ? null : payload?.message || 'Gemini belge analizi basarisiz oldu.',
    });

    if (!response.ok) {
      addErrorLog({
        endpoint: '/api/gemini/firma-ocr',
        kod: response.status,
        tur: response.statusText || 'GeminiOcrError',
        kullanici: getLoggedInEmail() || 'anon',
        stack: payload?.message || 'Gemini belge analizi basarisiz oldu.',
      });
      throw new Error(payload?.message || 'Gemini belge analizi basarisiz oldu.');
    }

    return payload as ApiResponse<OcrSonucu>;
  } catch (error) {
    if (!(error instanceof Error && error.message.includes('Gemini belge analizi'))) {
      addAICagriLog({
        firma_id: 'ocr-document',
        cagri_turu: 'ocr',
        prompt_uzunlugu: file.size,
        yanit_suresi_ms: Math.round(performance.now() - startedAt),
        basarili: false,
        hata_mesaji: error instanceof Error ? error.message : 'Bilinmeyen OCR hatasi',
      });
      addErrorLog({
        endpoint: '/api/gemini/firma-ocr',
        kod: 0,
        tur: 'FetchError',
        kullanici: getLoggedInEmail() || 'anon',
        stack: error instanceof Error ? `${error.name}: ${error.message}\n${error.stack || ''}` : String(error),
      });
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// FİRMALAR (Admin)
// ──────────────────────────────────────────────
export const getFirmalar = async (filters?: FirmaFilters): Promise<PaginatedResponse<Firma>> => {
  const all = getLocalFirmalar().filter(f => !f.parent_id);
  return tryOrMock(
    async () => { const { data } = await apiClient.get<PaginatedResponse<Firma>>('/firma/list', { params: filters }); return data; },
    { data: all, total: all.length, page: 1, per_page: 10 }
  );
};

export const getAltFirmalar = async (parentId: string): Promise<PaginatedResponse<Firma>> => {
  const all = getLocalFirmalar().filter(f => f.parent_id === parentId);
  return tryOrMock(
    async () => { const { data } = await apiClient.get<PaginatedResponse<Firma>>(`/firma/${parentId}/alt-firmalar`); return data; },
    { data: all, total: all.length, page: 1, per_page: 10 }
  );
};

export const getFirma = async (id: string): Promise<ApiResponse<Firma>> => {
  const all = getLocalFirmalar();
  return tryOrMock(
    async () => { const { data } = await apiClient.get<ApiResponse<Firma>>(`/firma/${id}`); return data; },
    { data: all.find(f => f.id === id) || all[0] }
  );
};

export const createFirma = async (payload: Partial<Firma>): Promise<ApiResponse<Firma>> => {
  const created = saveLocalFirma(payload);
  return tryOrMock(
    async () => { const { data } = await apiClient.post<ApiResponse<Firma>>('/firma/create', payload); return data; },
    { data: created }
  );
};

export const updateFirma = async (id: string, payload: Partial<Firma>): Promise<ApiResponse<Firma>> => {
  addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'update', tablo: 'firmalar', kayit_id: id, eski_deger: null, yeni_deger: payload as Record<string, unknown> });
  return tryOrMock(
    async () => { const { data } = await apiClient.put<ApiResponse<Firma>>(`/firma/${id}`, payload); return data; },
    { data: { ...MOCK_FIRMALAR[0], ...payload, id } as Firma }
  );
};

export const deleteFirma = async (id: string): Promise<ApiResponse<void>> => {
  const deleted = getLocalFirmalar().find(f => f.id === id);
  const all = getLocalFirmalar().filter(f => f.id !== id);
  writeLocalJson(MOCK_FIRMALAR_KEY, all);
  addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'delete', tablo: 'firmalar', kayit_id: id, eski_deger: deleted ? { unvan: deleted.unvan } : null, yeni_deger: null });
  return tryOrMock(
    async () => { const { data } = await apiClient.delete<ApiResponse<void>>(`/firma/${id}`); return data; },
    { data: undefined as unknown as void }
  );
};

export const ocrFirma = async (firmaId: string | undefined, file: File): Promise<ApiResponse<OcrSonucu>> => {
  return postGeminiFirmaOcr(file);
};

// ──────────────────────────────────────────────
// YATIRIMLAR
// ──────────────────────────────────────────────

export const getYatirimlar = async (firmaId: string): Promise<PaginatedResponse<Yatirim>> => {
  const all = getLocalYatirimlar().filter(y => y.firma_id === firmaId);
  return tryOrMock(
    async () => { const { data } = await apiClient.get<PaginatedResponse<Yatirim>>(`/firma/${firmaId}/yatirimlar`); return data; },
    { data: all, total: all.length, page: 1, per_page: 100 }
  );
};

export const createYatirim = async (firmaId: string, payload: Partial<Yatirim>): Promise<ApiResponse<Yatirim>> => {
  const newYatirim: Yatirim = {
    ...payload,
    id: `yatirim-${Date.now()}`,
    firma_id: firmaId,
    created_at: new Date().toISOString()
  } as Yatirim;
  
  const yatirimlar = getLocalYatirimlar();
  writeLocalYatirimlar([newYatirim, ...yatirimlar]);
  addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'create', tablo: 'yatirimlar', kayit_id: newYatirim.id, eski_deger: null, yeni_deger: newYatirim as any });
  
  return tryOrMock(
    async () => { const { data } = await apiClient.post<ApiResponse<Yatirim>>(`/firma/${firmaId}/yatirimlar`, payload); return data; },
    { data: newYatirim, message: 'Yatırım eklendi' }
  );
};

export const deleteYatirim = async (id: string): Promise<ApiResponse<null>> => {
  const yatirimlar = getLocalYatirimlar();
  const index = yatirimlar.findIndex(y => y.id === id);
  if (index !== -1) {
    const deleted = yatirimlar[index];
    yatirimlar.splice(index, 1);
    writeLocalYatirimlar(yatirimlar);
    addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'delete', tablo: 'yatirimlar', kayit_id: id, eski_deger: deleted as any, yeni_deger: null });
  }

  return tryOrMock(
    async () => { const { data } = await apiClient.delete<ApiResponse<null>>(`/yatirimlar/${id}`); return data; },
    { data: null, message: 'Yatırım silindi' }
  );
};

// ──────────────────────────────────────────────
// FİRMAM (User — kendi firması)
// ──────────────────────────────────────────────
export const getFirmam = async (): Promise<ApiResponse<Firma>> => {
  const mine = getLocalFirmam();
  return tryOrMock(
    async () => { const { data } = await apiClient.get<ApiResponse<Firma>>('/firma/me'); return data; },
    { data: mine || getLocalFirmalar()[0] }
  );
};

export const updateFirmam = async (payload: Partial<Firma>): Promise<ApiResponse<Firma>> => {
  const updated = saveLocalFirma(payload);
  return tryOrMock(
    async () => { const { data } = await apiClient.put<ApiResponse<Firma>>('/firma/me', payload); return data; },
    { data: updated }
  );
};

export const ocrFirmam = async (file: File): Promise<ApiResponse<OcrSonucu>> => {
  return postGeminiFirmaOcr(file);
};

export type OcrFinansalTaslak = NonNullable<OcrSonucu['finansal_rapor']> & {
  firma_adi?: string;
  kaynak?: 'ocr';
  updated_at?: string;
};

const hasMeaningfulFinancialData = (data: OcrFinansalTaslak) => {
  const numericFields: Array<keyof OcrFinansalTaslak> = [
    'toplam_gelir',
    'toplam_gider',
    'net_kar',
    'toplam_varlik',
    'toplam_borc',
    'ozkaynak',
    'nakit_ve_benzeri',
  ];

  return numericFields.some(field => Number(data[field] || 0) > 0)
    || Boolean(data.bankalar?.length)
    || Boolean(data.bekleyen_tahsilatlar?.length)
    || Boolean(data.yapilan_tahsilatlar?.length)
    || Boolean(data.projeler?.length)
    || Boolean(data.donemsel_karsilastirma?.length);
};

export const saveOcrFinansalTaslak = (ocrData: OcrSonucu): OcrFinansalTaslak | null => {
  const email = getLoggedInEmail() || 'anon';
  const finansal = ocrData.finansal_rapor || {};
  const toplamGelir = Number(finansal.toplam_gelir || 0) || Number(ocrData.yillik_ciro || 0);
  const taslak: OcrFinansalTaslak = {
    ...finansal,
    toplam_gelir: toplamGelir,
    net_kar: Number(finansal.net_kar || 0) || Math.max(toplamGelir - Number(finansal.toplam_gider || 0), 0),
    firma_adi: ocrData.unvan || undefined,
    kaynak: 'ocr',
    updated_at: new Date().toISOString(),
  };

  if (!hasMeaningfulFinancialData(taslak)) return null;

  const cache = readLocalJson<Record<string, OcrFinansalTaslak>>(OCR_FINANSAL_TASLAK_KEY, {});
  writeLocalJson(OCR_FINANSAL_TASLAK_KEY, { ...cache, [email]: taslak });
  addSystemLog({ kullanici: email, islem_turu: 'ocr', tablo: 'finansal_raporlar', kayit_id: email, eski_deger: null, yeni_deger: { firma: taslak.firma_adi, gelir: taslak.toplam_gelir, gider: taslak.toplam_gider } });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ocr-finansal-data-changed'));
  }
  return taslak;
};

export const getOcrFinansalTaslak = async (): Promise<OcrFinansalTaslak | null> => {
  const email = getLoggedInEmail() || 'anon';
  const cache = readLocalJson<Record<string, OcrFinansalTaslak>>(OCR_FINANSAL_TASLAK_KEY, {});
  return cache[email] || null;
};

// ──────────────────────────────────────────────
// FİNANSAL RAPORLAR
// ──────────────────────────────────────────────
export const getFinansalRapor = async (firmaId: string, donem?: string): Promise<ApiResponse<FinansalRapor>> => {
  return tryOrMock(
    async () => { const { data } = await apiClient.get<ApiResponse<FinansalRapor>>(`/finansal/${firmaId}`, { params: { donem } }); return data; },
    { data: { id: 'fr1', firma_id: firmaId, donem: donem || '2024-Yıllık', toplam_gelir: 3530000, toplam_gider: 2390000, net_kar: 1140000, toplam_varlik: 8450000, toplam_borc: 3200000, ozkaynak: 5250000, nakit_ve_benzeri: 2460000, ai_analiz: null, ai_analiz_tarihi: null, created_at: '2024-04-01T10:00:00Z', updated_at: '2024-04-28T14:30:00Z' } }
  );
};

export const saveFinansalRapor = async (firmaId: string, payload: Partial<FinansalRapor>): Promise<ApiResponse<FinansalRapor>> => {
  return tryOrMock(
    async () => { const { data } = await apiClient.post<ApiResponse<FinansalRapor>>(`/finansal/${firmaId}`, payload); return data; },
    { data: { ...payload, id: 'fr1', firma_id: firmaId } as FinansalRapor }
  );
};



export const getFinansalDurum = async (firmaId: string): Promise<ApiResponse<FinansalRapor>> => {
  return tryOrMock(
    async () => { const { data } = await apiClient.get<ApiResponse<FinansalRapor>>(`/finansal/${firmaId}/durum`); return data; },
    { data: { id: 'fr1', firma_id: firmaId, donem: '2024-Yıllık', toplam_gelir: 3530000, toplam_gider: 2390000, net_kar: 1140000, toplam_varlik: 8450000, toplam_borc: 3200000, ozkaynak: 5250000, nakit_ve_benzeri: 2460000, ai_analiz: null, ai_analiz_tarihi: null, created_at: '2024-04-01T10:00:00Z', updated_at: '2024-04-28T14:30:00Z' } }
  );
};

// ──────────────────────────────────────────────
// YAPAY ZEKA (AI)
// ──────────────────────────────────────────────
export const generateAIAnaliz = async (firmaId: string): Promise<ApiResponse<{ analiz: string }>> => {
  return tryOrMock(
    async () => { const { data } = await apiClient.post<ApiResponse<{ analiz: string }>>(`/finansal/${firmaId}/ai-analiz`); return data; },
    { data: { analiz: '## Güçlü Yönler\n- Yüksek kârlılık oranı (%32)\n- Sağlıklı özkaynak yapısı\n\n## Zayıf Yönler\n- Borç/özkaynak oranı sektör ortalamasının üstünde\n\n## Riskler\n- Kur riski yüksek\n\n## Likidite Durumu\n- Cari oran: 1.85 (sektör ort: 1.50)\n\n## Borç/Özkaynak Dengesi\n- %61 özkaynak ağırlıklı\n\n## Öneriler\n- Kısa vadeli borç yapılandırması önerilir\n- Döviz pozisyonu dengelenmeli' } }
  );
};

export const generatePptx = async (firmaId: string, ayarlar?: Record<string, unknown>): Promise<Blob> => {
  try {
    const response = await apiClient.post(`/pptx/${firmaId}/uret`, ayarlar ?? {}, { responseType: 'blob' });
    return response.data;
  } catch {
    return new Blob(['Demo PPTX content'], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  }
};

export const downloadPptx = async (firmaId: string): Promise<Blob> => {
  try {
    const response = await apiClient.get(`/pptx/${firmaId}/indir`, { responseType: 'blob' });
    return response.data;
  } catch {
    return new Blob(['Demo PPTX content'], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  }
};

// ──────────────────────────────────────────────
// PREMIUM TALEPLER
// ──────────────────────────────────────────────
export const getPremiumTalepler = async (filters?: TalepFilters): Promise<PaginatedResponse<PremiumTalep>> => {
  return tryOrMock(
    async () => { const { data } = await apiClient.get<PaginatedResponse<PremiumTalep>>('/premium/talepler', { params: filters }); return data; },
    { data: getLocalPremiumTalepler(), total: getLocalPremiumTalepler().length, page: 1, per_page: 10 }
  );
};

export const onaylaTalep = async (talepId: string): Promise<ApiResponse<void>> => {
  try {
    const { data } = await apiClient.put<ApiResponse<void>>(`/premium/${talepId}/onayla`);
    updateLocalPremiumTalep(talepId, 'onaylandi');
    addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'update', tablo: 'premium_talepler', kayit_id: talepId, eski_deger: { durum: 'bekliyor' }, yeni_deger: { durum: 'onaylandi' } });
    return data;
  } catch {
    updateLocalPremiumTalep(talepId, 'onaylandi');
    addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'update', tablo: 'premium_talepler', kayit_id: talepId, eski_deger: { durum: 'bekliyor' }, yeni_deger: { durum: 'onaylandi' } });
    return { data: undefined as unknown as void, message: 'Talep onaylandi' };
  }
};

export const reddettTalep = async (talepId: string, neden?: string): Promise<ApiResponse<void>> => {
  try {
    const { data } = await apiClient.put<ApiResponse<void>>(`/premium/${talepId}/reddet`, { neden });
    updateLocalPremiumTalep(talepId, 'reddedildi', neden);
    addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'update', tablo: 'premium_talepler', kayit_id: talepId, eski_deger: { durum: 'bekliyor' }, yeni_deger: { durum: 'reddedildi', neden } });
    return data;
  } catch {
    updateLocalPremiumTalep(talepId, 'reddedildi', neden);
    addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'update', tablo: 'premium_talepler', kayit_id: talepId, eski_deger: { durum: 'bekliyor' }, yeni_deger: { durum: 'reddedildi', neden } });
    return { data: undefined as unknown as void, message: 'Talep reddedildi' };
  }
};

export const getPremiumErisimlerim = async (): Promise<PremiumErisim[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<PremiumErisim[]>>('/premium/erisimlerim');
    return data.data;
  } catch {
    const durum = await getPremiumHesapDurumu();
    if (!durum.hasPremium || !durum.talep) return [];
    return readLocalJson<PremiumErisim[]>(PREMIUM_ERISIMLER_KEY, []).filter(item => item.firma_id === durum.talep?.firma_id);
  }
};

export const premiumSatinAl = async (paketTuru: PremiumPaket): Promise<ApiResponse<void>> => {
  const email = getLoggedInEmail() || 'anon';
  try {
    const { data } = await apiClient.post<ApiResponse<void>>('/premium/satin-al', { paket_turu: paketTuru });
    await createLocalPremiumTalep(paketTuru);
    addSystemLog({ kullanici: email, islem_turu: 'premium', tablo: 'premium_talepler', kayit_id: paketTuru, eski_deger: null, yeni_deger: { paket: paketTuru, islem: 'satin_alma_talebi' } });
    return data;
  } catch {
    await createLocalPremiumTalep(paketTuru);
    addSystemLog({ kullanici: email, islem_turu: 'premium', tablo: 'premium_talepler', kayit_id: paketTuru, eski_deger: null, yeni_deger: { paket: paketTuru, islem: 'satin_alma_talebi' } });
    return { data: undefined as unknown as void, message: 'Talep gonderildi' };
  }
};

export const premiumIptalTalepEt = async (): Promise<ApiResponse<void>> => {
  const email = getLoggedInEmail() || 'anon';
  try {
    const { data } = await apiClient.post<ApiResponse<void>>('/premium/iptal-talebi');
    await createLocalPremiumIptalTalebi();
    addSystemLog({ kullanici: email, islem_turu: 'premium', tablo: 'premium_talepler', kayit_id: email, eski_deger: null, yeni_deger: { islem: 'iptal_talebi' } });
    return data;
  } catch {
    await createLocalPremiumIptalTalebi();
    addSystemLog({ kullanici: email, islem_turu: 'premium', tablo: 'premium_talepler', kayit_id: email, eski_deger: null, yeni_deger: { islem: 'iptal_talebi' } });
    return { data: undefined as unknown as void, message: 'Iptal talebi gonderildi' };
  }
};

export const generateUserFinansalAIAnaliz = async (finansalVeriler: Record<string, unknown>): Promise<ApiResponse<{ analiz: string }>> => {
  const startedAt = performance.now();
  const requestBody = JSON.stringify({ finansalVeriler });
  const email = getLoggedInEmail() || 'anon';

  try {
    const response = await fetch('/api/gemini/finansal-analiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    });
    const payload = await response.json();

    addAICagriLog({
      firma_id: String(finansalVeriler.firma_id || finansalVeriler.firmaAdi || email),
      cagri_turu: 'analiz',
      prompt_uzunlugu: requestBody.length,
      yanit_suresi_ms: Math.round(performance.now() - startedAt),
      basarili: response.ok,
      hata_mesaji: response.ok ? null : payload?.message || 'AI finansal analiz olusturulamadi.',
    });

    if (!response.ok) {
      addErrorLog({
        endpoint: '/api/gemini/finansal-analiz',
        kod: response.status,
        tur: response.statusText || 'GeminiAnalizError',
        kullanici: email,
        stack: payload?.message || 'AI finansal analiz olusturulamadi.',
      });
      throw new Error(payload?.message || 'AI finansal analiz olusturulamadi.');
    }

    const cache = readLocalJson<Record<string, string>>(AI_ANALIZ_KEY, {});
    writeLocalJson(AI_ANALIZ_KEY, { ...cache, [email]: payload.data.analiz });
    addSystemLog({ kullanici: email, islem_turu: 'create', tablo: 'ai_analizler', kayit_id: email, eski_deger: null, yeni_deger: { islem: 'ai_finansal_analiz', uzunluk: payload.data.analiz.length } });

    return payload as ApiResponse<{ analiz: string }>;
  } catch (error) {
    if (!(error instanceof Error && error.message.includes('AI finansal analiz'))) {
      addAICagriLog({
        firma_id: String(finansalVeriler.firma_id || finansalVeriler.firmaAdi || email),
        cagri_turu: 'analiz',
        prompt_uzunlugu: requestBody.length,
        yanit_suresi_ms: Math.round(performance.now() - startedAt),
        basarili: false,
        hata_mesaji: error instanceof Error ? error.message : 'Bilinmeyen AI analiz hatasi',
      });
      addErrorLog({
        endpoint: '/api/gemini/finansal-analiz',
        kod: 0,
        tur: 'FetchError',
        kullanici: email,
        stack: error instanceof Error ? `${error.name}: ${error.message}\n${error.stack || ''}` : String(error),
      });
    }
    throw error;
  }
};

export const getKayitliAIAnaliz = async (): Promise<string | null> => {
  const email = getLoggedInEmail() || 'anon';
  const cache = readLocalJson<Record<string, string>>(AI_ANALIZ_KEY, {});
  return cache[email] || null;
};

export const getUzmanAnalizTalepleri = async (): Promise<UzmanAnalizTalebi[]> => {
  return readLocalJson<UzmanAnalizTalebi[]>(UZMAN_ANALIZ_TALEPLERI_KEY, []);
};

export const getUzmanAnalizTalebim = async (): Promise<UzmanAnalizTalebi | null> => {
  const email = getLoggedInEmail();
  if (!email) return null;
  const talepler = await getUzmanAnalizTalepleri();
  return talepler
    .filter(talep => talep.user_email === email)
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())[0] || null;
};

export const uzmanAnalizTalepEt = async (finansalVeriler: Record<string, unknown>): Promise<ApiResponse<UzmanAnalizTalebi>> => {
  const authUser = await getCurrentUser();
  const mockUser = getCurrentMockUser();
  const user = mockUser || authUser;

  if (!user?.email) {
    throw new Error('Uzman analizi talebi icin once giris yapmalisiniz.');
  }

  const talepler = await getUzmanAnalizTalepleri();
  const mevcutBekleyen = talepler.find(talep => talep.user_email === user.email && talep.durum === 'bekliyor');

  if (mevcutBekleyen) {
    return { data: mevcutBekleyen, message: 'Bekleyen uzman analizi talebiniz var.' };
  }

  const talep: UzmanAnalizTalebi = {
    id: `uzman-${Date.now()}`,
    user_email: user.email,
    talep_eden: user.name || user.adSoyad || user.email,
    firma_adi: user.firmaAdi || 'Firma bilgisi yok',
    durum: 'bekliyor',
    finansal_veriler: finansalVeriler,
    created_at: new Date().toISOString(),
  };

  writeLocalJson(UZMAN_ANALIZ_TALEPLERI_KEY, [talep, ...talepler]);
  addSystemLog({ kullanici: user.email, islem_turu: 'create', tablo: 'uzman_analiz_talepleri', kayit_id: talep.id, eski_deger: null, yeni_deger: { firma: talep.firma_adi, durum: 'bekliyor' } });
  return { data: talep, message: 'Uzman analizi talebi admin paneline iletildi.' };
};

export const uzmanAnalizGonder = async (talepId: string, uzmanGorusu: string): Promise<ApiResponse<UzmanAnalizTalebi>> => {
  const talepler = await getUzmanAnalizTalepleri();
  let updated: UzmanAnalizTalebi | null = null;

  const next = talepler.map(talep => {
    if (talep.id !== talepId) return talep;
    updated = {
      ...talep,
      durum: 'tamamlandi',
      uzman_gorusu: uzmanGorusu,
      updated_at: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) throw new Error('Uzman analizi talebi bulunamadi.');
  writeLocalJson(UZMAN_ANALIZ_TALEPLERI_KEY, next);
  addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'update', tablo: 'uzman_analiz_talepleri', kayit_id: talepId, eski_deger: { durum: 'bekliyor' }, yeni_deger: { durum: 'tamamlandi' } });
  return { data: updated, message: 'Uzman gorusu kullaniciya gonderildi.' };
};

// ──────────────────────────────────────────────
// BİLDİRİMLER (User)
// ──────────────────────────────────────────────
export const getBildirimler = async (): Promise<Bildirim[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Bildirim[]>>('/bildirimler');
    return data.data;
  } catch {
    return [];
  }
};

export const okunduIsaretle = async (bildirimId: string): Promise<void> => {
  try { await apiClient.put(`/bildirimler/${bildirimId}/okundu`); } catch { /* mock */ }
};

export const tumunuOkunduIsaretle = async (): Promise<void> => {
  try { await apiClient.put('/bildirimler/tumunu-okundu'); } catch { /* mock */ }
};

// ──────────────────────────────────────────────
// LOGLAR (Admin)
// ──────────────────────────────────────────────
export const getLogs = async (filters?: LogFilters): Promise<PaginatedResponse<IslemLog>> => {
  return getIslemLoglari(filters);
};

export const getIslemLoglari = async (filters?: LogFilters): Promise<PaginatedResponse<IslemLog>> => {
  const systemLogs = getSystemLogs();
  const logsAsIslemLog: IslemLog[] = systemLogs.map(s => ({
    id: s.id,
    user_id: s.kullanici,
    islem_turu: s.islem_turu,
    tablo_adi: s.tablo,
    kayit_id: s.kayit_id,
    eski_deger: s.eski_deger,
    yeni_deger: s.yeni_deger,
    ip_adresi: '127.0.0.1',
    created_at: s.zaman,
  }));
  const dataToReturn = logsAsIslemLog.length > 0 ? logsAsIslemLog : MOCK_LOGS;

  return tryOrMock(
    async () => { const { data } = await apiClient.get<PaginatedResponse<IslemLog>>('/log/islemler', { params: filters }); return data; },
    { data: dataToReturn, total: dataToReturn.length, page: 1, per_page: 10 }
  );
};

export const getAICagriLoglari = async (filters?: LogFilters): Promise<PaginatedResponse<AICagriLog>> => {
  const localLogs = getLocalAICagriLoglari();
  return { data: localLogs, total: localLogs.length, page: 1, per_page: filters?.limit || 10 };
};

export const getErrorLogs = async (_filters?: LogFilters): Promise<PaginatedResponse<LocalErrorLog>> => {
  const localLogs = getLocalErrorLogs();
  return { data: localLogs, total: localLogs.length, page: 1, per_page: 10 };
};

// ──────────────────────────────────────────────
// FİNANS MODELLERİ (Bankalar, Tahsilatlar, Projeler)
// ──────────────────────────────────────────────

export const getBankalar = async (firmaId: string): Promise<ApiResponse<Banka[]>> => {
  const all = getLocalBankalar().filter(b => b.firma_id === firmaId);
  return tryOrMock(
    async () => { const { data } = await apiClient.get<ApiResponse<Banka[]>>(`/firma/${firmaId}/bankalar`); return data; },
    { data: all }
  );
};

export const createBanka = async (firmaId: string, payload: Partial<Banka>): Promise<ApiResponse<Banka>> => {
  const newBanka = { ...payload, id: `banka-${Date.now()}`, firma_id: firmaId } as Banka;
  writeLocalBankalar([...getLocalBankalar(), newBanka]);
  addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'create', tablo: 'bankalar', kayit_id: newBanka.id, eski_deger: null, yeni_deger: newBanka as any });
  return tryOrMock(
    async () => { const { data } = await apiClient.post<ApiResponse<Banka>>(`/firma/${firmaId}/bankalar`, payload); return data; },
    { data: newBanka, message: 'Banka eklendi' }
  );
};

export const getTahsilatlar = async (firmaId: string): Promise<ApiResponse<Tahsilat[]>> => {
  const all = getLocalTahsilatlar().filter(t => t.firma_id === firmaId);
  return tryOrMock(
    async () => { const { data } = await apiClient.get<ApiResponse<Tahsilat[]>>(`/firma/${firmaId}/tahsilatlar`); return data; },
    { data: all }
  );
};

export const createTahsilat = async (firmaId: string, payload: Partial<Tahsilat>): Promise<ApiResponse<Tahsilat>> => {
  const newTahsilat = { ...payload, id: `tahsilat-${Date.now()}`, firma_id: firmaId, durum: payload.durum || 'bekliyor' } as Tahsilat;
  writeLocalTahsilatlar([...getLocalTahsilatlar(), newTahsilat]);
  addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'create', tablo: 'tahsilatlar', kayit_id: newTahsilat.id, eski_deger: null, yeni_deger: newTahsilat as any });
  return tryOrMock(
    async () => { const { data } = await apiClient.post<ApiResponse<Tahsilat>>(`/firma/${firmaId}/tahsilatlar`, payload); return data; },
    { data: newTahsilat, message: 'Tahsilat eklendi' }
  );
};

export const getProjeler = async (firmaId: string): Promise<ApiResponse<Proje[]>> => {
  const all = getLocalProjeler().filter(p => p.firma_id === firmaId);
  return tryOrMock(
    async () => { const { data } = await apiClient.get<ApiResponse<Proje[]>>(`/firma/${firmaId}/projeler`); return data; },
    { data: all }
  );
};

export const createProje = async (firmaId: string, payload: Partial<Proje>): Promise<ApiResponse<Proje>> => {
  const newProje = { ...payload, id: `proje-${Date.now()}`, firmaId: firmaId, durum: payload.durum || 'devam' } as Proje;
  writeLocalProjeler([...getLocalProjeler(), newProje]);
  addSystemLog({ kullanici: getLoggedInEmail() || 'admin', islem_turu: 'create', tablo: 'projeler', kayit_id: newProje.id, eski_deger: null, yeni_deger: newProje as any });
  return tryOrMock(
    async () => { const { data } = await apiClient.post<ApiResponse<Proje>>(`/firma/${firmaId}/projeler`, payload); return data; },
    { data: newProje, message: 'Proje eklendi' }
  );
};

export const getNakitAkis = async (firmaId: string): Promise<ApiResponse<any[]>> => {
  const all = getLocalNakitAkis().filter(n => n.firma_id === firmaId);
  return tryOrMock(
    async () => { const { data } = await apiClient.get<ApiResponse<any[]>>(`/firma/${firmaId}/nakit-akis`); return data; },
    { data: all }
  );
};

export const createNakitAkis = async (firmaId: string, payload: any): Promise<ApiResponse<any>> => {
  const newItem = { ...payload, id: `nakit-${Date.now()}-${Math.random()}`, firma_id: firmaId };
  writeLocalNakitAkis([...getLocalNakitAkis(), newItem]);
  return tryOrMock(
    async () => { const { data } = await apiClient.post<ApiResponse<any>>(`/firma/${firmaId}/nakit-akis`, payload); return data; },
    { data: newItem, message: 'Nakit akışı eklendi' }
  );
};
