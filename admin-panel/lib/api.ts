import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';
import { getToken, logout } from './auth';
import type {
  ApiResponse, PaginatedResponse,
  Firma, FinansalRapor, Banka, Tahsilat, Proje,
  PremiumTalep, PremiumErisim, PremiumPaket,
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
});

// Request Interceptor: JWT Ekleme
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Hata Yönetimi
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (!error.response) {
      toast.error('Bağlantı hatası');
    } else {
      const status = error.response.status;
      if (status === 401) { toast.error('Oturumunuz süresi doldu.'); logout(); }
      else if (status === 403) { toast.error('Yetkiniz bulunmuyor'); }
    }
    return Promise.reject(error);
  }
);

// Eski uyumluluk için export
export const api = apiClient;

// ──────────────────────────────────────────────
// FİRMALAR (Admin)
// ──────────────────────────────────────────────
export const getFirmalar = async (filters?: FirmaFilters): Promise<PaginatedResponse<Firma>> => {
  const { data } = await apiClient.get<PaginatedResponse<Firma>>('/firma/list', { params: filters });
  return data;
};

export const getFirma = async (id: string): Promise<ApiResponse<Firma>> => {
  const { data } = await apiClient.get<ApiResponse<Firma>>(`/firma/${id}`);
  return data;
};

export const createFirma = async (payload: Partial<Firma>): Promise<ApiResponse<Firma>> => {
  const { data } = await apiClient.post<ApiResponse<Firma>>('/firma/create', payload);
  return data;
};

export const updateFirma = async (id: string, payload: Partial<Firma>): Promise<ApiResponse<Firma>> => {
  const { data } = await apiClient.put<ApiResponse<Firma>>(`/firma/${id}`, payload);
  return data;
};

export const deleteFirma = async (id: string): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.delete<ApiResponse<void>>(`/firma/${id}`);
  return data;
};

export const ocrFirma = async (firmaId: string | undefined, file: File): Promise<ApiResponse<OcrSonucu>> => {
  const formData = new FormData();
  formData.append('file', file);
  const url = firmaId ? `/firma/${firmaId}/ocr` : '/firma/ocr';
  const { data } = await apiClient.post<ApiResponse<OcrSonucu>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ──────────────────────────────────────────────
// FİRMAM (User — kendi firması)
// ──────────────────────────────────────────────
export const getFirmam = async (): Promise<ApiResponse<Firma>> => {
  const { data } = await apiClient.get<ApiResponse<Firma>>('/firma/me');
  return data;
};

export const updateFirmam = async (payload: Partial<Firma>): Promise<ApiResponse<Firma>> => {
  const { data } = await apiClient.put<ApiResponse<Firma>>('/firma/me', payload);
  return data;
};

export const ocrFirmam = async (file: File): Promise<ApiResponse<OcrSonucu>> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<ApiResponse<OcrSonucu>>('/firma/me/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ──────────────────────────────────────────────
// FİNANSAL RAPORLAR
// ──────────────────────────────────────────────
export const getFinansalRapor = async (firmaId: string, donem?: string): Promise<ApiResponse<FinansalRapor>> => {
  const { data } = await apiClient.get<ApiResponse<FinansalRapor>>(`/finansal/${firmaId}`, { params: { donem } });
  return data;
};

export const saveFinansalRapor = async (firmaId: string, payload: Partial<FinansalRapor>): Promise<ApiResponse<FinansalRapor>> => {
  const { data } = await apiClient.post<ApiResponse<FinansalRapor>>(`/finansal/${firmaId}`, payload);
  return data;
};

export const getBankalar = async (firmaId: string): Promise<ApiResponse<Banka[]>> => {
  const { data } = await apiClient.get<ApiResponse<Banka[]>>(`/finansal/${firmaId}/bankalar`);
  return data;
};

export const getTahsilatlar = async (firmaId: string): Promise<ApiResponse<Tahsilat[]>> => {
  const { data } = await apiClient.get<ApiResponse<Tahsilat[]>>(`/finansal/${firmaId}/tahsilatlar`);
  return data;
};

export const getProjeler = async (firmaId: string): Promise<ApiResponse<Proje[]>> => {
  const { data } = await apiClient.get<ApiResponse<Proje[]>>(`/finansal/${firmaId}/projeler`);
  return data;
};

export const getFinansalDurum = async (firmaId: string): Promise<ApiResponse<FinansalRapor>> => {
  const { data } = await apiClient.get<ApiResponse<FinansalRapor>>(`/finansal/${firmaId}/durum`);
  return data;
};

// ──────────────────────────────────────────────
// YAPAY ZEKA (AI)
// ──────────────────────────────────────────────
export const generateAIAnaliz = async (firmaId: string): Promise<ApiResponse<{ analiz: string }>> => {
  const { data } = await apiClient.post<ApiResponse<{ analiz: string }>>(`/finansal/${firmaId}/ai-analiz`);
  return data;
};

export const generatePptx = async (firmaId: string, ayarlar?: Record<string, unknown>): Promise<Blob> => {
  const response = await apiClient.post(`/pptx/${firmaId}/uret`, ayarlar ?? {}, { responseType: 'blob' });
  return response.data;
};

export const downloadPptx = async (firmaId: string): Promise<Blob> => {
  const response = await apiClient.get(`/pptx/${firmaId}/indir`, { responseType: 'blob' });
  return response.data;
};

// ──────────────────────────────────────────────
// PREMIUM TALEPLER
// ──────────────────────────────────────────────
export const getPremiumTalepler = async (filters?: TalepFilters): Promise<PaginatedResponse<PremiumTalep>> => {
  const { data } = await apiClient.get<PaginatedResponse<PremiumTalep>>('/premium/talepler', { params: filters });
  return data;
};

export const onaylaTalep = async (talepId: string): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.put<ApiResponse<void>>(`/premium/${talepId}/onayla`);
  return data;
};

export const reddettTalep = async (talepId: string, neden?: string): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.put<ApiResponse<void>>(`/premium/${talepId}/reddet`, { neden });
  return data;
};

export const getPremiumErisimlerim = async (): Promise<PremiumErisim[]> => {
  const { data } = await apiClient.get<ApiResponse<PremiumErisim[]>>('/premium/erisimlerim');
  return data.data;
};

export const premiumSatinAl = async (paketTuru: PremiumPaket): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.post<ApiResponse<void>>('/premium/satin-al', { paket_turu: paketTuru });
  return data;
};

// ──────────────────────────────────────────────
// BİLDİRİMLER (User)
// ──────────────────────────────────────────────
export const getBildirimler = async (): Promise<Bildirim[]> => {
  const { data } = await apiClient.get<ApiResponse<Bildirim[]>>('/bildirimler');
  return data.data;
};

export const okunduIsaretle = async (bildirimId: string): Promise<void> => {
  await apiClient.put(`/bildirimler/${bildirimId}/okundu`);
};

export const tumunuOkunduIsaretle = async (): Promise<void> => {
  await apiClient.put('/bildirimler/tumunu-okundu');
};

// ──────────────────────────────────────────────
// LOGLAR (Admin)
// ──────────────────────────────────────────────
export const getIslemLoglari = async (filters?: LogFilters): Promise<PaginatedResponse<IslemLog>> => {
  const { data } = await apiClient.get<PaginatedResponse<IslemLog>>('/log/islemler', { params: filters });
  return data;
};

export const getAICagriLoglari = async (filters?: LogFilters): Promise<PaginatedResponse<AICagriLog>> => {
  const { data } = await apiClient.get<PaginatedResponse<AICagriLog>>('/log/ai-cagrilar', { params: filters });
  return data;
};

export const getErrorLogs = async (filters?: LogFilters): Promise<PaginatedResponse<IslemLog>> => {
  const { data } = await apiClient.get<PaginatedResponse<IslemLog>>('/log/hatalar', { params: filters });
  return data;
};
