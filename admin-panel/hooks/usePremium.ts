import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, type TalepFilters } from '@/lib/query-keys';
import * as api from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import type { PremiumPaket } from '@/types';

/** Admin: Tüm premium talepler listesi */
export function usePremiumTalepler(filters?: TalepFilters) {
  return useQuery({
    queryKey: queryKeys.premiumTalepler(filters),
    queryFn: () => api.getPremiumTalepler(filters),
  });
}

/** Admin: Talebi onayla */
export function useOnaylaTalep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (talepId: string) => api.onaylaTalep(talepId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['premium'] });
      showSuccess('Premium erişim aktifleştirildi');
    },
    onError: () => showError('Onaylama başarısız'),
  });
}

/** Admin: Talebi reddet */
export function useReddettTalep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ talepId, neden }: { talepId: string; neden?: string }) =>
      api.reddettTalep(talepId, neden),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['premium'] });
      showSuccess('Talep reddedildi');
    },
    onError: () => showError('İşlem başarısız'),
  });
}

/** User: Kendi premium erişimleri */
export function usePremiumErisimlerim() {
  return useQuery({
    queryKey: queryKeys.premiumErisimlerim,
    queryFn: api.getPremiumErisimlerim,
    staleTime: 1 * 60 * 1000,
  });
}

/** User: Belirli özelliğe erişim var mı? */
export function usePremiumErisimVar(ozellik: 'ai_analiz' | 'uzman_gorusu' | 'on_sunum') {
  const { data: erisimler } = usePremiumErisimlerim();
  return erisimler?.some(e => e.ozellik === ozellik && e.aktif) ?? false;
}

/** User: Premium talep gönder */
export function usePremiumSatinAl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paketTuru: PremiumPaket) => api.premiumSatinAl(paketTuru),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['premium'] });
      showSuccess('Talebiniz iletildi! Admin onayı bekleniyor.');
    },
    onError: () => showError('Talep gönderilemedi'),
  });
}
