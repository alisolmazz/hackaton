'use client';

import React, { useMemo } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Wallet, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fmt = (v: number) => new Intl.NumberFormat('tr-TR').format(v);

const AYLAR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const DATA = [
  { ay:'Oca', giris:250000, cikis:180000 },{ ay:'Şub', giris:310000, cikis:220000 },
  { ay:'Mar', giris:280000, cikis:260000 },{ ay:'Nis', giris:420000, cikis:300000 },
  { ay:'May', giris:380000, cikis:290000 },{ ay:'Haz', giris:510000, cikis:340000 },
  { ay:'Tem', giris:460000, cikis:310000 },{ ay:'Ağu', giris:390000, cikis:280000 },
  { ay:'Eyl', giris:520000, cikis:350000 },{ ay:'Eki', giris:480000, cikis:330000 },
  { ay:'Kas', giris:550000, cikis:370000 },{ ay:'Ara', giris:600000, cikis:400000 },
].map(d => ({ ...d, net: d.giris - d.cikis }));

export default function NakitAkisPage() {
  const topGiris = DATA.reduce((s,d) => s+d.giris, 0);
  const topCikis = DATA.reduce((s,d) => s+d.cikis, 0);
  const netPoz = topGiris - topCikis;

  // Kümülatif hesapla
  const tableData = useMemo(() => {
    let kum = 0;
    return DATA.map(d => { kum += d.net; return { ...d, kumulatif: kum }; });
  }, []);

  // Trend analizi (son 3 ay vs önceki 3 ay)
  const son3 = DATA.slice(-3).reduce((s,d) => s+d.giris, 0) / 3;
  const onceki3 = DATA.slice(-6,-3).reduce((s,d) => s+d.giris, 0) / 3;
  const trendPct = ((son3 - onceki3) / onceki3 * 100).toFixed(1);
  const trendUp = Number(trendPct) >= 0;

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nakit Akış Tablom</h1>
          <p className="text-slate-500 mt-1">Aylık nakit giriş ve çıkışlarınızın detaylı analizi.</p>
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

      {/* METRİK KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-l-4 border-l-emerald-500"><CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-slate-500 font-medium">Toplam Nakit Giriş</p><p className="text-2xl font-bold text-emerald-600 mt-1">₺{fmt(topGiris)}</p></div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><ArrowDownToLine className="w-5 h-5 text-emerald-600"/></div>
          </div>
        </CardContent></Card>
        <Card className="shadow-sm border-l-4 border-l-red-400"><CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-slate-500 font-medium">Toplam Nakit Çıkış</p><p className="text-2xl font-bold text-red-500 mt-1">₺{fmt(topCikis)}</p></div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><ArrowUpFromLine className="w-5 h-5 text-red-500"/></div>
          </div>
        </CardContent></Card>
        <Card className={`shadow-sm border-l-4 ${netPoz>=0?'border-l-emerald-500':'border-l-red-500'}`}><CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-slate-500 font-medium">Net Nakit Pozisyon</p><p className={`text-2xl font-bold mt-1 ${netPoz>=0?'text-emerald-600':'text-red-600'}`}>₺{fmt(netPoz)}</p></div>
            <div className={`w-10 h-10 rounded-full ${netPoz>=0?'bg-emerald-100':'bg-red-100'} flex items-center justify-center`}><Wallet className={`w-5 h-5 ${netPoz>=0?'text-emerald-600':'text-red-500'}`}/></div>
          </div>
        </CardContent></Card>
      </div>

      {/* ANA GRAFİK */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Aylık Nakit Akış Grafiği</CardTitle></CardHeader>
        <CardContent className="pt-6 h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DATA}>
              <defs>
                <linearGradient id="gGiris" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00b894" stopOpacity={0.3}/><stop offset="95%" stopColor="#00b894" stopOpacity={0}/></linearGradient>
                <linearGradient id="gCikis" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d63031" stopOpacity={0.3}/><stop offset="95%" stopColor="#d63031" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/>
              <XAxis dataKey="ay" axisLine={false} tickLine={false} tick={{fontSize:12}}/>
              <YAxis axisLine={false} tickLine={false} tick={{fontSize:11}} tickFormatter={v=>`₺${(v/1000).toFixed(0)}K`}/>
              <Tooltip formatter={(v:number)=>`₺${fmt(v)}`} contentStyle={{borderRadius:'8px'}}/>
              <Legend/>
              <Area type="monotone" dataKey="giris" name="Nakit Giriş" stroke="#00b894" strokeWidth={2} fillOpacity={1} fill="url(#gGiris)"/>
              <Area type="monotone" dataKey="cikis" name="Nakit Çıkış" stroke="#d63031" strokeWidth={2} fillOpacity={1} fill="url(#gCikis)"/>
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AYLIK DETAY TABLOSU + TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Aylık Detay</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50"><TableRow>
                <TableHead className="pl-6">Ay</TableHead><TableHead>Nakit Girişi</TableHead><TableHead>Nakit Çıkışı</TableHead><TableHead>Net</TableHead><TableHead className="pr-6">Kümülatif</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {tableData.map(d=>(
                  <TableRow key={d.ay}><TableCell className="pl-6 font-medium">{d.ay}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">₺{fmt(d.giris)}</TableCell>
                    <TableCell className="text-red-500 font-medium">₺{fmt(d.cikis)}</TableCell>
                    <TableCell className={`font-bold ${d.net>=0?'text-emerald-600':'text-red-600'}`}>{d.net>=0?'+':''}₺{fmt(d.net)}</TableCell>
                    <TableCell className={`pr-6 font-bold ${d.kumulatif>=0?'text-emerald-700':'text-red-700'}`}>{d.kumulatif>=0?'+':''}₺{fmt(d.kumulatif)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50 dark:bg-slate-900 font-black">
                  <TableCell className="pl-6">TOPLAM</TableCell><TableCell className="text-emerald-600">₺{fmt(topGiris)}</TableCell><TableCell className="text-red-500">₺{fmt(topCikis)}</TableCell>
                  <TableCell className={netPoz>=0?'text-emerald-700':'text-red-700'}>{netPoz>=0?'+':''}₺{fmt(netPoz)}</TableCell><TableCell className="pr-6">—</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm flex flex-col justify-center">
          <CardContent className="p-6 text-center space-y-3">
            <div className={`w-14 h-14 mx-auto rounded-full ${trendUp?'bg-emerald-100':'bg-red-100'} flex items-center justify-center`}>
              {trendUp?<TrendingUp className="w-7 h-7 text-emerald-600"/>:<TrendingDown className="w-7 h-7 text-red-500"/>}
            </div>
            <h4 className="font-bold text-lg">Trend Analizi</h4>
            <p className="text-sm text-slate-500">Son 3 ayda nakit girişiniz önceki 3 aya göre</p>
            <p className={`text-3xl font-black ${trendUp?'text-emerald-600':'text-red-600'}`}>{trendUp?'+':''}{trendPct}%</p>
            <p className={`text-sm font-semibold ${trendUp?'text-emerald-600':'text-red-600'}`}>{trendUp?'Artış gösteriyor ↑':'Düşüş gösteriyor ↓'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
