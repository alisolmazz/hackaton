'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Bildirim {
  id: string;
  tip: 'firma_onay' | 'premium_onay' | 'premium_red' | 'vade_yaklasan' | 'vade_gecti';
  mesaj: string;
  tarih: string;
  okundu: boolean;
  link?: string;
}

// Mock data
const MOCK_BILDIRIMLER: Bildirim[] = [
  { id: '1', tip: 'premium_onay', mesaj: 'Premium Bundle talebiniz onaylandı! AI Analiz artık aktif.', tarih: new Date(Date.now() - 2 * 60 * 1000).toISOString(), okundu: false, link: '/user/finansal-rapor' },
  { id: '2', tip: 'vade_yaklasan', mesaj: '3 tahsilatınızın vadesi 7 gün içinde dolacak.', tarih: new Date(Date.now() - 15 * 60 * 1000).toISOString(), okundu: false, link: '/user/borc-alacak' },
  { id: '3', tip: 'firma_onay', mesaj: 'Firma kaydınız onaylandı! Artık tüm özelliklere erişebilirsiniz.', tarih: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), okundu: true, link: '/user/dashboard' },
  { id: '4', tip: 'vade_gecti', mesaj: '2 tahsilatınızın vadesi geçti!', tarih: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), okundu: false, link: '/user/borc-alacak' },
  { id: '5', tip: 'premium_red', mesaj: 'Uzman Görüşü talebiniz reddedildi. Detay için profil sayfasını ziyaret edin.', tarih: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), okundu: true, link: '/user/profil' },
  { id: '6', tip: 'firma_onay', mesaj: 'Firma bilgileriniz başarıyla güncellendi.', tarih: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), okundu: true },
];

async function fetchBildirimler(): Promise<Bildirim[]> {
  // Mock API call
  await new Promise(r => setTimeout(r, 200));
  return MOCK_BILDIRIMLER;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchBildirimler,
    refetchInterval: 30 * 1000,
    select: (data) => ({
      all: data,
      unread: data.filter(n => !n.okundu),
      unreadCount: data.filter(n => !n.okundu).length,
    }),
  });

  const markAsRead = (id: string) => {
    queryClient.setQueryData<Bildirim[]>(['notifications'], (old) =>
      old?.map(n => n.id === id ? { ...n, okundu: true } : n)
    );
  };

  const markAllAsRead = () => {
    queryClient.setQueryData<Bildirim[]>(['notifications'], (old) =>
      old?.map(n => ({ ...n, okundu: true }))
    );
  };

  return { ...query, markAsRead, markAllAsRead };
}
