'use client';

import React from 'react';
import { Lock, Crown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KisitliAlanProps {
  children?: React.ReactNode;
  ozellikAdi?: string;
  paketAdi?: string;
  aciklama?: string;
  ozellikler?: string[];
  onPaketTikla?: () => void;
}

export function KisitliAlan({ 
  children, 
  ozellikAdi = 'Premium Özellik', 
  paketAdi = 'Premium Bundle',
  aciklama,
  ozellikler,
  onPaketTikla 
}: KisitliAlanProps) {
  return (
    <div className="relative min-h-[400px] rounded-xl overflow-hidden border-2 border-dashed border-amber-300 dark:border-amber-700">
      {/* Blurred Content Behind */}
      {children && (
        <div className="blur-[6px] pointer-events-none select-none opacity-30 p-6">
          {children}
        </div>
      )}

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-[2px]">
        <div className="flex flex-col items-center text-center max-w-md p-8">
          
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/30 flex items-center justify-center mb-5 border-2 border-amber-200 dark:border-amber-700 shadow-lg shadow-amber-100/50">
            <Lock className="w-9 h-9 text-amber-600 dark:text-amber-400" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{ozellikAdi}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {aciklama || `Bu özellik ${paketAdi} paketine dahildir. Erişim sağlamak için paketinizi yükseltin.`}
          </p>

          {ozellikler && ozellikler.length > 0 && (
            <ul className="text-sm space-y-2 mb-6 text-left w-full max-w-xs">
              {ozellikler.map((o, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {o}
                </li>
              ))}
            </ul>
          )}
          
          <Button 
            onClick={onPaketTikla}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-300/30 h-12 px-8 text-base"
          >
            <Crown className="w-5 h-5 mr-2" /> Paketi Satın Al <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
