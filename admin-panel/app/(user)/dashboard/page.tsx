'use client';

import React from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, FileText, PieChart, Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PremiumKarti } from '@/components/user/PremiumKarti';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_DATA = [
  { ay: 'Oca', gelir: 420000, gider: 310000 },
  { ay: 'Şub', gelir: 380000, gider: 290000 },
  { ay: 'Mar', gelir: 510000, gider: 340000 },
  { ay: 'Nis', gelir: 470000, gider: 360000 },
  { ay: 'May', gelir: 550000, gider: 320000 },
  { ay: 'Haz', gelir: 600000, gider: 380000 },
];

export default function UserDashboard() {
  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hoş Geldiniz 👋</h1>
        <p className="text-slate-500 mt-1">Firmanızın finansal özet paneline göz atın.</p>
      </div>

      {/* METRİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-l-4 border-l-teal-500">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Toplam Gelir</p>
                <p className="text-2xl font-bold mt-1">₺2,930,000</p>
                <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12.5%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-red-400">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Toplam Gider</p>
                <p className="text-2xl font-bold mt-1">₺2,000,000</p>
                <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1"><TrendingDown className="w-3 h-3"/> +3.1%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Net Kâr</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">₺930,000</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Rapor Sayısı</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GRAFİK VE PREMİUM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <CardTitle className="text-lg">Gelir / Gider Karşılaştırması</CardTitle>
            <CardDescription>Son 6 aylık mali veriniz.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="ay" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="gelir" name="Gelir" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gider" name="Gider" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-1">
          <PremiumKarti onTalepEt={() => alert('Premium talep modalı açılacak')} />
        </div>
      </div>

      {/* SON AKTİVİTELER */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <CardTitle className="text-lg">Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {[
            { tarih: '02 May 2024, 14:30', mesaj: 'Finansal rapor güncellendi (2024-Q1)', tip: 'bilgi' },
            { tarih: '28 Nis 2024, 10:15', mesaj: 'Premium Analiz talebi gönderildi', tip: 'uyari' },
            { tarih: '25 Nis 2024, 16:45', mesaj: 'Firma bilgileri güncellendi', tip: 'bilgi' },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{a.mesaj}</p>
                <p className="text-xs text-slate-500 mt-1">{a.tarih}</p>
              </div>
              <Badge variant="outline" className={a.tip === 'uyari' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-teal-50 text-teal-700 border-teal-200'}>
                {a.tip === 'uyari' ? 'Bekliyor' : 'Tamamlandı'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
