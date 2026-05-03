'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, Building2, CheckCircle2, Crown, FileBarChart, Rocket, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { OnayBekleniyor } from '@/components/user/OnayBekleniyor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOcrFinansalTaslak, getPremiumHesapDurumu } from '@/lib/api';
import type { OcrFinansalTaslak } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/types';

const fmt = (v: number) => new Intl.NumberFormat('tr-TR').format(v);

const HIZLI_ERISIM = [
  { label: 'Finansal Raporumu Görüntüle', href: '/user/finansal-rapor', icon: FileBarChart, bg: 'from-teal-50 to-emerald-100/50 dark:from-teal-500/10 dark:to-emerald-500/5', border: 'border-teal-200/50 dark:border-teal-500/20 hover:border-teal-400 dark:hover:border-teal-400/50', iconRenk: 'text-teal-600 dark:text-teal-400' },
  { label: 'Nakit Akışımı İncele', href: '/user/nakit-akis', icon: TrendingUp, bg: 'from-blue-50 to-indigo-100/50 dark:from-blue-500/10 dark:to-indigo-500/5', border: 'border-blue-200/50 dark:border-blue-500/20 hover:border-blue-400 dark:hover:border-blue-400/50', iconRenk: 'text-blue-600 dark:text-blue-400' },
  { label: 'Firma Bilgilerimi Güncelle', href: '/user/firma-bilgileri', icon: Building2, bg: 'from-purple-50 to-fuchsia-100/50 dark:from-purple-500/10 dark:to-fuchsia-500/5', border: 'border-purple-200/50 dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-400/50', iconRenk: 'text-purple-600 dark:text-purple-400' },
];

export default function UserDashboard() {
  const [firmaOnaylandi] = useState(true);
  const [hasPremium, setHasPremium] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [taslak, setTaslak] = useState<OcrFinansalTaslak | null>(null);

  useEffect(() => {
    const loadState = async () => {
      const durum = await getPremiumHesapDurumu();
      setHasPremium(durum.hasPremium);
      setUser(await getCurrentUser());
      setTaslak(await getOcrFinansalTaslak());
    };
    loadState();
    window.addEventListener('premium-data-changed', loadState);
    window.addEventListener('ocr-finansal-data-changed', loadState);
    return () => {
      window.removeEventListener('premium-data-changed', loadState);
      window.removeEventListener('ocr-finansal-data-changed', loadState);
    };
  }, []);

  if (!firmaOnaylandi) return <OnayBekleniyor />;

  const toplamAlacak = (taslak?.bekleyen_tahsilatlar || []).reduce((s, t) => s + Number(t.tutar || 0), 0);
  const buAyTahsilat = (taslak?.yapilan_tahsilatlar || []).reduce((s, t) => s + Number(t.tutar || 0), 0);
  const aktifProje = (taslak?.projeler || []).filter(p => (p.durum || '').toLowerCase() !== 'bitti' && (p.durum || '').toLowerCase() !== 'tamamlandi').length;

  const chart = (taslak?.donemsel_karsilastirma || []).map(d => ({
    ay: d.d, gelir: Number(d.gelir || 0), gider: Number(d.gider || 0),
  }));

  const sonTahsilatlar = [
    ...(taslak?.yapilan_tahsilatlar || []).map(t => ({ tarih: t.tarih, aciklama: t.aciklama, tutar: Number(t.tutar || 0), durum: 'Ödendi' })),
    ...(taslak?.bekleyen_tahsilatlar || []).map(t => ({ tarih: t.vade, aciklama: t.aciklama, tutar: Number(t.tutar || 0), durum: Number(t.gecikme || 0) > 0 ? 'Gecikti' : 'Bekliyor' })),
  ].slice(0, 5);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      {/* 🌟 PREMIUM HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Genel Bakış</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            <span className="text-slate-700 dark:text-slate-300 font-bold">{taslak?.firma_adi || user?.firmaAdi || 'Yeni şirket'}</span> hesabınıza ait finansal özet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 rounded-xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#131b2e] text-slate-600 dark:text-slate-300 font-medium">
            Son Senkronizasyon: Bugün 09:41
          </Badge>
        </div>
      </div>

      {/* 🌟 STAT CARDS (SaaS Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Toplam Alacak', value: `₺${fmt(toplamAlacak)}`, note: toplamAlacak > 0 ? `${(taslak?.bekleyen_tahsilatlar || []).length} bekleyen tahsilat` : 'Bekleyen tahsilat yok', icon: TrendingDown, tone: 'text-rose-600 dark:text-rose-400', bgIcon: 'bg-rose-100 dark:bg-rose-500/20' },
          { title: 'Bu Ay Tahsilat', value: `₺${fmt(buAyTahsilat)}`, note: buAyTahsilat > 0 ? `${(taslak?.yapilan_tahsilatlar || []).length} ödeme yapıldı` : 'Henüz ödeme yok', icon: CheckCircle2, tone: 'text-emerald-600 dark:text-emerald-400', bgIcon: 'bg-emerald-100 dark:bg-emerald-500/20' },
          { title: 'Aktif Proje', value: String(aktifProje), note: aktifProje > 0 ? `${aktifProje} proje devam ediyor` : 'Aktif proje yok', icon: Briefcase, tone: 'text-indigo-600 dark:text-indigo-400', bgIcon: 'bg-indigo-100 dark:bg-indigo-500/20' },
          { title: 'Hesap Tipi', value: hasPremium ? 'Premium' : 'Temel', note: hasPremium ? 'Tüm özellikler açık' : 'Yükseltme yapılabilir', icon: Crown, tone: 'text-amber-500 dark:text-amber-400', bgIcon: 'bg-amber-100 dark:bg-amber-500/20' },
        ].map(item => (
          <Card key={item.title} className="rounded-2xl border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.title}</p>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{item.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bgIcon}`}>
                  <item.icon className={`w-6 h-6 ${item.tone}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${item.tone.replace('text-', 'bg-').split(' ')[0]}`} />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.note}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🌟 QUICK ACCESS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HIZLI_ERISIM.map(item => (
          <Link key={item.href} href={item.href}>
            <div className={`cursor-pointer rounded-2xl border ${item.border} bg-gradient-to-br ${item.bg} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group p-6 flex items-center gap-5 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 dark:bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150"></div>
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0f1c]/50 flex items-center justify-center shadow-sm shrink-0 border border-white/50 dark:border-white/10 z-10">
                <item.icon className={`w-7 h-7 ${item.iconRenk}`} />
              </div>
              <div className="flex-1 min-w-0 z-10">
                <p className="font-bold text-base text-slate-900 dark:text-white leading-tight">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">İlgili modüle git</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors shrink-0 z-10" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🌟 CHART SECTION */}
        <Card className="lg:col-span-2 rounded-2xl border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.02)]">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-5">
            <CardTitle className="text-lg font-bold">Gelir / Gider Karşılaştırması</CardTitle>
            <CardDescription className="font-medium text-slate-500">{chart.length > 0 ? `${taslak?.donem || '2024'} dönemsel verileri` : 'Henüz finansal veri girilmedi.'}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[380px]">
            {chart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} barGap={8} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-5 text-slate-500" />
                  <XAxis dataKey="ay" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} tickFormatter={v => `₺${(Number(v)/1e6).toFixed(1)}M`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', fontWeight: 600, color: '#0f172a' }}
                    itemStyle={{ fontWeight: 700 }}
                    formatter={(v) => `₺${fmt(Number(v))}`} 
                  />
                  <Bar dataKey="gelir" name="Gelir" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="gider" name="Gider" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-white/5 text-sm font-medium text-slate-500">Finansal veri eklendiğinde grafik burada görünecek.</div>
            )}
          </CardContent>
        </Card>

        {/* 🌟 RECENT ACTIVITIES */}
        <Card className="rounded-2xl border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.02)]">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 px-6 py-5">
            <CardTitle className="text-lg font-bold">Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {sonTahsilatlar.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {sonTahsilatlar.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div className="min-w-0 pr-4">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{t.aciklama}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{t.tarih} — <span className="text-slate-700 dark:text-slate-300">₺{fmt(t.tutar)}</span></p>
                    </div>
                    <Badge variant="outline" className={`px-2.5 py-1 rounded-lg font-bold shrink-0 ${
                      t.durum === 'Ödendi' ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                      t.durum === 'Gecikti' ? 'border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' : 
                      'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                    }`}>
                      {t.durum}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm font-medium text-slate-500">Henüz aktivite yok.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🌟 PREMIUM UPSELL BANNER */}
      {!hasPremium && (
        <div className="rounded-3xl border border-white/20 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-[1px] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[100px] -mr-[100px] -mt-[100px] pointer-events-none mix-blend-screen transition-transform duration-1000 group-hover:scale-110"></div>
          
          <div className="rounded-[23px] bg-gradient-to-r from-slate-900/40 to-slate-900/10 backdrop-blur-sm p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0 shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:rotate-12 transition-transform duration-500">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">AI Analiz ile Tanışın</h3>
                <p className="text-white/80 mt-2 font-medium max-w-xl text-sm md:text-base">Finansal verileriniz bizimle güvende. Pro Sicht yapay zekası, tablolarınızı analiz eder ve size şirketinizin geleceği hakkında güçlü içgörüler sunar.</p>
              </div>
            </div>
            <Button className="rounded-xl bg-white text-indigo-600 hover:bg-slate-50 font-extrabold px-8 h-14 text-base shadow-[0_0_40px_rgba(255,255,255,0.3)] shrink-0 transition-transform hover:scale-105 active:scale-95 border-0">
              <Crown className="w-5 h-5 mr-2 text-amber-500" /> Premium'u Keşfet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
