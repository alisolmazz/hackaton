'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Building2, CheckCircle2, Eye, EyeOff, Loader2, Send, Sparkles, Activity } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { toast } from 'sonner';

import { KisitliAlan } from '@/components/user/KisitliAlan';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePremiumModal } from '@/context/PremiumModalContext';
import {
  generateUserFinansalAIAnaliz,
  getKayitliAIAnaliz,
  getOcrFinansalTaslak,
  getPremiumHesapDurumu,
  getUzmanAnalizTalebim,
  uzmanAnalizTalepEt,
} from '@/lib/api';
import type { OcrFinansalTaslak } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/types';
import type { UzmanAnalizTalebi } from '@/types';
import { useTheme } from 'next-themes';

const CHART: { d: string; gelir: number; gider: number }[] = [];

const BEKLEYEN: { aciklama: string; vade: string; tutar: number; gecikme: number }[] = [];

const YAPILAN: { aciklama: string; tarih: string; tutar: number }[] = [];

const PROJELER: { ad: string; baslangic: string; bitis: string | null; tutar: number; durum: string }[] = [];

export default function UserFinansalRaporPage() {
  const [hesapGoster, setHesapGoster] = useState<Record<number, boolean>>({});
  const [hasPremium, setHasPremium] = useState(false);
  const [aiAnaliz, setAiAnaliz] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [uzmanTalep, setUzmanTalep] = useState<UzmanAnalizTalebi | null>(null);
  const [uzmanLoading, setUzmanLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [ocrTaslak, setOcrTaslak] = useState<OcrFinansalTaslak | null>(null);
  const { openModal } = usePremiumModal();
  const { theme } = useTheme();

  const chart = ocrTaslak?.donemsel_karsilastirma?.length
    ? ocrTaslak.donemsel_karsilastirma
    : ocrTaslak && (ocrTaslak.toplam_gelir || ocrTaslak.toplam_gider)
      ? [{ d: ocrTaslak.donem || 'Belge', gelir: Number(ocrTaslak.toplam_gelir || 0), gider: Number(ocrTaslak.toplam_gider || 0) }]
      : CHART;
  const bankalar = (ocrTaslak?.bankalar || []).map((b, index) => ({
    ad: b.ad || `Banka ${index + 1}`,
    bakiye: Number(b.bakiye || 0),
    limit: Number(b.limit || 0),
    kullanim: Number(b.kullanim || 0),
    hesap: b.hesap || 'Hesap bilgisi yok',
    renk: ['bg-teal-500 shadow-teal-500/20', 'bg-indigo-500 shadow-indigo-500/20', 'bg-amber-500 shadow-amber-500/20'][index % 3],
    barColor: ['bg-teal-500', 'bg-indigo-500', 'bg-amber-500'][index % 3],
  }));
  const bekleyenTahsilatlar = ocrTaslak?.bekleyen_tahsilatlar || BEKLEYEN;
  const yapilanTahsilatlar = ocrTaslak?.yapilan_tahsilatlar || YAPILAN;
  const projeler = ocrTaslak?.projeler || PROJELER;
  const gelir = Number(ocrTaslak?.toplam_gelir || 0);
  const gider = Number(ocrTaslak?.toplam_gider || 0);
  const netKar = gelir - gider;
  const toplamVarlik = Number(ocrTaslak?.toplam_varlik || 0);
  const toplamBakiye = bankalar.reduce((s, b) => s + b.bakiye, 0);
  const hasFinansalData = Boolean(ocrTaslak);

  const finansalVeriler = {
    firma: ocrTaslak?.firma_adi || user?.firmaAdi || 'Yeni şirket',
    donem: ocrTaslak?.donem || '2024 - Yillik',
    gelir,
    gider,
    netKar,
    toplamVarlik,
    toplamBorc: Number(ocrTaslak?.toplam_borc || 0),
    ozkaynak: Number(ocrTaslak?.ozkaynak || 0),
    nakitVeBenzeri: Number(ocrTaslak?.nakit_ve_benzeri || 0),
    bankalar,
    bekleyenTahsilatlar,
    yapilanTahsilatlar,
    projeler,
    donemselKarsilastirma: chart,
  };

  useEffect(() => {
    const loadState = async () => {
      const durum = await getPremiumHesapDurumu();
      setHasPremium(durum.hasPremium);
      setAiAnaliz(await getKayitliAIAnaliz());
      setUzmanTalep(await getUzmanAnalizTalebim());
      setUser(await getCurrentUser());
      setOcrTaslak(await getOcrFinansalTaslak());
    };

    loadState();
    window.addEventListener('premium-data-changed', loadState);
    window.addEventListener('ocr-finansal-data-changed', loadState);
    return () => {
      window.removeEventListener('premium-data-changed', loadState);
      window.removeEventListener('ocr-finansal-data-changed', loadState);
    };
  }, []);

  const handleAIAnaliz = async () => {
    setAiLoading(true);
    try {
      const response = await generateUserFinansalAIAnaliz(finansalVeriler);
      setAiAnaliz(response.data.analiz);
      toast.success('AI finansal analiz olusturuldu.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI analiz olusturulamadi.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUzmanTalep = async () => {
    setUzmanLoading(true);
    try {
      const response = await uzmanAnalizTalepEt(finansalVeriler);
      setUzmanTalep(response.data);
      toast.success('Uzman analizi talebiniz admin paneline iletildi.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Uzman analizi talebi gonderilemedi.');
    } finally {
      setUzmanLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Finansal Raporum</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{ocrTaslak?.firma_adi || user?.firmaAdi || 'Yeni şirket'}</p>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                <p className="text-slate-400 dark:text-slate-500 text-sm">{hasFinansalData ? 'Canlı Veriler' : 'Veri Bekleniyor'}</p>
              </div>
            </div>
          </div>
        </div>
        <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-500/20 px-3 py-1 shadow-none text-xs font-bold rounded-lg uppercase tracking-wider">
          2024 - Yıllık
        </Badge>
      </div>

      <Tabs defaultValue="mali" className="w-full space-y-8">
        <TabsList className="bg-white/50 dark:bg-[#0a0f1c]/50 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-1.5 w-full max-w-4xl h-auto flex-wrap rounded-[18px] shadow-sm">
          <TabsTrigger value="mali" className="py-2.5 flex-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all font-semibold">Mali Veriler</TabsTrigger>
          <TabsTrigger value="banka" className="py-2.5 flex-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all font-semibold">Bankalarım</TabsTrigger>
          <TabsTrigger value="tahsilat" className="py-2.5 flex-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all font-semibold">Tahsilatlar</TabsTrigger>
          <TabsTrigger value="proje" className="py-2.5 flex-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all font-semibold">Projelerim</TabsTrigger>
          <TabsTrigger value="ai" className="py-2.5 flex-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all font-semibold flex items-center justify-center gap-1.5">
            {hasPremium ? <><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> AI Analiz</> : 'Kilitli AI'}
          </TabsTrigger>
          <TabsTrigger value="uzman" className="py-2.5 flex-1 text-xs sm:text-sm rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all font-semibold flex items-center justify-center gap-1.5">
            {hasPremium ? <><Building2 className="w-3.5 h-3.5 text-amber-500" /> Uzman</> : 'Kilitli Uzman'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mali" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Toplam Gelir', value: gelir, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', Icon: ArrowUpRight, shadow: 'shadow-emerald-500/5' },
              { label: 'Toplam Gider', value: gider, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', Icon: ArrowDownRight, shadow: 'shadow-rose-500/5' },
              { label: 'Net Kar', value: netKar, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/20', Icon: CheckCircle2, shadow: 'shadow-indigo-500/5' },
              { label: 'Toplam Varlık', value: toplamVarlik, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', Icon: Building2, shadow: 'shadow-blue-500/5' },
            ].map(({ label, value, color, bg, border, shadow, Icon }) => (
              <Card key={label} className={`border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg ${shadow} overflow-hidden group`}>
                <div className={`h-1.5 w-full ${bg} ${border} border-b`}></div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{String(label)}</p>
                      <p className={`text-3xl font-black mt-2 tracking-tight ${color}`}>₺{Number(value).toLocaleString('tr-TR')}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[24px]">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 px-6 pt-6">
              <CardTitle className="text-lg font-bold">Dönemsel Karşılaştırma</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 h-[380px] px-2 sm:px-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} tickFormatter={(v) => `₺${(Number(v) / 1e6).toFixed(1)}M`} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderRadius: '16px', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(v) => `₺${Number(v).toLocaleString('tr-TR')}`} 
                  />
                  <Bar dataKey="gelir" name="Gelir" fill="url(#gelirGradient)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="gider" name="Gider" fill="url(#giderGradient)" radius={[6, 6, 0, 0]} />
                  
                  <defs>
                    <linearGradient id="gelirGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="giderGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banka" className="space-y-6 animate-in fade-in-50 duration-500">
          <Card className="border-none bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-800 text-white shadow-xl shadow-teal-500/20 rounded-[24px]">
            <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-teal-100 font-bold uppercase tracking-wider text-sm mb-1">Toplam Banka Bakiyesi</p>
                <p className="text-4xl md:text-5xl font-black tracking-tight">₺{toplamBakiye.toLocaleString('tr-TR')}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </CardContent>
          </Card>
          
          {bankalar.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bankalar.map((b, i) => {
                const pct = b.limit > 0 ? Math.round((b.kullanim / b.limit) * 100) : 0;
                return (
                  <Card key={b.ad} className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg rounded-[20px] overflow-hidden">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${b.renk} flex items-center justify-center text-white font-extrabold text-lg shadow-lg`}>
                          {b.ad.substring(0, 2).toUpperCase()}
                        </div>
                        <h4 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">{b.ad}</h4>
                      </div>
                      
                      <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Kullanılabilir Bakiye</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">₺{b.bakiye.toLocaleString('tr-TR')}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>Limit Kullanımı</span>
                          <span>%{pct}</span>
                        </div>
                        <Progress value={pct} className={`h-2.5 ${b.barColor} bg-slate-100 dark:bg-white/5`} />
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 -mx-6 -mb-6 px-6 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-mono font-medium tracking-widest">
                          {hesapGoster[i] ? `TR12 3456 7890 ${b.hesap.slice(-4)}` : b.hesap}
                        </span>
                        <button onClick={() => setHesapGoster(p => ({ ...p, [i]: !p[i] }))} className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
                          {hesapGoster[i] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-none bg-white/50 dark:bg-[#131b2e]/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-[24px]">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-900 dark:text-white font-bold text-lg">Banka bilgisi bulunamadı</p>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Banka ekstresi veya mizan yükleyerek banka verilerinizi otomatik doldurabilirsiniz.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tahsilat" className="animate-in fade-in-50 duration-500">
          <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg rounded-[24px] overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-6 py-5">
              <CardTitle className="text-lg font-bold">Bekleyen ve Yapılan Tahsilatlar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bekleyenTahsilatlar.length > 0 || yapilanTahsilatlar.length > 0 ? (
                <Table>
                  <TableHeader className="bg-transparent">
                    <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
                      <TableHead className="pl-6 font-bold text-slate-500 uppercase text-xs tracking-wider">Açıklama</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-xs tracking-wider">Vade / Tarih</TableHead>
                      <TableHead className="font-bold text-slate-500 uppercase text-xs tracking-wider">Tutar</TableHead>
                      <TableHead className="pr-6 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bekleyenTahsilatlar.map(t => (
                      <TableRow key={t.aciklama} className="border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <TableCell className="pl-6 font-semibold text-slate-900 dark:text-white">{t.aciklama}</TableCell>
                        <TableCell className="text-slate-500 font-medium">{t.vade}</TableCell>
                        <TableCell className="font-bold text-amber-600 dark:text-amber-400">₺{t.tutar.toLocaleString('tr-TR')}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <Badge variant="outline" className={`shadow-none font-bold px-3 py-1 ${Number(t.gecikme || 0) > 0 ? 'border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' : 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'}`}>
                            {Number(t.gecikme || 0) > 0 ? (
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                {t.gecikme} gün gecikti
                              </span>
                            ) : 'Bekliyor'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {yapilanTahsilatlar.map(t => (
                      <TableRow key={t.aciklama} className="border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <TableCell className="pl-6 font-semibold text-slate-900 dark:text-white">{t.aciklama}</TableCell>
                        <TableCell className="text-slate-500 font-medium">{t.tarih}</TableCell>
                        <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">₺{t.tutar.toLocaleString('tr-TR')}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <Badge variant="outline" className="shadow-none font-bold px-3 py-1 border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center gap-1.5 w-max ml-auto">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ödendi
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-slate-500 font-medium">Belgede tahsilat bilgisi bulunamadı</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proje" className="animate-in fade-in-50 duration-500">
          {projeler.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projeler.map(p => (
                <Card key={p.ad} className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg rounded-[20px] overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">{p.ad}</h4>
                      <Badge variant="outline" className={`shadow-none font-bold px-3 py-1 ${p.durum === 'bitti' ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400'}`}>
                        {p.durum === 'bitti' ? 'Tamamlandı' : 'Devam Ediyor'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tarih Aralığı</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{p.baslangic} → {p.bitis || 'Devam ediyor'}</span>
                      </div>
                      
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Proje Tutarı</p>
                        <p className="font-black text-2xl text-slate-900 dark:text-white">₺{p.tutar.toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none bg-white/50 dark:bg-[#131b2e]/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-[24px]">
              <CardContent className="py-16 text-center">
                <p className="text-slate-500 font-medium">Belgede proje bilgisi bulunamadı</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai" className="animate-in fade-in-50 duration-500">
          {hasPremium ? (
            <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg rounded-[24px] overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  AI Finansal Analiz
                </CardTitle>
                <CardDescription className="font-medium mt-2">Girili mali verileriniz Gemini ile analiz edilir ve sonuç burada saklanır.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <Button onClick={handleAIAnaliz} disabled={aiLoading} className="h-12 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/20">
                  {aiLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Yapay Zeka Analiz Ediyor...</> : <><Sparkles className="w-5 h-5 mr-2" /> Yeni AI Analiz Oluştur</>}
                </Button>
                
                {aiAnaliz ? (
                  <div className="rounded-[20px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 md:p-8 whitespace-pre-line leading-relaxed text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium shadow-inner">
                    {aiAnaliz}
                  </div>
                ) : (
                  <div className="rounded-[20px] border border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-transparent p-12 text-center text-sm font-medium text-slate-500">
                    Henüz AI analizi oluşturulmadı.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <KisitliAlan ozellikAdi="AI Finansal Analiz" paketAdi="Temel Analiz" onPaketTikla={() => openModal('temel_analiz')} />
          )}
        </TabsContent>

        <TabsContent value="uzman" className="animate-in fade-in-50 duration-500">
          {hasPremium ? (
            <Card className="border border-white/10 dark:border-white/5 bg-white/5 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-amber-50/50 dark:bg-amber-500/5 px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  Uzman Görüşü
                </CardTitle>
                <CardDescription className="font-medium mt-2">Talep admin paneline düşer; uzman finansal verileri inceleyip profesyonel raporu size iletir.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {!uzmanTalep && (
                  <Button onClick={handleUzmanTalep} disabled={uzmanLoading} className="h-12 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-500/20">
                    {uzmanLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Talep Gönderiliyor...</> : <><Send className="w-5 h-5 mr-2" /> Uzman Analizi Talep Et</>}
                  </Button>
                )}
                
                {uzmanTalep?.durum === 'bekliyor' && (
                  <div className="rounded-[20px] border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-500/30 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 animate-ping"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-200">Uzman analizi bekleniyor</h4>
                      <p className="text-amber-700 dark:text-amber-400/80 mt-1 font-medium text-sm">Talebiniz uzman ekibimize iletildi. En kısa sürede finansal verileriniz incelenip raporunuz bu alana yüklenecektir.</p>
                    </div>
                  </div>
                )}
                
                {uzmanTalep?.durum === 'tamamlandi' && (
                  <div className="rounded-[20px] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-6 md:p-8 whitespace-pre-line leading-relaxed text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium shadow-inner overflow-hidden break-words" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                    {uzmanTalep.uzman_gorusu}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <KisitliAlan ozellikAdi="Uzman Görüşü" paketAdi="Uzman Görüşü veya Premium Bundle" onPaketTikla={() => openModal('uzman_gorusu')} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
