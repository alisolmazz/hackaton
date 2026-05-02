'use client';

import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NAKIT_DATA = [
  { ay: 'Oca', giris: 420000, cikis: 310000, net: 110000 },
  { ay: 'Şub', giris: 380000, cikis: 290000, net: 90000 },
  { ay: 'Mar', giris: 510000, cikis: 340000, net: 170000 },
  { ay: 'Nis', giris: 470000, cikis: 360000, net: 110000 },
  { ay: 'May', giris: 550000, cikis: 320000, net: 230000 },
  { ay: 'Haz', giris: 600000, cikis: 380000, net: 220000 },
];

export default function NakitAkisPage() {
  return (
    <div className="space-y-8 max-w-[1100px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nakit Akışı</h1>
        <p className="text-slate-500 mt-1">Aylık nakit giriş ve çıkışlarınızın özeti.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-teal-500 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 font-medium">Toplam Nakit Giriş</p>
            <p className="text-2xl font-bold text-teal-600 mt-1">₺2,930,000</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-400 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 font-medium">Toplam Nakit Çıkış</p>
            <p className="text-2xl font-bold text-red-500 mt-1">₺2,000,000</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500 font-medium">Net Nakit Pozisyon</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">₺930,000</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <CardTitle className="text-lg">Nakit Akış Grafiği</CardTitle>
          <CardDescription>Son 6 aylık nakit akış trendi</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={NAKIT_DATA}>
              <defs>
                <linearGradient id="colorGiris" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCikis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="ay" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`} contentStyle={{ borderRadius: '8px' }} />
              <Area type="monotone" dataKey="giris" name="Nakit Giriş" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorGiris)" />
              <Area type="monotone" dataKey="cikis" name="Nakit Çıkış" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorCikis)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
