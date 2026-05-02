import { useQuery } from '@tanstack/react-query';
import { queryKeys, type LogFilters } from '@/lib/query-keys';
import * as api from '@/lib/api';

/** Admin: İşlem logları (pagination destekli) */
export function useIslemLoglari(filters?: LogFilters) {
  return useQuery({
    queryKey: queryKeys.islemLoglari(filters),
    queryFn: () => api.getIslemLoglari(filters),
    placeholderData: (prev) => prev,
  });
}

/** Admin: AI çağrı logları */
export function useAICagriLoglari(filters?: LogFilters) {
  return useQuery({
    queryKey: queryKeys.aiCagriLoglari(filters),
    queryFn: () => api.getAICagriLoglari(filters),
  });
}
