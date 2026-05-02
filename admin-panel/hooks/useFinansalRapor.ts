import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as api from '@/lib/api';
import { showSuccess, showError, showLoading } from '@/lib/toast';
import type { FinansalRapor } from '@/types';

/** Finansal rapor verisi (admin: firmaId, user: 'me') */
export function useFinansalRapor(firmaId: string, donem?: string) {
  return useQuery({
    queryKey: queryKeys.finansalRapor(firmaId, donem),
    queryFn: () => api.getFinansalRapor(firmaId, donem),
    enabled: !!firmaId,
  });
}

/** Finansal rapor kaydet */
export function useSaveFinansalRapor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ firmaId, data }: { firmaId: string; data: Partial<FinansalRapor> }) =>
      api.saveFinansalRapor(firmaId, data),
    onSuccess: (_, { firmaId }) => {
      qc.invalidateQueries({ queryKey: ['finansal', firmaId] });
      showSuccess('Finansal veriler kaydedildi');
    },
    onError: () => showError('Kaydetme başarısız'),
  });
}

/** AI Analiz raporu üret (15-30sn sürebilir) */
export function useGenerateAIAnaliz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (firmaId: string) => api.generateAIAnaliz(firmaId),
    onMutate: () => { showLoading('AI analiz üretiliyor...'); },
    onSuccess: (_, firmaId) => {
      qc.invalidateQueries({ queryKey: ['finansal', firmaId] });
      showSuccess('AI analiz raporu oluşturuldu');
    },
    onError: () => showError('AI analiz üretilemedi'),
  });
}

/** Banka listesi */
export function useBankalar(firmaId: string) {
  return useQuery({
    queryKey: queryKeys.bankalar(firmaId),
    queryFn: () => api.getBankalar(firmaId),
    enabled: !!firmaId,
  });
}

/** Tahsilat listesi */
export function useTahsilatlar(firmaId: string) {
  return useQuery({
    queryKey: queryKeys.tahsilatlar(firmaId),
    queryFn: () => api.getTahsilatlar(firmaId),
    enabled: !!firmaId,
  });
}

/** Proje listesi */
export function useProjeler(firmaId: string) {
  return useQuery({
    queryKey: queryKeys.projeler(firmaId),
    queryFn: () => api.getProjeler(firmaId),
    enabled: !!firmaId,
  });
}
