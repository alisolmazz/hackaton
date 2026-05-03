import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';
import { getCurrentUser, getToken, logout } from './auth';
import type {
  ApiResponse, PaginatedResponse,
  Firma, FinansalRapor, Banka, Tahsilat, Proje,
  PremiumTalep, PremiumErisim, PremiumPaket, TalepDurum, UzmanAnalizTalebi,
  IslemLog, AICagriLog, OcrSonucu,
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
};

const readLocalJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalJson = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
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
  const existingPending = talepler.find(talep => getTalepUserKey(talep) === userKey && talep.durum === 'bekliyor');
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
  setLocalUserPremium(updatedTalep, durum === 'onaylandi');
  setLocalPremiumErisimler(updatedTalep, durum === 'onaylandi');
  return updatedTalep;
};

export const getPremiumHesapDurumu = async (): Promise<PremiumHesapDurumu> => {
  const authUser = await getCurrentUser();
  const mockUser = getCurrentMockUser();
  const user = mockUser || authUser;
  if (!user) return { hasPremium: false, talepDurum: 'yok', talep: null, paket: null };

  const userKey = getUserKey(user);
  const talepler = getLocalPremiumTalepler()
    .filter(talep => getTalepUserKey(talep) === userKey || talep.user_id === authUser?.id)
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
  const latest = talepler[0] || null;
  const hasPremium = Boolean(user.premium_aktif) || latest?.durum === 'onaylandi';

  return {
    hasPremium,
    talepDurum: hasPremium ? 'onaylandi' : latest?.durum || 'yok',
    talep: latest,
    paket: (user.premium_paket || latest?.paket_turu || null) as PremiumPaket | null,
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
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/gemini/firma-ocr', {
    method: 'POST',
    body: formData,
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Gemini belge analizi basarisiz oldu.');
  }

  return payload as ApiResponse<OcrSonucu>;
}

// ──────────────────────────────────────────────
// FİRMALAR (Admin)
// ──────────────────────────────────────────────
export const getFirmalar = async (filters?: FirmaFilters): Promise<PaginatedResponse<Firma>> => {
  const all = getLocalFirmalar();
  return tryOrMock(
    async () => { const { data } = await apiClient.get<PaginatedResponse<Firma>>('/firma/list', { params: filters }); return data; },
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
  return tryOrMock(
    async () => { const { data } = await apiClient.put<ApiResponse<Firma>>(`/firma/${id}`, payload); return data; },
    { data: { ...MOCK_FIRMALAR[0], ...payload, id } as Firma }
  );
};

export const deleteFirma = async (id: string): Promise<ApiResponse<void>> => {
  const all = getLocalFirmalar().filter(f => f.id !== id);
  writeLocalJson(MOCK_FIRMALAR_KEY, all);
  return tryOrMock(
    async () => { const { data } = await apiClient.delete<ApiResponse<void>>(`/firma/${id}`); return data; },
    { data: undefined as unknown as void }
  );
};

export const ocrFirma = async (firmaId: string | undefined, file: File): Promise<ApiResponse<OcrSonucu>> => {
  return postGeminiFirmaOcr(file);
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

export const getBankalar = async (firmaId: string): Promise<ApiResponse<Banka[]>> => {
  return tryOrMock(
    async () => { const { data } = await apiClient.get<ApiResponse<Banka[]>>(`/finansal/${firmaId}/bankalar`); return data; },
    { data: [
      { id: 'b1', firma_id: firmaId, banka_adi: 'Garanti BBVA', hesap_no: 'TR12 0006 2000 ****4521', bakiye: 1250000, kredi_limiti: 2000000, kredi_kullanim: 750000 },
      { id: 'b2', firma_id: firmaId, banka_adi: 'İş Bankası', hesap_no: 'TR34 0006 4000 ****7890', bakiye: 870000, kredi_limiti: 1500000, kredi_kullanim: 1100000 },
      { id: 'b3', firma_id: firmaId, banka_adi: 'Yapı Kredi', hesap_no: 'TR56 0006 7000 ****3456', bakiye: 340000, kredi_limiti: 800000, kredi_kullanim: 680000 },
    ]}
  );
};

export const getTahsilatlar = async (firmaId: string): Promise<ApiResponse<Tahsilat[]>> => {
  return tryOrMock(
    async () => { const { data } = await apiClient.get<ApiResponse<Tahsilat[]>>(`/finansal/${firmaId}/tahsilatlar`); return data; },
    { data: [
      { id: 't1', firma_id: firmaId, tutar: 45000, aciklama: 'Fatura #2024-045', vade_tarihi: '2024-04-15', odeme_tarihi: null, durum: 'gecikti' as const },
      { id: 't2', firma_id: firmaId, tutar: 65000, aciklama: 'Proje Alpha 3.taksit', vade_tarihi: '2024-05-10', odeme_tarihi: null, durum: 'bekliyor' as const },
      { id: 't3', firma_id: firmaId, tutar: 35000, aciklama: 'Fatura #2024-040', vade_tarihi: '2024-04-01', odeme_tarihi: '2024-04-28', durum: 'odendi' as const },
    ]}
  );
};

export const getProjeler = async (firmaId: string): Promise<ApiResponse<Proje[]>> => {
  return tryOrMock(
    async () => { const { data } = await apiClient.get<ApiResponse<Proje[]>>(`/finansal/${firmaId}/projeler`); return data; },
    { data: [
      { id: 'p1', firma_id: firmaId, proje_adi: 'ERP Modül Geliştirme', durum: 'devam' as const, baslangic: '2024-01-15', bitis: null, tutar: 180000 },
      { id: 'p2', firma_id: firmaId, proje_adi: 'Mobil Uygulama v2', durum: 'devam' as const, baslangic: '2024-03-01', bitis: null, tutar: 95000 },
      { id: 'p3', firma_id: firmaId, proje_adi: 'Web Sitesi Yenileme', durum: 'bitti' as const, baslangic: '2023-10-01', bitis: '2024-02-15', tutar: 60000 },
    ]}
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
    return data;
  } catch {
    updateLocalPremiumTalep(talepId, 'onaylandi');
    return { data: undefined as unknown as void, message: 'Talep onaylandi' };
  }
};

export const reddettTalep = async (talepId: string, neden?: string): Promise<ApiResponse<void>> => {
  try {
    const { data } = await apiClient.put<ApiResponse<void>>(`/premium/${talepId}/reddet`, { neden });
    updateLocalPremiumTalep(talepId, 'reddedildi', neden);
    return data;
  } catch {
    updateLocalPremiumTalep(talepId, 'reddedildi', neden);
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
  try {
    const { data } = await apiClient.post<ApiResponse<void>>('/premium/satin-al', { paket_turu: paketTuru });
    await createLocalPremiumTalep(paketTuru);
    return data;
  } catch {
    await createLocalPremiumTalep(paketTuru);
    return { data: undefined as unknown as void, message: 'Talep gonderildi' };
  }
};

export const generateUserFinansalAIAnaliz = async (finansalVeriler: Record<string, unknown>): Promise<ApiResponse<{ analiz: string }>> => {
  const response = await fetch('/api/gemini/finansal-analiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ finansalVeriler }),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'AI finansal analiz olusturulamadi.');
  }

  const email = getLoggedInEmail() || 'anon';
  const cache = readLocalJson<Record<string, string>>(AI_ANALIZ_KEY, {});
  writeLocalJson(AI_ANALIZ_KEY, { ...cache, [email]: payload.data.analiz });

  return payload as ApiResponse<{ analiz: string }>;
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
  return tryOrMock(
    async () => { const { data } = await apiClient.get<PaginatedResponse<IslemLog>>('/log/islemler', { params: filters }); return data; },
    { data: MOCK_LOGS, total: MOCK_LOGS.length, page: 1, per_page: 10 }
  );
};

export const getAICagriLoglari = async (filters?: LogFilters): Promise<PaginatedResponse<AICagriLog>> => {
  return tryOrMock(
    async () => { const { data } = await apiClient.get<PaginatedResponse<AICagriLog>>('/log/ai-cagrilar', { params: filters }); return data; },
    { data: [
      { id: 'ai1', firma_id: '1', cagri_turu: 'ocr' as const, prompt_uzunlugu: 450, yanit_suresi_ms: 2300, basarili: true, hata_mesaji: null, created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 'ai2', firma_id: '1', cagri_turu: 'analiz' as const, prompt_uzunlugu: 1200, yanit_suresi_ms: 5600, basarili: true, hata_mesaji: null, created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: 'ai3', firma_id: '2', cagri_turu: 'pptx' as const, prompt_uzunlugu: 800, yanit_suresi_ms: 8900, basarili: false, hata_mesaji: 'Timeout exceeded', created_at: new Date(Date.now() - 86400000).toISOString() },
    ], total: 3, page: 1, per_page: 10 }
  );
};

export const getErrorLogs = async (filters?: LogFilters): Promise<PaginatedResponse<IslemLog>> => {
  return tryOrMock(
    async () => { const { data } = await apiClient.get<PaginatedResponse<IslemLog>>('/log/hatalar', { params: filters }); return data; },
    { data: [], total: 0, page: 1, per_page: 10 }
  );
};
