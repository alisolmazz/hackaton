import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';
import { getToken, logout } from './auth';
import { 
  ApiResponse, 
  Firma, 
  FinansalRapor, 
  PremiumTalep, 
  IslemLog, 
  OcrSonucu 
} from '@/types';

// Create Axios Instance
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: JWT Ekleme
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Hata Yönetimi
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (!error.response) {
      toast.error('Bağlantı hatası');
    } else {
      const status = error.response.status;
      if (status === 401) {
        toast.error('Oturumunuz süresi doldu, lütfen tekrar giriş yapın.');
        logout();
      } else if (status === 403) {
        toast.error('Yetkiniz bulunmuyor');
      }
    }
    return Promise.reject(error);
  }
);

// CRUD Fonksiyonları (API endpoints proxy üzerinden veya direkt backend'e gider)

// --- FİRMALAR ---
export const getFirmalar = async (): Promise<ApiResponse<Firma[]>> => {
  const { data } = await api.get<ApiResponse<Firma[]>>('/firma/list');
  return data;
};

export const getFirma = async (id: string): Promise<ApiResponse<Firma>> => {
  const { data } = await api.get<ApiResponse<Firma>>(`/firma/${id}`);
  return data;
};

export const createFirma = async (payload: Partial<Firma>): Promise<ApiResponse<Firma>> => {
  const { data } = await api.post<ApiResponse<Firma>>('/firma/create', payload);
  return data;
};

export const updateFirma = async (id: string, payload: Partial<Firma>): Promise<ApiResponse<Firma>> => {
  const { data } = await api.put<ApiResponse<Firma>>(`/firma/${id}`, payload);
  return data;
};

export const deleteFirma = async (id: string): Promise<ApiResponse<void>> => {
  const { data } = await api.delete<ApiResponse<void>>(`/firma/${id}`);
  return data;
};

export const runOcrOnFirma = async (id: string, file: File): Promise<ApiResponse<OcrSonucu>> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<ApiResponse<OcrSonucu>>(`/firma/${id}/ocr`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// --- FİNANSAL RAPORLAR ---
export const getFinansalRapor = async (firmaId: string): Promise<ApiResponse<FinansalRapor>> => {
  const { data } = await api.get<ApiResponse<FinansalRapor>>(`/finansal/${firmaId}`);
  return data;
};

export const saveFinansalRapor = async (firmaId: string, payload: Partial<FinansalRapor>): Promise<ApiResponse<FinansalRapor>> => {
  const { data } = await api.post<ApiResponse<FinansalRapor>>(`/finansal/${firmaId}`, payload);
  return data;
};

export const getFinansalDurum = async (firmaId: string): Promise<ApiResponse<any>> => {
  const { data } = await api.get<ApiResponse<any>>(`/finansal/${firmaId}/durum`);
  return data;
};

// --- YAPAY ZEKA (AI) ---
export const generateAIAnaliz = async (firmaId: string): Promise<ApiResponse<{ analiz: string }>> => {
  const { data } = await api.post<ApiResponse<{ analiz: string }>>(`/finansal/${firmaId}/ai-analiz`);
  return data;
};

export const generatePptx = async (firmaId: string): Promise<Blob> => {
  const response = await api.post(`/pptx/${firmaId}/uret`, {}, { responseType: 'blob' });
  return response.data;
};

export const downloadPptx = async (firmaId: string): Promise<Blob> => {
  const response = await api.get(`/pptx/${firmaId}/indir`, { responseType: 'blob' });
  return response.data;
};

// --- PREMIUM TALEPLER ---
export const getPremiumTalepler = async (): Promise<ApiResponse<PremiumTalep[]>> => {
  const { data } = await api.get<ApiResponse<PremiumTalep[]>>('/premium/talepler');
  return data;
};

export const onaylaTalep = async (talepId: string): Promise<ApiResponse<void>> => {
  const { data } = await api.put<ApiResponse<void>>(`/premium/${talepId}/onayla`);
  return data;
};

export const reddettTalep = async (talepId: string): Promise<ApiResponse<void>> => {
  const { data } = await api.put<ApiResponse<void>>(`/premium/${talepId}/reddet`);
  return data;
};

// --- LOGLAR ---
export const getLogs = async (): Promise<ApiResponse<IslemLog[]>> => {
  const { data } = await api.get<ApiResponse<IslemLog[]>>('/log/islemler');
  return data;
};

export const getAILogs = async (): Promise<ApiResponse<any[]>> => {
  const { data } = await api.get<ApiResponse<any[]>>('/log/ai-cagrilar');
  return data;
};

export const getErrorLogs = async (): Promise<ApiResponse<any[]>> => {
  const { data } = await api.get<ApiResponse<any[]>>('/log/hatalar');
  return data;
};
