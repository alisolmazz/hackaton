'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Wallet, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const fmt = (v: number) => new Intl.NumberFormat('tr-TR').format(v);
const bugun = new Date();
const gunFark = (vade: string) => Math.ceil((new Date(vade).getTime() - bugun.getTime()) / 86400000);

const PIE_DATA = [
  { name: 'Alacak', value: 485000, fill: '#10b981' },
  { name: 'Borç', value: 320000, fill: '#ef4444' },
  { name: 'Özkaynak', value: 750000, fill: '#3b82f6' },
];
const VADE_DATA = [
  { aralik: '0-30 gün', alacak: 180000, borc: 95000 },
  { aralik: '31-60 gün', alacak: 150000, borc: 120000 },
  { aralik: '61-90 gün', alacak: 85000, borc: 65000 },
  { aralik: '90+ gün', alacak: 70000, borc: 40000 },
];
const BORCLAR = [
  { aciklama: 'Yazılım Lisans Yenileme', alacakli: 'Microsoft TR', tutar: 95000, vade: '2024-05-15', durum: 'Bekliyor' },
  { aciklama: 'Ofis Kira Ödemesi', alacakli: 'Maslak Plaza', tutar: 45000, vade: '2024-05-01', durum: 'Bekliyor' },
  { aciklama: 'Sunucu Hosting', alacakli: 'AWS', tutar: 28000, vade: '2024-04-20', durum: 'Gecikti' },
  { aciklama: 'Danışmanlık Bedeli', alacakli: 'Pro Sicht', tutar: 60000, vade: '2024-06-01', durum: 'Bekliyor' },
];
const ALACAKLAR = [
  { aciklama: 'Proje Alpha Taksit', borçlu: 'Zirve A.Ş.', tutar: 120000, vade: '2024-05-10', durum: 'Bekliyor' },
  { aciklama: 'Modül Geliştirme', borçlu: 'Nova Ltd.', tutar: 85000, vade: '2024-04-25', durum: 'Gecikti' },
  { aciklama: 'Yıllık Destek', borçlu: 'Apex Üretim', tutar: 45000, vade: '2024-05-30', durum: 'Bekliyor' },
  { aciklama: 'Eğitim Bedeli', borçlu: 'Global Loj.', tutar: 35000, vade: '2024-04-10', durum: 'Tamamlandı' },
];

export default function BorcAlacakPage() {
  const [alacakFiltre, setAlacakFiltre] = useState('tumu');
  const topBorc = BORCLAR.reduce((s, b) => s + b.tutar, 0);
  const topAlacak = ALACAKLAR.reduce((s, a) => s + a.tutar, 0);
  const netPoz = topAlacak - topBorc;
  const vadesiYaklasan = [...BORCLAR, ...ALACAKLAR].filter(x => { const g = gunFark(x.vade); return g >= 0 && g <= 30; }).length;

  const filteredAlacak = ALACAKLAR.filter(a => {
    if (alacakFiltre === 'tumu') return true;
    if (alacakFiltre === 'bekliyor') return a.durum === 'Bekliyor';
    if (alacakFiltre === 'gecikti') return a.durum === 'Gecikti';
    return a.durum === 'Tamamlandı';
  });

  const durumBadge = (d: string, vade: string) => {
    const g = gunFark(vade);
    if (d === 'Tamamlandı') return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1"/>Ödendi</Badge>;
    if (d === 'Gecikti' || g < 0) return <Badge variant="destructive" className="bg-red-100 text-red-800 border-none animate-pulse">{Math.abs(g)} gün gecikti</Badge>;
    return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shadow-none"><Clock className="w-3 h-3 mr-1"/>{g} gün kaldı</Badge>;
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Borç / Alacak Özetim</h1>
        <p className="text-slate-500 mt-1">Borç ve alacak durumunuzun detaylı analizi.</p>
      </div>

      {/* METRİK KARTLAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="shadow-sm border-l-4 border-l-emerald-500"><CardContent className="p-5">
          <p className="text-sm text-slate-500 font-medium">Toplam Alacak</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₺{fmt(topAlacak)}</p>
        </CardContent></Card>
        <Card className="shadow-sm border-l-4 border-l-red-400"><CardContent className="p-5">
          <p className="text-sm text-slate-500 font-medium">Toplam Borç</p>
          <p className="text-2xl font-bold text-red-500 mt-1">₺{fmt(topBorc)}</p>
        </CardContent></Card>
        <Card className={`shadow-sm border-l-4 ${netPoz >= 0 ? 'border-l-emerald-500' : 'border-l-red-500'}`}><CardContent className="p-5">
          <p className="text-sm text-slate-500 font-medium">Net Pozisyon</p>
          <p className={`text-2xl font-bold mt-1 ${netPoz >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{netPoz >= 0 ? '+' : ''}₺{fmt(netPoz)}</p>
        </CardContent></Card>
        <Card className="shadow-sm border-l-4 border-l-amber-500"><CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-slate-500 font-medium">Vadesi Yaklaşan</p><p className="text-2xl font-bold text-amber-600 mt-1">{vadesiYaklasan}</p></div>
            <AlertTriangle className="w-5 h-5 text-amber-500"/>
          </div>
        </CardContent></Card>
      </div>

      {/* GRAFİKLER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Dağılım</CardTitle></CardHeader>
          <CardContent className="pt-6 h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" label={({name,percent})=>`${name} %${(percent*100).toFixed(0)}`}>
                  {PIE_DATA.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                </Pie>
                <Tooltip formatter={(v:number)=>`₺${fmt(v)}`}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Vade Dağılımı</CardTitle></CardHeader>
          <CardContent className="pt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VADE_DATA} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/>
                <XAxis dataKey="aralik" axisLine={false} tickLine={false} tick={{fontSize:11}}/>
                <YAxis axisLine={false} tickLine={false} tick={{fontSize:11}} tickFormatter={v=>`₺${(v/1000).toFixed(0)}K`}/>
                <Tooltip formatter={(v:number)=>`₺${fmt(v)}`} contentStyle={{borderRadius:'8px'}}/>
                <Legend/>
                <Bar dataKey="alacak" name="Alacak" fill="#10b981" radius={[4,4,0,0]}/>
                <Bar dataKey="borc" name="Borç" fill="#ef4444" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* BORÇ LİSTESİ */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">Borçlarım <Badge variant="destructive" className="ml-2">₺{fmt(topBorc)}</Badge></CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table><TableHeader className="bg-slate-50 dark:bg-slate-900/50"><TableRow>
            <TableHead className="pl-6">Açıklama</TableHead><TableHead>Alacaklı</TableHead><TableHead>Tutar</TableHead><TableHead>Vade</TableHead><TableHead className="pr-6">Durum</TableHead>
          </TableRow></TableHeader><TableBody>
            {BORCLAR.map((b,i)=>(<TableRow key={i} className={gunFark(b.vade)<0?'bg-red-50/50 dark:bg-red-900/10':''}>
              <TableCell className="pl-6 font-medium">{b.aciklama}</TableCell><TableCell className="text-slate-500">{b.alacakli}</TableCell>
              <TableCell className="font-bold text-red-600">₺{fmt(b.tutar)}</TableCell><TableCell className="text-sm">{b.vade}</TableCell>
              <TableCell className="pr-6">{durumBadge(b.durum, b.vade)}</TableCell>
            </TableRow>))}
          </TableBody></Table>
        </CardContent>
      </Card>

      {/* ALACAK LİSTESİ */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">Alacaklarım <Badge className="bg-emerald-100 text-emerald-800 border-none ml-2">₺{fmt(topAlacak)}</Badge></CardTitle>
          <Select value={alacakFiltre} onValueChange={setAlacakFiltre}>
            <SelectTrigger className="w-[140px]"><SelectValue/></SelectTrigger>
            <SelectContent><SelectItem value="tumu">Tümü</SelectItem><SelectItem value="bekliyor">Bekleyen</SelectItem><SelectItem value="gecikti">Gecikmiş</SelectItem><SelectItem value="tamamlandi">Tamamlanan</SelectItem></SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <Table><TableHeader className="bg-slate-50 dark:bg-slate-900/50"><TableRow>
            <TableHead className="pl-6">Açıklama</TableHead><TableHead>Borçlu</TableHead><TableHead>Tutar</TableHead><TableHead>Vade</TableHead><TableHead className="pr-6">Durum</TableHead>
          </TableRow></TableHeader><TableBody>
            {filteredAlacak.map((a,i)=>(<TableRow key={i} className={a.durum==='Gecikti'?'bg-red-50/50 dark:bg-red-900/10':''}>
              <TableCell className="pl-6 font-medium">{a.aciklama}</TableCell><TableCell className="text-slate-500">{a.borçlu}</TableCell>
              <TableCell className="font-bold text-emerald-600">₺{fmt(a.tutar)}</TableCell><TableCell className="text-sm">{a.vade}</TableCell>
              <TableCell className="pr-6">{durumBadge(a.durum, a.vade)}</TableCell>
            </TableRow>))}
          </TableBody></Table>
        </CardContent>
      </Card>

      {/* YAŞLANDIRMA ANALİZİ */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Yaşlandırma Analizi</CardTitle><CardDescription>Vade aralıklarına göre borç/alacak dağılımı</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table><TableHeader className="bg-slate-50 dark:bg-slate-900/50"><TableRow>
            <TableHead className="pl-6">Vade Aralığı</TableHead><TableHead>Alacak</TableHead><TableHead>Borç</TableHead><TableHead className="pr-6">Net</TableHead>
          </TableRow></TableHeader><TableBody>
            {VADE_DATA.map((v,i)=>{const net=v.alacak-v.borc; return(
              <TableRow key={i} className={v.aralik==='90+ gün'?'bg-red-50 dark:bg-red-900/10':''}>
                <TableCell className={`pl-6 font-medium ${v.aralik==='90+ gün'?'text-red-700 font-bold':''}`}>{v.aralik}</TableCell>
                <TableCell className="text-emerald-600 font-medium">₺{fmt(v.alacak)}</TableCell>
                <TableCell className="text-red-500 font-medium">₺{fmt(v.borc)}</TableCell>
                <TableCell className={`pr-6 font-bold ${net>=0?'text-emerald-700':'text-red-700'}`}>{net>=0?'+':''}₺{fmt(net)}</TableCell>
              </TableRow>
            )})}
            <TableRow className="bg-slate-100 dark:bg-slate-900 font-black">
              <TableCell className="pl-6">TOPLAM</TableCell>
              <TableCell className="text-emerald-700">₺{fmt(VADE_DATA.reduce((s,v)=>s+v.alacak,0))}</TableCell>
              <TableCell className="text-red-600">₺{fmt(VADE_DATA.reduce((s,v)=>s+v.borc,0))}</TableCell>
              <TableCell className="pr-6 text-emerald-700">+₺{fmt(VADE_DATA.reduce((s,v)=>s+v.alacak-v.borc,0))}</TableCell>
            </TableRow>
          </TableBody></Table>
        </CardContent>
      </Card>
    </div>
  );
}
