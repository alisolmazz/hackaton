'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Download, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getOcrFinansalTaslak } from '@/lib/api';
import type { OcrFinansalTaslak } from '@/lib/api';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';

const fmt = (v: number) => new Intl.NumberFormat('tr-TR').format(v);

export default function NakitAkisPage() {
  const [taslak, setTaslak] = useState<OcrFinansalTaslak | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const load = async () => setTaslak(await getOcrFinansalTaslak());
    load();
    window.addEventListener('ocr-finansal-data-changed', load);
    return () => window.removeEventListener('ocr-finansal-data-changed', load);
  }, []);

  const DATA = (taslak?.donemsel_karsilastirma || []).map(d => ({
    ay: d.d,
    giris: Number(d.gelir || 0),
    cikis: Number(d.gider || 0),
    net: Number(d.gelir || 0) - Number(d.gider || 0),
  }));

  const topGiris = DATA.reduce((s, d) => s + d.giris, 0);
  const topCikis = DATA.reduce((s, d) => s + d.cikis, 0);
  const netPoz = topGiris - topCikis;

  let kumulatif = 0;
  const tableData = DATA.map(d => {
    kumulatif += d.net;
    return { ...d, kumulatif };
  });

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Nakit Akış Yönetimi</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Finansal Sağlık Analizi</p>
                {DATA.length > 0 && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    <div className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      Senkronize
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="buyil">
            <SelectTrigger className="w-[140px] h-10 bg-white/80 dark:bg-[#131b2e]/80 border-slate-200 dark:border-white/10 rounded-xl font-medium focus:ring-emerald-500 backdrop-blur-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-white/10 shadow-xl">
              <SelectItem value="buyil" className="rounded-lg font-medium">Bu Yıl</SelectItem>
              <SelectItem value="gecenyil" className="rounded-lg font-medium">Geçen Yıl</SelectItem>
              <SelectItem value="son6" className="rounded-lg font-medium">Son 6 Ay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-10 rounded-xl border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#131b2e]/80 hover:bg-slate-50 dark:hover:bg-white/5 font-bold shadow-sm backdrop-blur-xl" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> Dışa Aktar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg shadow-emerald-500/5 rounded-[24px] overflow-hidden group">
          <div className="h-1.5 w-full bg-emerald-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Toplam Nakit Giriş</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">₺{fmt(topGiris)}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 text-emerald-600 dark:text-emerald-400">
                <ArrowDownToLine className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-none px-2 py-0.5 shadow-none text-xs font-bold">+12%</Badge>
              <span className="text-xs text-slate-400 font-medium">Geçen döneme göre</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg shadow-rose-500/5 rounded-[24px] overflow-hidden group">
          <div className="h-1.5 w-full bg-rose-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Toplam Nakit Çıkış</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">₺{fmt(topCikis)}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 text-rose-600 dark:text-rose-400">
                <ArrowUpFromLine className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-none px-2 py-0.5 shadow-none text-xs font-bold">-4%</Badge>
              <span className="text-xs text-slate-400 font-medium">Geçen döneme göre</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg shadow-indigo-500/5 rounded-[24px] overflow-hidden group relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className={`h-1.5 w-full ${netPoz >= 0 ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Nakit Pozisyonu</p>
                <p className={`text-3xl font-black tracking-tight mt-2 ${netPoz >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {netPoz >= 0 ? '+' : ''}₺{fmt(netPoz)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${netPoz >= 0 ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500'} flex items-center justify-center group-hover:scale-110 group-hover:text-white transition-all duration-300`}>
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className={`${netPoz >= 0 ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'} border-none px-2 py-0.5 shadow-none text-xs font-bold`}>
                Durum: {netPoz >= 0 ? 'Pozitif' : 'Kritik'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[24px]">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-5 px-6 pt-6">
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            Aylık Nakit Akış Grafiği
            {DATA.length > 0 && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 h-[400px] px-2 sm:px-6">
          {DATA.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGiris" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCikis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="ay" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 600 }} tickFormatter={v => `₺${(Number(v)/1e3).toFixed(0)}K`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderRadius: '16px', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  formatter={(v) => `₺${fmt(Number(v))}`} 
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                <Area type="monotone" dataKey="giris" name="Nakit Giriş" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGiris)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                <Area type="monotone" dataKey="cikis" name="Nakit Çıkış" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorCikis)" activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-white/10 flex items-center justify-center mb-4 shadow-sm">
                <TrendingDown className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white">Veri Bulunamadı</p>
              <p className="text-sm text-slate-500 mt-1">Nakit girişi ve çıkışı girildiğinde grafik burada görünecek.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[24px] overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 pb-4 px-6 pt-5">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            Aylık Finansal Döküm
            <Badge className="ml-2 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-none shadow-none">{DATA.length} Ay</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-transparent">
              <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
                <TableHead className="pl-6 font-bold text-slate-500 uppercase text-[11px] tracking-widest h-12">Dönem (Ay)</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[11px] tracking-widest">Nakit Girişi</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[11px] tracking-widest">Nakit Çıkışı</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[11px] tracking-widest">Net Durum</TableHead>
                <TableHead className="pr-6 font-bold text-slate-500 uppercase text-[11px] tracking-widest text-right">Kümülatif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length > 0 ? tableData.map(d => (
                <TableRow key={d.ay} className="border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors h-14 group">
                  <TableCell className="pl-6 font-extrabold text-slate-900 dark:text-white">{d.ay}</TableCell>
                  <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">₺{fmt(d.giris)}</TableCell>
                  <TableCell className="font-bold text-rose-500 dark:text-rose-400">₺{fmt(d.cikis)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`shadow-none font-bold px-3 py-1 ${d.net >= 0 ? 'border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400' : 'border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'}`}>
                      {d.net >= 0 ? '+' : ''}₺{fmt(d.net)}
                    </Badge>
                  </TableCell>
                  <TableCell className={`pr-6 font-black text-right ${d.kumulatif >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    ₺{fmt(d.kumulatif)}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    Henüz nakit akışı verisi yok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
