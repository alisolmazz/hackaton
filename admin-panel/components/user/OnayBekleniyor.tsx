'use client';

import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface OnayBekleniyorProps {
  tip?: 'premium' | 'hesap';
}

export function OnayBekleniyor({ tip = 'premium' }: OnayBekleniyorProps) {
  const mesajlar = {
    premium: {
      baslik: 'Premium Talebiniz İnceleniyor',
      aciklama: 'Talebiniz yönetici onayına gönderilmiştir. Onaylandığında e-posta ile bilgilendirileceksiniz. Bu süreç genellikle 1 iş günü sürmektedir.',
    },
    hesap: {
      baslik: 'Hesabınız Onay Bekliyor',
      aciklama: 'Kaydınız alınmıştır. Yönetici hesabınızı onayladığında tüm özelliklere erişim sağlayabileceksiniz.',
    },
  };

  const { baslik, aciklama } = mesajlar[tip];

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
      <CardContent className="p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
          <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 dark:text-amber-100 text-lg">{baslik}</h4>
          <p className="text-sm text-amber-700/80 dark:text-amber-300/80 mt-1 leading-relaxed">{aciklama}</p>
        </div>
      </CardContent>
    </Card>
  );
}
