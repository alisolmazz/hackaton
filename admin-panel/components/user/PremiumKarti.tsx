'use client';

import React from 'react';
import { Crown, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PremiumKartiProps {
  onTalepEt?: () => void;
}

export function PremiumKarti({ onTalepEt }: PremiumKartiProps) {
  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/10 shadow-lg relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-200/30 dark:bg-amber-800/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-orange-200/30 dark:bg-orange-800/20 rounded-full blur-2xl" />
      
      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-amber-900 dark:text-amber-100">Premium'a Yükselt</CardTitle>
            <CardDescription className="text-amber-700/70 dark:text-amber-300/70">Tüm özelliklere erişim kazanın</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        <ul className="space-y-2.5 text-sm">
          <li className="flex items-center gap-2 text-amber-900 dark:text-amber-100 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> AI Destekli Finansal Analiz
          </li>
          <li className="flex items-center gap-2 text-amber-900 dark:text-amber-100 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Uzman Yorumlu Raporlar
          </li>
          <li className="flex items-center gap-2 text-amber-900 dark:text-amber-100 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Hazır Sunum (.pptx) Oluşturma
          </li>
          <li className="flex items-center gap-2 text-amber-900 dark:text-amber-100 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Borç/Alacak Detaylı Takip
          </li>
        </ul>

        <Button 
          onClick={onTalepEt}
          className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-300/30 text-base"
        >
          <Crown className="w-5 h-5 mr-2" /> Premium Talep Et <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
