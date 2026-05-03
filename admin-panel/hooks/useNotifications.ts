'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export interface Bildirim {
  id: string;
  tip: 'firma_onay' | 'premium_onay' | 'premium_red' | 'vade_yaklasan' | 'vade_gecti';
  mesaj: string;
  tarih: string;
  okundu: boolean;
  link?: string;
}

const STORAGE_KEY = 'pro_sicht_notifications';

const INITIAL_MOCK: Bildirim[] = [
  { id: 'system_1', tip: 'firma_onay', mesaj: 'Sisteme hoş geldiniz! Firma bilgilerinizi tamamlayarak tüm özellikleri aktif edebilirsiniz.', tarih: new Date().toISOString(), okundu: false, link: '/user/firma-bilgileri' },
];

function getStoredBildirimler(): Bildirim[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK));
      return INITIAL_MOCK;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_MOCK;
  }
}

function saveBildirimler(items: Bildirim[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

// Global Event Trigger method
export const sendNotification = (notification: Omit<Bildirim, 'id' | 'okundu' | 'tarih'>) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('pro-sicht-notification', { detail: notification });
    window.dispatchEvent(event);
  }
};

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      return getStoredBildirimler();
    },
    select: (data) => ({
      all: data?.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime()) ?? [],
      unread: data?.filter(n => !n.okundu) ?? [],
      unreadCount: data?.filter(n => !n.okundu).length ?? 0,
    }),
  });

  // Listen for real-time local events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<Omit<Bildirim, 'id' | 'okundu' | 'tarih'>>;
      const current = getStoredBildirimler();
      const yeni: Bildirim = {
        id: `noti_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        tarih: new Date().toISOString(),
        okundu: false,
        ...customEvent.detail
      };
      
      const updated = [yeni, ...current];
      saveBildirimler(updated);
      queryClient.setQueryData(['notifications'], updated);
    };

    window.addEventListener('pro-sicht-notification', handleNewNotification);
    
    // Also listen to storage changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('pro-sicht-notification', handleNewNotification);
      window.removeEventListener('storage', handleStorage);
    };
  }, [queryClient]);

  const markAsRead = (id: string) => {
    queryClient.setQueryData<Bildirim[]>(['notifications'], (old) => {
      const updated = old?.map(n => n.id === id ? { ...n, okundu: true } : n) ?? [];
      saveBildirimler(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    queryClient.setQueryData<Bildirim[]>(['notifications'], (old) => {
      const updated = old?.map(n => ({ ...n, okundu: true })) ?? [];
      saveBildirimler(updated);
      return updated;
    });
  };

  return { ...query, markAsRead, markAllAsRead };
}
