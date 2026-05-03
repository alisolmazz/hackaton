import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, type FirmaFilters } from '@/lib/query-keys';
import * as api from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import type { Firma } from '@/types';

/** Admin: Firma listesi (filtreleme + pagination destekli) */
export function useFirmalar(filters?: FirmaFilters) {
  return useQuery({
    queryKey: queryKeys.firmalar(filters),
    queryFn: () => api.getFirmalar(filters),
    placeholderData: (prev) => prev,
  });
}

/** Admin: Alt firma listesi */
export function useAltFirmalar(parentId: string) {
  return useQuery({
    queryKey: ['alt_firmalar', parentId],
    queryFn: () => api.getAltFirmalar(parentId),
    enabled: !!parentId,
  });
}

/** Admin: Tekil firma detayı */
export function useFirma(id: string) {
  return useQuery({
    queryKey: queryKeys.firma(id),
    queryFn: () => api.getFirma(id),
    enabled: !!id,
  });
}

/** Admin: Yeni firma oluştur */
export function useCreateFirma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createFirma,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['firmalar'] });
      showSuccess('Firma başarıyla oluşturuldu');
    },
    onError: (err: Error) => showError('Firma oluşturulamadı: ' + err.message),
  });
}

/** Admin: Firma bilgilerini güncelle */
export function useUpdateFirma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Firma> }) =>
      api.updateFirma(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.firma(id) });
      qc.invalidateQueries({ queryKey: ['firmalar'] });
      showSuccess('Firma güncellendi');
    },
    onError: () => showError('Güncelleme başarısız'),
  });
}

/** Admin: Firma sil (optimistic update) */
export function useDeleteFirma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteFirma,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['firmalar'] });
      const previous = qc.getQueryData(['firmalar']);
      qc.setQueryData(['firmalar'], (old: ReturnType<typeof api.getFirmalar> extends Promise<infer T> ? T : never) => {
        if (!old) return old;
        return { ...old, data: old.data.filter((f) => f.id !== id) };
      });
      return { previous };
    },
    onError: (_, __, ctx) => {
      if (ctx?.previous) qc.setQueryData(['firmalar'], ctx.previous);
      showError('Silme işlemi başarısız');
    },
    onSuccess: () => showSuccess('Firma silindi'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['firmalar'] }),
  });
}

/** Admin: Firma onay ver */
export function useOnaylaFirma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.updateFirma(id, { onaylandi: true }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.firma(id) });
      qc.invalidateQueries({ queryKey: ['firmalar'] });
      showSuccess('Firma onaylandı');
    },
    onError: () => showError('Onaylama başarısız'),
  });
}

/** Admin: OCR ile belge parse et */
export function useOcrFirma() {
  return useMutation({
    mutationFn: ({ firmaId, file }: { firmaId?: string; file: File }) =>
      api.ocrFirma(firmaId, file),
    onError: () => showError('Belge okunamadı, lütfen manuel doldurun'),
  });
}
