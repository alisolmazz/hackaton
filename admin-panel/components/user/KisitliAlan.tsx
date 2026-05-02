'use client';

import React from 'react';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KisitliAlanProps {
  children?: React.ReactNode;
  baslik?: string;
  aciklama?: string;
  onTalepEt?: () => void;
}

export function KisitliAlan({ children, baslik = 'Premium Özellik', aciklama, onTalepEt }: KisitliAlanProps) {
  return (
    <div className="relative">
      {/* Blurred Content Behind */}
      {children && (
        <div className="blur-sm pointer-events-none select-none opacity-40">
          {children}
        </div>
      )}

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700">
        <div className="flex flex-col items-center text-center max-w-sm p-8">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-800">
            <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{baslik}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {aciklama || 'Bu özelliğe erişebilmek için Premium pakete yükseltmeniz gerekmektedir.'}
          </p>
          <Button 
            onClick={onTalepEt}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-300/30"
          >
            <Crown className="w-4 h-4 mr-2" /> Premium'a Yükselt <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
