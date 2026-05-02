'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const fmt = (v: number) => new Intl.NumberFormat('tr-TR').format(v);

const PIE_DATA: { name: string; value: number; fill: string }[] = [];
const VADE_DATA: { aralik: string; alacak: number; borc: number }[] = [];
const BORCLAR: { aciklama: string; alacakli: string; tutar: number; vade: string; durum: string }[] = [];
const ALACAKLAR: { aciklama: string; borclu: string; tutar: number; vade: string; durum: string }[] = [];

export default function BorcAlacakPage() {
  const [alacakFiltre, setAlacakFiltre] = useState('tumu');
  const topBorc = BORCLAR.reduce((s, b) => s + b.tutar, 0);
  const topAlacak = ALACAKLAR.reduce((s, a) => s + a.tutar, 0);
  const netPoz = topAlacak - topBorc;
  const vadesiYaklasan = 0;
  const filteredAlacak = ALACAKLAR.filter(a => alacakFiltre === 'tumu' || a.durum === alacakFiltre);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Borç / Alacak Özetim</h1>
        <p className="text-slate-500 mt-1">Bu şirket için henüz borç veya alacak verisi girilmedi.</p>
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
        <Card className="shadow-sm border-l-4 border-l-emerald-500"><CardContent className="p-5">
          <p className="text-sm text-slate-500 font-medium">Net Pozisyon</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">₺{fmt(netPoz)}</p>
        </CardContent></Card>
        <Card className="shadow-sm border-l-4 border-l-amber-500"><CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-slate-500 font-medium">Vadesi Yaklaşan</p><p className="text-2xl font-bold text-amber-600 mt-1">{vadesiYaklasan}</p></div>
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
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
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
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
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
            <TableBody><TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">Henüz borç kaydı yok.</TableCell></TableRow></TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">Alacaklarım <Badge className="bg-emerald-100 text-emerald-800 border-none ml-2">₺{fmt(topAlacak)}</Badge></CardTitle>
          <Select value={alacakFiltre} onValueChange={(val) => val && setAlacakFiltre(val)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="tumu">Tümü</SelectItem><SelectItem value="Bekliyor">Bekleyen</SelectItem><SelectItem value="Gecikti">Gecikmiş</SelectItem><SelectItem value="Tamamlandı">Tamamlanan</SelectItem></SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50"><TableRow><TableHead className="pl-6">Açıklama</TableHead><TableHead>Borçlu</TableHead><TableHead>Tutar</TableHead><TableHead>Vade</TableHead><TableHead className="pr-6">Durum</TableHead></TableRow></TableHeader>
            <TableBody>{filteredAlacak.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">Henüz alacak kaydı yok.</TableCell></TableRow>}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Yaşlandırma Analizi</CardTitle><CardDescription>Vade aralıklarına göre borç/alacak dağılımı</CardDescription></CardHeader>
        <CardContent className="p-6">
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">Yaşlandırma analizi için henüz vade verisi yok.</div>
        </CardContent>
      </Card>
    </div>
  );
}
