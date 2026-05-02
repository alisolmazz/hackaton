import type { Firma, PremiumPaket, TalepDurum } from '@/types';

/** Firma listesi filtre parametreleri */
export interface FirmaFilters {
  search?: string;
  onaylandi?: boolean;
  sayfa?: number;
  limit?: number;
}

/** Premium talep filtre parametreleri */
export interface TalepFilters {
  durum?: TalepDurum;
  paket?: PremiumPaket;
  search?: string;
  sayfa?: number;
}

/** Log filtre parametreleri */
export interface LogFilters {
  islem_turu?: string;
  tablo_adi?: string;
  user_id?: string;
  sayfa?: number;
  limit?: number;
  baslangic?: string;
  bitis?: string;
}

/** Merkezi query key yönetimi — tüm hook'lar bu key'leri kullanır */
export const queryKeys = {
  // Auth
  me: ['auth', 'me'] as const,

  // Firmalar (Admin)
  firmalar: (filters?: FirmaFilters) => ['firmalar', filters] as const,
  firma: (id: string) => ['firmalar', id] as const,

  // Kendi firma (User)
  firmam: ['firma', 'me'] as const,

  // Finansal
  finansalRapor: (firmaId: string, donem?: string) =>
    ['finansal', firmaId, donem] as const,
  bankalar: (firmaId: string) => ['bankalar', firmaId] as const,
  tahsilatlar: (firmaId: string) => ['tahsilatlar', firmaId] as const,
  projeler: (firmaId: string) => ['projeler', firmaId] as const,

  // Premium
  premiumTalepler: (filters?: TalepFilters) =>
    ['premium', 'talepler', filters] as const,
  premiumErisimler: (firmaId: string) =>
    ['premium', 'erisimler', firmaId] as const,
  premiumErisimlerim: ['premium', 'erisimlerim'] as const,

  // Loglar (Admin)
  islemLoglari: (filters?: LogFilters) => ['loglar', 'islem', filters] as const,
  aiCagriLoglari: (filters?: LogFilters) => ['loglar', 'ai', filters] as const,

  // Bildirimler (User)
  bildirimler: ['bildirimler'] as const,

  // Dashboard
  adminDashboard: ['dashboard', 'admin'] as const,
  userDashboard: ['dashboard', 'user'] as const,
};
