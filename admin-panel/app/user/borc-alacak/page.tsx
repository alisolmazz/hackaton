'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, AlertTriangle, Users, Wallet } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getOcrFinansalTaslak } from '@/lib/api';
import type { OcrFinansalTaslak } from '@/lib/api';
import { useTheme } from 'next-themes';

const fmt = (v: number) => new Intl.NumberFormat('tr-TR').format(v);

export default function BorcAlacakPage() {
  const [taslak, setTaslak] = useState<OcrFinansalTaslak | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const load = async () => setTaslak(await getOcrFinansalTaslak());
    load();
    window.addEventListener('ocr-finansal-data-changed', load);
    return () => window.removeEventListener('ocr-finansal-data-changed', load);
  }, []);

  const alacak = taslak?.bekleyen_tahsilatlar || [];
  const borclar = taslak?.projeler?.filter(p => p.tutar > 0) || []; // mock data from projeler for now if no borc exists

  const toplamAlacak = alacak.reduce((s, a) => s + Number(a.tutar || 0), 0) + 125000; // adding some mock money for visualization
  const toplamBorc = borclar.reduce((s, b) => s + Number(b.tutar || 0), 0) + 45000;
  
  const netCari = toplamAlacak - toplamBorc;

  const chartData = [
    { name: 'Alacaklar', value: toplamAlacak, color: '#10b981' },
    { name: 'Borçlar', value: toplamBorc, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cari Hesaplar</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Borç ve Alacak Yönetimi</p>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                <p className="text-slate-400 dark:text-slate-500 text-sm">{alacak.length > 0 ? 'Güncel Veriler' : 'Bekleniyor'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg shadow-emerald-500/5 rounded-[24px] overflow-hidden group">
            <div className="h-1.5 w-full bg-emerald-500"></div>
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <ArrowDownRight className="w-6 h-6" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-none shadow-none font-bold uppercase tracking-wider">Tahsilatlar</Badge>
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Toplam Alacak (Müşteriler)</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">₺{fmt(toplamAlacak)}</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg shadow-rose-500/5 rounded-[24px] overflow-hidden group">
            <div className="h-1.5 w-full bg-rose-500"></div>
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border-none shadow-none font-bold uppercase tracking-wider">Ödemeler</Badge>
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Toplam Borç (Tedarikçiler)</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">₺{fmt(toplamBorc)}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[24px]">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 px-6 pt-6">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-400" /> Cari Dağılım
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[260px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(v) => `₺${fmt(Number(v))}`}
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Cari</span>
              <span className={`text-xl font-black ${netCari >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {netCari > 0 ? '+' : ''}₺{fmt(Math.abs(netCari))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg rounded-[24px] overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-emerald-50/30 dark:bg-emerald-500/5 px-6 py-5">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <span className="flex items-center gap-2"><ArrowDownRight className="w-5 h-5 text-emerald-500" /> Bekleyen Alacaklar</span>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-none border-none hover:bg-emerald-200">Tahsilat</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {alacak.length > 0 ? (
              <Table>
                <TableHeader className="bg-transparent">
                  <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
                    <TableHead className="pl-6 font-bold text-slate-500 uppercase text-xs tracking-wider">Firma / Açıklama</TableHead>
                    <TableHead className="font-bold text-slate-500 uppercase text-xs tracking-wider">Vade</TableHead>
                    <TableHead className="pr-6 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alacak.map((a, i) => (
                    <TableRow key={i} className="border-slate-100 dark:border-white/5 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-colors">
                      <TableCell className="pl-6">
                        <p className="font-bold text-slate-900 dark:text-white">{a.aciklama}</p>
                        {Number(a.gecikme) > 0 && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> {a.gecikme} Gün Gecikti
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 font-medium">{a.vade}</TableCell>
                      <TableCell className="pr-6 font-black text-right text-emerald-600 dark:text-emerald-400">₺{fmt(a.tutar)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
                    <TableCell className="pl-6">
                      <p className="font-bold text-slate-900 dark:text-white">TechNova Yazılım (Örnek)</p>
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium">15 Tem 2024</TableCell>
                    <TableCell className="pr-6 font-black text-right text-emerald-600 dark:text-emerald-400">₺125.000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="font-medium">Bekleyen alacak bulunmuyor.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-lg rounded-[24px] overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-rose-50/30 dark:bg-rose-500/5 px-6 py-5">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <span className="flex items-center gap-2"><ArrowUpRight className="w-5 h-5 text-rose-500" /> Yaklaşan Ödemeler</span>
              <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 shadow-none border-none hover:bg-rose-200">Borç</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow className="border-slate-100 dark:border-white/5 hover:bg-transparent">
                  <TableHead className="pl-6 font-bold text-slate-500 uppercase text-xs tracking-wider">Tedarikçi / Gider</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-xs tracking-wider">Son Ödeme</TableHead>
                  <TableHead className="pr-6 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borclar.length > 0 && borclar.map((b, i) => (
                  <TableRow key={i} className="border-slate-100 dark:border-white/5 hover:bg-rose-50/50 dark:hover:bg-rose-500/5 transition-colors">
                    <TableCell className="pl-6 font-bold text-slate-900 dark:text-white">{b.ad}</TableCell>
                    <TableCell className="text-slate-500 font-medium">{b.bitis || 'Belirsiz'}</TableCell>
                    <TableCell className="pr-6 font-black text-right text-rose-500 dark:text-rose-400">₺{fmt(b.tutar)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-slate-100 dark:border-white/5 hover:bg-rose-50/50 dark:hover:bg-rose-500/5 transition-colors">
                  <TableCell className="pl-6 font-bold text-slate-900 dark:text-white">Ağustos Kira (Örnek)</TableCell>
                  <TableCell className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-xs">Bugün</span>
                  </TableCell>
                  <TableCell className="pr-6 font-black text-right text-rose-500 dark:text-rose-400">₺45.000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
