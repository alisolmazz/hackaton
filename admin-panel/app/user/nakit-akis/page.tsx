'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Download, Wallet } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getOcrFinansalTaslak } from '@/lib/api';
import type { OcrFinansalTaslak } from '@/lib/api';

const fmt = (v: number) => new Intl.NumberFormat('tr-TR').format(v);

export default function NakitAkisPage() {
  const [taslak, setTaslak] = useState<OcrFinansalTaslak | null>(null);

  useEffect(() => {
    const load = async () => setTaslak(await getOcrFinansalTaslak());
    load();
    window.addEventListener('ocr-finansal-data-changed', load);
    return () => window.removeEventListener('ocr-finansal-data-changed', load);
  }, []);

  // Dönemsel karşılaştırmadan nakit akış verisi üret
  const DATA = (taslak?.donemsel_karsilastirma || []).map(d => ({
    ay: d.d,
    giris: Number(d.gelir || 0),
    cikis: Number(d.gider || 0),
    net: Number(d.gelir || 0) - Number(d.gider || 0),
  }));

  const topGiris = DATA.reduce((s, d) => s + d.giris, 0);
  const topCikis = DATA.reduce((s, d) => s + d.cikis, 0);
  const netPoz = topGiris - topCikis;

  // Kümülatif hesapla
  let kumulatif = 0;
  const tableData = DATA.map(d => {
    kumulatif += d.net;
    return { ...d, kumulatif };
  });

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nakit Akış Tablom</h1>
          <p className="text-slate-500 mt-1">
            {DATA.length > 0 ? `${taslak?.donem || '2024'} dönemi nakit akış verileri` : 'Henüz nakit akışı verisi girilmedi.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="buyil">
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="buyil">Bu Yıl</SelectItem>
              <SelectItem value="gecenyil">Geçen Yıl</SelectItem>
              <SelectItem value="son6">Son 6 Ay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> PDF İndir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-l-4 border-l-emerald-500"><CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-slate-500 font-medium">Toplam Nakit Giriş</p><p className="text-2xl font-bold text-emerald-600 mt-1">₺{fmt(topGiris)}</p></div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><ArrowDownToLine className="w-5 h-5 text-emerald-600" /></div>
          </div>
        </CardContent></Card>
        <Card className="shadow-sm border-l-4 border-l-red-400"><CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-slate-500 font-medium">Toplam Nakit Çıkış</p><p className="text-2xl font-bold text-red-500 mt-1">₺{fmt(topCikis)}</p></div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><ArrowUpFromLine className="w-5 h-5 text-red-500" /></div>
          </div>
        </CardContent></Card>
        <Card className={`shadow-sm border-l-4 ${netPoz >= 0 ? 'border-l-emerald-500' : 'border-l-red-400'}`}><CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-slate-500 font-medium">Net Nakit Pozisyon</p><p className={`text-2xl font-bold mt-1 ${netPoz >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>₺{fmt(netPoz)}</p></div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><Wallet className="w-5 h-5 text-emerald-600" /></div>
          </div>
        </CardContent></Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Aylık Nakit Akış Grafiği</CardTitle></CardHeader>
        <CardContent className="pt-6 h-[380px]">
          {DATA.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="ay" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={v => `₺${(Number(v)/1e3).toFixed(0)}K`} />
                <Tooltip formatter={(v) => `₺${fmt(Number(v))}`} contentStyle={{ borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="giris" name="Nakit Giriş" stroke="#00b894" strokeWidth={2} fillOpacity={0.2} fill="#00b894" />
                <Area type="monotone" dataKey="cikis" name="Nakit Çıkış" stroke="#d63031" strokeWidth={2} fillOpacity={0.2} fill="#d63031" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center rounded-lg border border-dashed text-sm text-slate-500">Nakit girişi ve çıkışı girildiğinde grafik burada görünecek.</div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Aylık Detay</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="pl-6">Ay</TableHead><TableHead>Nakit Girişi</TableHead><TableHead>Nakit Çıkışı</TableHead><TableHead>Net</TableHead><TableHead className="pr-6">Kümülatif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length > 0 ? tableData.map(d => (
                <TableRow key={d.ay}>
                  <TableCell className="pl-6 font-medium">{d.ay}</TableCell>
                  <TableCell className="text-emerald-600">₺{fmt(d.giris)}</TableCell>
                  <TableCell className="text-red-500">₺{fmt(d.cikis)}</TableCell>
                  <TableCell className={d.net >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>{d.net >= 0 ? '+' : ''}₺{fmt(d.net)}</TableCell>
                  <TableCell className={`pr-6 font-semibold ${d.kumulatif >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>₺{fmt(d.kumulatif)}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">Henüz nakit akışı verisi yok.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
