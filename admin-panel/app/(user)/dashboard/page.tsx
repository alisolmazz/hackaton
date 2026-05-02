'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingDown, CheckCircle2, Briefcase, Crown,
  FileBarChart, TrendingUp, Building2, Rocket, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OnayBekleniyor } from '@/components/user/OnayBekleniyor';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_DATA = [
  { ay: 'Oca', gelir: 420000, gider: 310000 },
  { ay: 'Şub', gelir: 380000, gider: 290000 },
  { ay: 'Mar', gelir: 510000, gider: 340000 },
  { ay: 'Nis', gelir: 470000, gider: 360000 },
  { ay: 'May', gelir: 550000, gider: 320000 },
  { ay: 'Haz', gelir: 600000, gider: 380000 },
];

const SON_TAHSILATLAR = [
  { tarih: '02 May 2024', aciklama: 'Proje Alpha taksit ödemesi', tutar: 45000, durum: 'Tamamlandı' },
  { tarih: '28 Nis 2024', aciklama: 'Aylık danışmanlık bedeli', tutar: 20000, durum: 'Tamamlandı' },
  { tarih: '20 Nis 2024', aciklama: 'Yazılım lisans yenileme', tutar: 8500, durum: 'Bekliyor' },
  { tarih: '15 Nis 2024', aciklama: 'Sistem kurulum ücreti', tutar: 35000, durum: 'Tamamlandı' },
  { tarih: '10 Nis 2024', aciklama: 'Ek modül geliştirme', tutar: 12000, durum: 'Gecikti' },
];

const HIZLI_ERISIM = [
  { label: 'Finansal Raporumu Görüntüle', href: '/user/finansal-rapor', icon: FileBarChart, renk: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 hover:border-teal-400', iconRenk: 'text-teal-600' },
  { label: 'Nakit Akışımı İncele', href: '/user/nakit-akis', icon: TrendingUp, renk: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400', iconRenk: 'text-blue-600' },
  { label: 'Firma Bilgilerimi Güncelle', href: '/user/firma-bilgileri', icon: Building2, renk: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-400', iconRenk: 'text-purple-600' },
];

export default function UserDashboard() {
  // Mock: firma onay durumu kontrol
  const [firmaOnaylandi] = useState(true); // false yapılırsa OnayBekleniyor gösterilir
  const hasPremium = false; // Premium paketi yok

  if (!firmaOnaylandi) {
    return <OnayBekleniyor />;
  }

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">

      {/* HOŞ GELDİN MESAJI */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Merhaba, Ahmet! 👋</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">TechNova Yazılım A.Ş. hesabına hoş geldiniz.</p>
      </div>

      {/* METRİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-sm border-l-4 border-l-red-400 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Toplam Alacak</p>
                <p className="text-2xl font-bold mt-1 text-red-600">₺156,000</p>
                <p className="text-xs text-red-500/80 mt-1">3 bekleyen tahsilat</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Bu Ay Tahsilat</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">₺65,000</p>
                <p className="text-xs text-emerald-500/80 mt-1">2 ödeme gerçekleşti</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Aktif Proje</p>
                <p className="text-2xl font-bold mt-1">4</p>
                <p className="text-xs text-blue-500/80 mt-1">1 tamamlanmak üzere</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Paketim</p>
                <p className="text-2xl font-bold mt-1">Temel</p>
                <p className="text-xs text-amber-500/80 mt-1">Yükseltme yapılabilir</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HIZLI ERİŞİM BUTONLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {HIZLI_ERISIM.map(item => (
          <Link key={item.href} href={item.href}>
            <Card className={`cursor-pointer border-2 ${item.renk} transition-all duration-200 hover:shadow-md group h-full`}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border shadow-sm shrink-0">
                  <item.icon className={`w-6 h-6 ${item.iconRenk}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">{item.label}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* Premium Butonu */}
        <Card className="cursor-pointer border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 transition-all duration-200 hover:shadow-lg group h-full">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50 shrink-0">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-amber-900 dark:text-amber-100 leading-tight">Premium'a Geç</p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600 transition-colors shrink-0" />
          </CardContent>
        </Card>
      </div>

      {/* GELİR/GİDER GRAFİĞİ */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <CardTitle className="text-lg">Gelir / Gider Karşılaştırması</CardTitle>
          <CardDescription>Son 6 aylık mali veriniz.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 h-[320px]">
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

      {/* SON TAHSİLATLAR */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <CardTitle className="text-lg">Son Aktiviteler</CardTitle>
          <CardDescription>Son 5 tahsilat kaydınız</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {SON_TAHSILATLAR.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{t.aciklama}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.tarih}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-bold text-slate-900 dark:text-white">₺{t.tutar.toLocaleString('tr-TR')}</span>
                <Badge variant="outline" className={`shadow-none text-xs ${
                  t.durum === 'Tamamlandı' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  t.durum === 'Gecikti' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>{t.durum}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* PREMİUM BANNER (paket yoksa) */}
      {!hasPremium && (
        <Card className="border-none shadow-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shrink-0">
                <Rocket className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">AI Finansal Analiz özelliğine erişin</h3>
                <p className="text-white/80 mt-1">Finansal verilerinizi yapay zeka ile analiz ettirin, profesyonel rapor alın.</p>
              </div>
            </div>
            <Button className="bg-white text-orange-600 hover:bg-white/90 font-bold px-8 h-12 text-base shadow-xl shrink-0">
              <Crown className="w-5 h-5 mr-2" /> Paketleri İncele
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
