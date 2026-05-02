'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * URL query parametreleri ile tablo filtresi yönetimi.
 * Sayfa yenilendiğinde filtreler korunur.
 *
 * @example
 * const { filters, setFilter, resetFilters } = useTableFilters<{ durum: string; search: string }>();
 * setFilter('durum', 'bekliyor');  // URL: ?durum=bekliyor&page=1
 * resetFilters();                  // URL: ?
 */
export function useTableFilters<T extends Record<string, string>>() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = Object.fromEntries(searchParams.entries()) as Partial<T>;

  const setFilter = useCallback((key: keyof T, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key as string, value);
    else params.delete(key as string);
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const setPage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const resetFilters = useCallback(() => {
    router.push('?', { scroll: false });
  }, [router]);

  const currentPage = Number(searchParams.get('page') ?? '1');

  return { filters, setFilter, setPage, resetFilters, currentPage };
}
