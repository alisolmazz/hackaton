'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Building2, Eye, EyeOff, Clock, CheckCircle2, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { KisitliAlan } from '@/components/user/KisitliAlan';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART = [
  { d: '2024-Q1', gelir: 720000, gider: 510000 },
  { d: '2024-Q2', gelir: 850000, gider: 580000 },
  { d: '2024-Q3', gelir: 940000, gider: 620000 },
  { d: '2024-Q4', gelir: 1020000, gider: 680000 },
];
const BANKALAR = [
  { ad: 'Garanti BBVA', bakiye: 1250000, limit: 2000000, kullanim: 750000, hesap: '****4521', renk: 'bg-green-600' },
  { ad: 'İş Bankası', bakiye: 870000, limit: 1500000, kullanim: 1100000, hesap: '****7890', renk: 'bg-blue-600' },
  { ad: 'Yapı Kredi', bakiye: 340000, limit: 800000, kullanim: 680000, hesap: '****3456', renk: 'bg-purple-600' },
];
const BEKLEYEN = [
  { aciklama: 'Fatura #2024-045', vade: '2024-04-15', tutar: 45000, gecikme: 17 },
  { aciklama: 'Proje Alpha 3.taksit', vade: '2024-05-10', tutar: 65000, gecikme: -8 },
  { aciklama: 'Danışmanlık bedeli', vade: '2024-05-20', tutar: 20000, gecikme: -18 },
];
const YAPILAN = [
  { aciklama: 'Fatura #2024-040', tarih: '2024-04-28', tutar: 35000 },
  { aciklama: 'Proje Alpha 2.taksit', tarih: '2024-04-15', tutar: 65000 },
];
const PROJELER = [
  { ad: 'ERP Modül Geliştirme', baslangic: '2024-01-15', bitis: null, tutar: 180000, durum: 'devam' },
  { ad: 'Mobil Uygulama v2', baslangic: '2024-03-01', bitis: null, tutar: 95000, durum: 'devam' },
  { ad: 'Web Sitesi Yenileme', baslangic: '2023-10-01', bitis: '2024-02-15', tutar: 60000, durum: 'bitti' },
];

export default function UserFinansalRaporPage() {
  const [hesapGoster, setHesapGoster] = useState<Record<number, boolean>>({});
  const gelir = 3530000, gider = 2390000, netKar = gelir - gider;
  const toplamBakiye = BANKALAR.reduce((s, b) => s + b.bakiye, 0);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Finansal Raporum</h1>
          <Badge className="bg-teal-100 text-teal-800 border-none">2024 - Yıllık</Badge>
        </div>
        <p className="text-slate-500 mt-1">Firmanıza ait mali verilerin özeti.</p>
      </div>

      <Tabs defaultValue="mali" className="w-full space-y-6">
        <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 p-1 w-full max-w-3xl h-auto flex-wrap">
          <TabsTrigger value="mali" className="py-2 flex-1 data-[state=active]:shadow-sm text-xs sm:text-sm">Mali Veriler</TabsTrigger>
          <TabsTrigger value="banka" className="py-2 flex-1 data-[state=active]:shadow-sm text-xs sm:text-sm">Bankalarım</TabsTrigger>
          <TabsTrigger value="tahsilat" className="py-2 flex-1 data-[state=active]:shadow-sm text-xs sm:text-sm">Tahsilatlarım</TabsTrigger>
          <TabsTrigger value="proje" className="py-2 flex-1 data-[state=active]:shadow-sm text-xs sm:text-sm">Projelerim</TabsTrigger>
          <TabsTrigger value="ai" className="py-2 flex-1 data-[state=active]:shadow-sm text-xs sm:text-sm">🔒 AI Analiz</TabsTrigger>
          <TabsTrigger value="uzman" className="py-2 flex-1 data-[state=active]:shadow-sm text-xs sm:text-sm">🔒 Uzman</TabsTrigger>
        </TabsList>

        {/* TAB 1: MALİ VERİLER */}
        <TabsContent value="mali" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="shadow-sm border-l-4 border-l-emerald-500"><CardContent className="p-5">
              <p className="text-sm text-slate-500 font-medium">Toplam Gelir</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">₺{gelir.toLocaleString('tr-TR')}</p>
              <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/>+8.2%</p>
            </CardContent></Card>
            <Card className="shadow-sm border-l-4 border-l-red-400"><CardContent className="p-5">
              <p className="text-sm text-slate-500 font-medium">Toplam Gider</p>
              <p className="text-2xl font-bold text-red-500 mt-1">₺{gider.toLocaleString('tr-TR')}</p>
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><ArrowDownRight className="w-3 h-3"/>+3.1%</p>
            </CardContent></Card>
            <Card className={`shadow-sm border-l-4 ${netKar >= 0 ? 'border-l-emerald-500' : 'border-l-red-500'}`}><CardContent className="p-5">
              <p className="text-sm text-slate-500 font-medium">Net Kâr</p>
              <p className={`text-2xl font-bold mt-1 ${netKar >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>₺{netKar.toLocaleString('tr-TR')}</p>
            </CardContent></Card>
            <Card className="shadow-sm border-l-4 border-l-blue-500"><CardContent className="p-5">
              <p className="text-sm text-slate-500 font-medium">Toplam Varlık</p>
              <p className="text-2xl font-bold mt-1">₺8,450,000</p>
            </CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3 shadow-sm">
              <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Dönemsel Karşılaştırma</CardTitle></CardHeader>
              <CardContent className="pt-6 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/>
                    <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fontSize:12}}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize:12}} tickFormatter={v=>`₺${(v/1e6).toFixed(1)}M`}/>
                    <Tooltip formatter={(v:number)=>`₺${v.toLocaleString('tr-TR')}`} contentStyle={{borderRadius:'8px'}}/>
                    <Bar dataKey="gelir" name="Gelir" fill="#14b8a6" radius={[4,4,0,0]}/>
                    <Bar dataKey="gider" name="Gider" fill="#f87171" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Bilanço Özeti</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    {[['Toplam Gelir','₺3,530,000','text-emerald-600'],['Toplam Gider','₺2,390,000','text-red-500'],['Net Kâr','₺1,140,000','text-emerald-700 font-black'],['Toplam Varlık','₺8,450,000',''],['Toplam Borç','₺3,200,000','text-red-500'],['Özkaynaklar','₺5,250,000','text-blue-600']].map(([k,v,c])=>(
                      <TableRow key={k}><TableCell className="pl-6 text-slate-500 font-medium">{k}</TableCell><TableCell className={`text-right pr-6 font-bold ${c}`}>{v}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: BANKALARIM */}
        <TabsContent value="banka" className="space-y-6 animate-in fade-in-50 duration-300">
          <Card className="shadow-sm border-l-4 border-l-teal-500">
            <CardContent className="p-5 flex justify-between items-center">
              <div><p className="text-sm text-slate-500 font-medium">Toplam Banka Bakiyesi</p><p className="text-3xl font-black text-teal-600 mt-1">₺{toplamBakiye.toLocaleString('tr-TR')}</p></div>
              <Building2 className="w-10 h-10 text-teal-200"/>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BANKALAR.map((b,i)=>{
              const pct=Math.round((b.kullanim/b.limit)*100);
              return(
              <Card key={i} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${b.renk} flex items-center justify-center text-white font-bold text-sm`}>{b.ad.substring(0,2)}</div>
                    <div><h4 className="font-bold">{b.ad}</h4><p className="text-xs text-slate-500">Ticari Hesap</p></div>
                  </div>
                  <div><p className="text-xs text-slate-500">Bakiye</p><p className="text-2xl font-black text-emerald-600">₺{b.bakiye.toLocaleString('tr-TR')}</p></div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Kredi Kullanımı</span><span className={`font-bold ${pct>80?'text-red-600':pct>50?'text-amber-600':'text-emerald-600'}`}>%{pct}</span></div>
                    <Progress value={pct} className={`h-2 ${pct>80?'[&>div]:bg-red-500':pct>50?'[&>div]:bg-amber-500':'[&>div]:bg-emerald-500'}`}/>
                    <div className="flex justify-between text-xs text-slate-400"><span>₺{b.kullanim.toLocaleString('tr-TR')}</span><span>₺{b.limit.toLocaleString('tr-TR')}</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-slate-500 font-mono">{hesapGoster[i]?'TR12 3456 7890 '+b.hesap.slice(-4):b.hesap}</span>
                    <button onClick={()=>setHesapGoster(p=>({...p,[i]:!p[i]}))} className="text-slate-400 hover:text-teal-600"><span>{hesapGoster[i]?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</span></button>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        </TabsContent>

        {/* TAB 3: TAHSİLATLARIM */}
        <TabsContent value="tahsilat" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Card className="border-red-200 dark:border-red-900 shadow-sm bg-red-50/30 dark:bg-red-900/10">
                <CardContent className="p-5"><p className="text-sm text-red-600 font-medium">Toplam Bekleyen</p><p className="text-3xl font-black text-red-600 mt-1">₺130,000</p></CardContent>
              </Card>
              <Card className="shadow-sm"><CardContent className="p-0">
                <Table><TableHeader className="bg-slate-50 dark:bg-slate-900/50"><TableRow><TableHead className="pl-6">Açıklama</TableHead><TableHead>Vade</TableHead><TableHead>Tutar</TableHead><TableHead className="pr-6">Durum</TableHead></TableRow></TableHeader>
                <TableBody>{BEKLEYEN.map((t,i)=>(
                  <TableRow key={i} className={t.gecikme>0?'bg-red-50/50':''}>
                    <TableCell className="pl-6 font-medium">{t.aciklama}</TableCell>
                    <TableCell className="text-sm">{t.vade}</TableCell>
                    <TableCell className="font-bold">₺{t.tutar.toLocaleString('tr-TR')}</TableCell>
                    <TableCell className="pr-6">{t.gecikme>0?<Badge variant="destructive" className="bg-red-100 text-red-800 border-none hover:bg-red-200">{t.gecikme} gün gecikti</Badge>:<Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Bekliyor</Badge>}</TableCell>
                  </TableRow>
                ))}</TableBody></Table>
              </CardContent></Card>
            </div>
            <div className="space-y-4">
              <Card className="border-emerald-200 dark:border-emerald-900 shadow-sm bg-emerald-50/30 dark:bg-emerald-900/10">
                <CardContent className="p-5"><p className="text-sm text-emerald-600 font-medium">Bu Ay Tahsil Edilen</p><p className="text-3xl font-black text-emerald-600 mt-1">₺100,000</p></CardContent>
              </Card>
              <Card className="shadow-sm"><CardContent className="p-0">
                <Table><TableHeader className="bg-slate-50 dark:bg-slate-900/50"><TableRow><TableHead className="pl-6">Açıklama</TableHead><TableHead>Ödeme Tarihi</TableHead><TableHead>Tutar</TableHead><TableHead className="pr-6">Durum</TableHead></TableRow></TableHeader>
                <TableBody>{YAPILAN.map((t,i)=>(
                  <TableRow key={i}><TableCell className="pl-6 font-medium">{t.aciklama}</TableCell><TableCell className="text-sm">{t.tarih}</TableCell><TableCell className="font-bold text-emerald-600">₺{t.tutar.toLocaleString('tr-TR')}</TableCell><TableCell className="pr-6"><Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1"/>Ödendi</Badge></TableCell></TableRow>
                ))}</TableBody></Table>
              </CardContent></Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: PROJELERİM */}
        <TabsContent value="proje" className="space-y-6 animate-in fade-in-50 duration-300">
          <h3 className="font-bold text-lg">Devam Eden İşler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PROJELER.filter(p=>p.durum==='devam').map((p,i)=>(
              <Card key={i} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-start"><h4 className="font-bold text-lg">{p.ad}</h4><Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 shadow-none"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>Devam Ediyor</Badge></div>
                  <p className="text-sm text-slate-500">{p.baslangic} → Devam ediyor</p>
                  <p className="font-bold text-xl">₺{p.tutar.toLocaleString('tr-TR')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <h3 className="font-bold text-lg pt-4">Tamamlanan İşler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PROJELER.filter(p=>p.durum==='bitti').map((p,i)=>(
              <Card key={i} className="shadow-sm border-l-4 border-l-emerald-500 opacity-80">
                <CardContent className="p-5 space-y-2">
                  <div className="flex justify-between items-start"><h4 className="font-bold">{p.ad}</h4><Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1"/>Tamamlandı</Badge></div>
                  <p className="text-sm text-slate-500">{p.baslangic} → {p.bitis}</p>
                  <p className="font-bold">₺{p.tutar.toLocaleString('tr-TR')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 5: AI ANALİZ (KİLİTLİ) */}
        <TabsContent value="ai" className="animate-in fade-in-50 duration-300">
          <KisitliAlan ozellikAdi="AI Finansal Analiz" paketAdi="Temel Analiz" aciklama="Yapay zeka destekli otomatik finansal analiz raporuna erişmek için Temel Analiz veya üzeri bir paket gereklidir." ozellikler={['AI Destekli Oran Analizi','Grafik ve Tablo Çıktıları','Dönemsel Karşılaştırma','PDF İndirme']}>
            <div className="space-y-4"><div className="h-6 bg-slate-200 rounded w-3/4"/><div className="h-4 bg-slate-200 rounded w-full"/><div className="h-4 bg-slate-200 rounded w-5/6"/><div className="h-32 bg-slate-100 rounded mt-4"/></div>
          </KisitliAlan>
        </TabsContent>

        {/* TAB 6: UZMAN GÖRÜŞÜ (KİLİTLİ) */}
        <TabsContent value="uzman" className="animate-in fade-in-50 duration-300">
          <KisitliAlan ozellikAdi="Uzman Görüşü" paketAdi="Uzman Görüşü veya Premium Bundle" aciklama="Alanında uzman bir analist tarafından hazırlanan detaylı yorum ve önerilere erişmek için ilgili paketi satın alın." ozellikler={['Uzman Tarafından Yazılmış Yorum','Risk Değerlendirmesi','Stratejik Öneriler','Sektör Karşılaştırması']}>
            <div className="space-y-4"><div className="h-6 bg-slate-200 rounded w-1/2"/><div className="h-4 bg-slate-200 rounded w-full"/><div className="h-4 bg-slate-200 rounded w-4/5"/><div className="h-4 bg-slate-200 rounded w-full"/></div>
          </KisitliAlan>
        </TabsContent>
      </Tabs>
    </div>
  );
}
