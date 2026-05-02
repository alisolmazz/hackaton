'use client';

import React from 'react';
import { Hourglass, ArrowRight, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function OnayBekleniyor() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-md w-full text-center">
        
        {/* Animasyonlu Hourglass */}
        <div className="relative mx-auto mb-8 w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-amber-100 dark:bg-amber-900/30 animate-ping opacity-20" />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/30 flex items-center justify-center border-2 border-amber-200 dark:border-amber-700 shadow-lg shadow-amber-100/50">
            <Hourglass className="w-12 h-12 text-amber-600 dark:text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Başlık */}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
          Hesabınız İnceleniyor
        </h1>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
          Firma bilgileriniz admin ekibimiz tarafından onaylanmaktadır. 
          Onaylandığında tüm özelliklere erişebileceksiniz.
        </p>

        {/* Zaman Tahmini */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300 text-sm font-medium">
            <RefreshCw className="w-4 h-4" />
            Genellikle 24 saat içinde onaylanır
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/user/firma-bilgileri')}
            className="w-full h-12 bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-lg"
          >
            Firma Bilgilerimi Güncelle <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* İletişim */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> Sorun mu var?{' '}
            <a href="mailto:admin@prosicht.com" className="text-teal-600 font-semibold hover:underline">
              admin@prosicht.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
