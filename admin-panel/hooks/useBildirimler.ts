import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as api from '@/lib/api';
import type { Bildirim } from '@/lib/api';

/** User: Bildirimler (30sn polling) */
export function useBildirimler() {
  return useQuery({
    queryKey: queryKeys.bildirimler,
    queryFn: api.getBildirimler,
    refetchInterval: 30 * 1000,
    select: (data: Bildirim[]) => ({
      all: data,
      unread: data.filter(n => !n.okundu),
      unreadCount: data.filter(n => !n.okundu).length,
    }),
  });
}

/** User: Tek bildirim okundu işaretle (optimistic) */
export function useOkunduIsaretle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bildirimId: string) => api.okunduIsaretle(bildirimId),
    onMutate: async (bildirimId: string) => {
      await qc.cancelQueries({ queryKey: queryKeys.bildirimler });
      const previous = qc.getQueryData<Bildirim[]>(queryKeys.bildirimler);
      qc.setQueryData<Bildirim[]>(queryKeys.bildirimler, (old) =>
        old?.map(b => b.id === bildirimId ? { ...b, okundu: true } : b)
      );
      return { previous };
    },
    onError: (_, __, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.bildirimler, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.bildirimler }),
  });
}

/** User: Tüm bildirimleri okundu işaretle */
export function useTumunuOkunduIsaretle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.tumunuOkunduIsaretle,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.bildirimler }),
  });
}

// Re-export Bildirim tipi
export type { Bildirim } from '@/lib/api';
