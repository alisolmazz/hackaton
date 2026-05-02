'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, Building2, CheckCircle2, Crown, FileBarChart, Rocket, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { OnayBekleniyor } from '@/components/user/OnayBekleniyor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPremiumHesapDurumu } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/types';

const CHART_DATA: { ay: string; gelir: number; gider: number }[] = [];
const SON_TAHSILATLAR: { tarih: string; aciklama: string; tutar: number; durum: string }[] = [];

const HIZLI_ERISIM = [
  { label: 'Finansal Raporumu Goruntule', href: '/user/finansal-rapor', icon: FileBarChart, renk: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 hover:border-teal-400', iconRenk: 'text-teal-600' },
  { label: 'Nakit Akisimi Incele', href: '/user/nakit-akis', icon: TrendingUp, renk: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400', iconRenk: 'text-blue-600' },
  { label: 'Firma Bilgilerimi Guncelle', href: '/user/firma-bilgileri', icon: Building2, renk: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-400', iconRenk: 'text-purple-600' },
];

export default function UserDashboard() {
  const [firmaOnaylandi] = useState(true);
  const [hasPremium, setHasPremium] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadState = async () => {
      const durum = await getPremiumHesapDurumu();
      setHasPremium(durum.hasPremium);
      setUser(await getCurrentUser());
    };

    loadState();
    window.addEventListener('premium-data-changed', loadState);
    return () => window.removeEventListener('premium-data-changed', loadState);
  }, []);

  if (!firmaOnaylandi) return <OnayBekleniyor />;

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Merhaba, {user?.name || 'Kullanıcı'}!</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{user?.firmaAdi || 'Yeni şirket'} hesabına hoş geldiniz.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Toplam Alacak', value: '₺0', note: 'Bekleyen tahsilat yok', icon: TrendingDown, tone: 'text-red-600', border: 'border-l-red-400' },
          { title: 'Bu Ay Tahsilat', value: '₺0', note: 'Henüz ödeme yok', icon: CheckCircle2, tone: 'text-emerald-600', border: 'border-l-emerald-500' },
          { title: 'Aktif Proje', value: '0', note: 'Aktif proje yok', icon: Briefcase, tone: 'text-blue-600', border: 'border-l-blue-500' },
          { title: 'Paketim', value: hasPremium ? 'Premium' : 'Temel', note: hasPremium ? 'Premium mod aktif' : 'Yükseltme yapılabilir', icon: Crown, tone: 'text-amber-600', border: 'border-l-amber-500' },
        ].map(item => (
          <Card key={item.title} className={`shadow-sm border-l-4 ${item.border}`}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">{item.title}</p>
                  <p className={`text-2xl font-bold mt-1 ${item.tone}`}>{item.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.note}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <item.icon className={`w-5 h-5 ${item.tone}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <CardTitle className="text-lg">Gelir / Gider Karşılaştırması</CardTitle>
          <CardDescription>Yeni şirketiniz için henüz finansal veri girilmedi.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 h-[320px]">
          {CHART_DATA.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="ay" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="gelir" name="Gelir" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gider" name="Gider" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center rounded-lg border border-dashed text-sm text-slate-500">
              Finansal veri eklendiğinde grafik burada görünecek.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <CardTitle className="text-lg">Son Aktiviteler</CardTitle>
          <CardDescription>Yeni şirketiniz için aktivite kaydı bulunmuyor.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {SON_TAHSILATLAR.length > 0 ? (
            SON_TAHSILATLAR.map(t => (
              <div key={t.aciklama} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-sm">{t.aciklama}</p>
                  <p className="text-xs text-slate-500">{t.tarih}</p>
                </div>
                <Badge variant="outline">{t.durum}</Badge>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">Henüz aktivite yok.</div>
          )}
        </CardContent>
      </Card>

      {!hasPremium && (
        <Card className="border-none shadow-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white overflow-hidden relative">
          <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shrink-0">
                <Rocket className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">AI Finansal Analiz özelliğine erişin</h3>
                <p className="text-white/80 mt-1">Finansal verilerinizi girdikten sonra yapay zeka ile analiz ettirin.</p>
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
