import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as api from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import type { Firma } from '@/types';

/** User: Kendi firma verisi (GET /firma/me) */
export function useFirmam() {
  return useQuery({
    queryKey: queryKeys.firmam,
    queryFn: api.getFirmam,
    staleTime: 2 * 60 * 1000,
  });
}

/** User: Kendi firma bilgilerini güncelle */
export function useUpdateFirmam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Firma>) => api.updateFirmam(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.firmam });
      showSuccess('Firma bilgileriniz güncellendi');
    },
    onError: () => showError('Güncelleme başarısız'),
  });
}

/** User: OCR ile kendi belgesini parse et */
export function useOcrFirmam() {
  return useMutation({
    mutationFn: (file: File) => api.ocrFirmam(file),
    onError: () => showError('Belge okunamadı'),
  });
}
