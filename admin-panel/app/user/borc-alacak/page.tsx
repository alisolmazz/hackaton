'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getOcrFinansalTaslak } from '@/lib/api';
import type { OcrFinansalTaslak } from '@/lib/api';

const fmt = (v: number) => new Intl.NumberFormat('tr-TR').format(v);

export default function BorcAlacakPage() {
  const [taslak, setTaslak] = useState<OcrFinansalTaslak | null>(null);
  const [alacakFiltre, setAlacakFiltre] = useState('tumu');

  useEffect(() => {
    const load = async () => setTaslak(await getOcrFinansalTaslak());
    load();
    window.addEventListener('ocr-finansal-data-changed', load);
    return () => window.removeEventListener('ocr-finansal-data-changed', load);
  }, []);

  // Alacaklar = bekleyen tahsilatlar
  const ALACAKLAR = (taslak?.bekleyen_tahsilatlar || []).map(t => ({
    aciklama: t.aciklama,
    borclu: t.aciklama.split('—')[0]?.trim() || t.aciklama,
    tutar: Number(t.tutar || 0),
    vade: t.vade,
    durum: Number(t.gecikme || 0) > 0 ? 'Gecikti' : 'Bekliyor',
    gecikme: Number(t.gecikme || 0),
  }));

  // Borçlar = toplam_borc'tan türetilmiş placeholder
  const toplamBorc = Number(taslak?.toplam_borc || 0);
  const BORCLAR = toplamBorc > 0 ? [
    { aciklama: 'Kısa Vadeli Yabancı Kaynaklar', alacakli: 'Banka/Tedarikçi', tutar: Math.round(toplamBorc * 0.6), vade: '2024-12-31', durum: 'Bekliyor' },
    { aciklama: 'Uzun Vadeli Yabancı Kaynaklar', alacakli: 'Banka', tutar: Math.round(toplamBorc * 0.4), vade: '2025-12-31', durum: 'Bekliyor' },
  ] : [];

  const topBorc = BORCLAR.reduce((s, b) => s + b.tutar, 0);
  const topAlacak = ALACAKLAR.reduce((s, a) => s + a.tutar, 0);
  const netPoz = topAlacak - topBorc;
  const vadesiYaklasan = ALACAKLAR.filter(a => a.gecikme > 0).length;

  const filteredAlacak = ALACAKLAR.filter(a => alacakFiltre === 'tumu' || a.durum === alacakFiltre);

  // Pie chart
  const PIE_DATA = topAlacak > 0 || topBorc > 0 ? [
    { name: 'Alacaklar', value: topAlacak, fill: '#10b981' },
    { name: 'Borçlar', value: topBorc, fill: '#ef4444' },
  ].filter(d => d.value > 0) : [];

  // Vade dağılımı
  const VADE_DATA: { aralik: string; alacak: number; borc: number }[] = [];
  if (ALACAKLAR.length > 0 || BORCLAR.length > 0) {
    const gecikmisToplam = ALACAKLAR.filter(a => a.gecikme > 0).reduce((s, a) => s + a.tutar, 0);
    const bekleyenToplam = ALACAKLAR.filter(a => a.gecikme === 0).reduce((s, a) => s + a.tutar, 0);
    if (gecikmisToplam > 0) VADE_DATA.push({ aralik: 'Gecikmiş', alacak: gecikmisToplam, borc: 0 });
    if (bekleyenToplam > 0) VADE_DATA.push({ aralik: '0-30 Gün', alacak: bekleyenToplam, borc: Math.round(topBorc * 0.3) });
    if (topBorc > 0) VADE_DATA.push({ aralik: '30-90 Gün', alacak: 0, borc: Math.round(topBorc * 0.4) });
    if (topBorc > 0) VADE_DATA.push({ aralik: '90+ Gün', alacak: 0, borc: Math.round(topBorc * 0.3) });
  }

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Borç / Alacak Özetim</h1>
        <p className="text-slate-500 mt-1">
          {topAlacak > 0 || topBorc > 0 ? `${taslak?.firma_adi || 'Firma'} borç/alacak durumu` : 'Henüz borç veya alacak verisi girilmedi.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-sm border-l-4 border-l-emerald-500"><CardContent className="p-5">
          <p className="text-sm text-slate-500 font-medium">Toplam Alacak</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₺{fmt(topAlacak)}</p>
        </CardContent></Card>
        <Card className="shadow-sm border-l-4 border-l-red-400"><CardContent className="p-5">
          <p className="text-sm text-slate-500 font-medium">Toplam Borç</p>
          <p className="text-2xl font-bold text-red-500 mt-1">₺{fmt(topBorc)}</p>
        </CardContent></Card>
        <Card className={`shadow-sm border-l-4 ${netPoz >= 0 ? 'border-l-emerald-500' : 'border-l-red-400'}`}><CardContent className="p-5">
          <p className="text-sm text-slate-500 font-medium">Net Pozisyon</p>
          <p className={`text-2xl font-bold mt-1 ${netPoz >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>₺{fmt(netPoz)}</p>
        </CardContent></Card>
        <Card className="shadow-sm border-l-4 border-l-amber-500"><CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-slate-500 font-medium">Vadesi Geçmiş</p><p className="text-2xl font-bold text-amber-600 mt-1">{vadesiYaklasan}</p></div>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Dağılım</CardTitle></CardHeader>
          <CardContent className="pt-6 h-[300px] flex items-center justify-center">
            {PIE_DATA.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {PIE_DATA.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₺${fmt(Number(v))}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-lg border border-dashed text-sm text-slate-500">Borç/alacak verisi girildiğinde dağılım burada görünecek.</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Vade Dağılımı</CardTitle></CardHeader>
          <CardContent className="pt-6 h-[300px]">
            {VADE_DATA.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VADE_DATA} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="aralik" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={v => `₺${(Number(v)/1e3).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => `₺${fmt(Number(v))}`} contentStyle={{ borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="alacak" name="Alacak" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="borc" name="Borç" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg border border-dashed text-sm text-slate-500">Vade verisi girildiğinde grafik burada görünecek.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-lg flex items-center gap-2">Borçlarım <Badge variant="destructive" className="ml-2">₺{fmt(topBorc)}</Badge></CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50"><TableRow><TableHead className="pl-6">Açıklama</TableHead><TableHead>Alacaklı</TableHead><TableHead>Tutar</TableHead><TableHead>Vade</TableHead><TableHead className="pr-6">Durum</TableHead></TableRow></TableHeader>
            <TableBody>
              {BORCLAR.length > 0 ? BORCLAR.map(b => (
                <TableRow key={b.aciklama}>
                  <TableCell className="pl-6">{b.aciklama}</TableCell><TableCell>{b.alacakli}</TableCell><TableCell className="text-red-500 font-semibold">₺{fmt(b.tutar)}</TableCell><TableCell>{b.vade}</TableCell>
                  <TableCell className="pr-6"><Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">{b.durum}</Badge></TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">Henüz borç kaydı yok.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">Alacaklarım <Badge className="bg-emerald-100 text-emerald-800 border-none ml-2">₺{fmt(topAlacak)}</Badge></CardTitle>
          <Select value={alacakFiltre} onValueChange={(val) => val && setAlacakFiltre(val)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="tumu">Tümü</SelectItem><SelectItem value="Bekliyor">Bekleyen</SelectItem><SelectItem value="Gecikti">Gecikmiş</SelectItem></SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50"><TableRow><TableHead className="pl-6">Açıklama</TableHead><TableHead>Borçlu</TableHead><TableHead>Tutar</TableHead><TableHead>Vade</TableHead><TableHead className="pr-6">Durum</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredAlacak.length > 0 ? filteredAlacak.map(a => (
                <TableRow key={a.aciklama + a.vade}>
                  <TableCell className="pl-6">{a.aciklama}</TableCell><TableCell>{a.borclu}</TableCell><TableCell className="text-emerald-600 font-semibold">₺{fmt(a.tutar)}</TableCell><TableCell>{a.vade}</TableCell>
                  <TableCell className="pr-6"><Badge variant="outline" className={a.durum === 'Gecikti' ? 'border-red-200 text-red-700 bg-red-50' : 'border-amber-200 text-amber-700 bg-amber-50'}>{a.durum === 'Gecikti' ? `${a.gecikme} gün gecikti` : a.durum}</Badge></TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">Henüz alacak kaydı yok.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
