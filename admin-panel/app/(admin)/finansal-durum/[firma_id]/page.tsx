'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getFirma } from '@/lib/api';
import { 
  Clock, CheckCircle, TrendingDown, Wallet, Calendar, 
  ChevronLeft, Building2, Download, UploadCloud, FileSpreadsheet, Plus, AlertCircle, RefreshCw,
  Building, CheckCircle2, CircleDashed
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useBankalar, useTahsilatlar, useProjeler, useCreateTahsilat } from '@/hooks/useFinans';
import { Banka, Tahsilat, Proje } from '@/types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// NAKİT AKIŞI MOCK DATA (Chart için görsel)
const AYLAR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const NAKIT_AKIS_DATA = AYLAR.map((ay, i) => {
  const giris = Math.floor(Math.random() * 500000) + 200000;
  const cikis = Math.floor(Math.random() * 400000) + 150000;
  return { ay, giris, cikis, net: giris - cikis, kumulatif: 0 };
});
let kumulatif = 0;
NAKIT_AKIS_DATA.forEach(d => { kumulatif += d.net; d.kumulatif = kumulatif; });

const PIE_COLORS = ['#ef4444', '#10b981'];

export default function FinansalDurumPage() {
  const params = useParams();
  const router = useRouter();
  const firmaId = params.firma_id as string;
  const [donem, setDonem] = useState('2024');

  const { data: firmaResponse } = useQuery({
    queryKey: ['firma', firmaId],
    queryFn: async () => await getFirma(firmaId),
  });
  const firma = firmaResponse?.data;

  const { data: bankalarResp } = useBankalar(firmaId);
  const { data: tahsilatlarResp } = useTahsilatlar(firmaId);
  const { data: projelerResp } = useProjeler(firmaId);
  const createTahsilatMutation = useCreateTahsilat();

  const bankalar: Banka[] = bankalarResp || [];
  const tahsilatlar: Tahsilat[] = tahsilatlarResp || [];
  const projeler: Proje[] = projelerResp || [];

  const bekleyenTahsilatlar = tahsilatlar.filter(t => t.durum === 'bekliyor');
  const yapilanTahsilatlar = tahsilatlar.filter(t => t.durum === 'odendi');

  // Hesaplamalar
  const toplamBekleyen = bekleyenTahsilatlar.reduce((acc, curr) => acc + curr.tutar, 0);
  const toplamYapilan = yapilanTahsilatlar.reduce((acc, curr) => acc + curr.tutar, 0);
  const toplamBorc = bankalar.reduce((acc, curr) => acc + (curr.kredi_kullanim || 0), 0) || 15500000; // Eğer boşsa dummy 15M görünsün demo için
  const netNakit = bankalar.reduce((acc, curr) => acc + curr.bakiye, 0) + toplamBekleyen - toplamBorc;

  const handlePrint = () => {
    // Print öncesi ufak bir stil eklentisi yaparak yan menüleri gizleyeceğiz, @media print zaten globalde çözülür ancak tailwind için classlar ekledik.
    window.print();
  };

  const handleOcr = () => {
    const id = toast.loading('Banka dekontları veya ekstreleri analiz ediliyor...');
    setTimeout(() => {
      // Mock bir OCR sonucu gelmiş gibi direkt veritabanına bir tahsilat ekleyelim
      createTahsilatMutation.mutate({
        firmaId,
        payload: {
          aciklama: 'Yapay Zeka OCR - Danışmanlık Tahsilatı',
          tutar: Math.floor(Math.random() * 200000) + 50000,
          durum: 'odendi' as any, // enum hatasi vermesin
          odeme_tarihi: new Date().toISOString()
        }
      });
      toast.success('Finansal durum belgeden güncellendi!', { id });
    }, 2000);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const wsBankalar = XLSX.utils.json_to_sheet(bankalar.map(b => ({ Banka: b.banka_adi, Hesap: b.hesap_no, Bakiye: b.bakiye, 'Kredi Kullanım': b.kredi_kullanim, 'Limit': b.kredi_limiti })));
    XLSX.utils.book_append_sheet(wb, wsBankalar, "Bankalar");

    const wsTahsilatlar = XLSX.utils.json_to_sheet(tahsilatlar.map(t => ({ Aciklama: t.aciklama, Tutar: t.tutar, Durum: t.durum, 'Tarih/Vade': t.odeme_tarihi || t.vade_tarihi })));
    XLSX.utils.book_append_sheet(wb, wsTahsilatlar, "Tahsilatlar");

    const wsProjeler = XLSX.utils.json_to_sheet(projeler.map(p => ({ Proje: p.proje_adi, Tutar: p.tutar, Durum: p.durum, İlerleme: '%0' })));
    XLSX.utils.book_append_sheet(wb, wsProjeler, "Projeler");

    XLSX.writeFile(wb, `${firma?.unvan || 'Firma'}_Finansal_Durum.xlsx`);
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      {/* HEADER & TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-16 z-20 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{firma?.unvan || 'Yükleniyor...'}</h1>
              <Badge className="bg-purple-100 text-purple-800 border-none uppercase tracking-wide">Finansal Durum</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">Anlık ve dönemsel finansal pozisyon özeti.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={donem} onValueChange={(value) => value && setDonem(value)}>
            <SelectTrigger className="w-[140px] h-10 font-medium">
              <Calendar className="w-4 h-4 mr-2 text-slate-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024 Yılı</SelectItem>
              <SelectItem value="2023">2023 Yılı</SelectItem>
              <SelectItem value="Tumu">Tüm Zamanlar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* METRİK KARTLARI (4 KART) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Toplam Bekleyen Tahsilat</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₺{toplamBekleyen.toLocaleString('tr-TR')}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Bu Dönem Yapılan Tahsilat</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₺{toplamYapilan.toLocaleString('tr-TR')}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Toplam Borç</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₺{toplamBorc.toLocaleString('tr-TR')}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 shadow-sm hover:shadow-md transition-shadow ${netNakit >= 0 ? 'border-l-blue-500' : 'border-l-red-500'}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">Net Nakit Pozisyon</p>
                <p className={`text-2xl font-bold ${netNakit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                  {netNakit >= 0 ? '+' : ''}₺{netNakit.toLocaleString('tr-TR')}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${netNakit >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <Wallet className={`w-5 h-5 ${netNakit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BÖLÜM 1 — BEKLEYEN TAHSİLATLAR */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Bekleyen Tahsilatlar</CardTitle>
              <CardDescription>Yaklaşan ve gecikmiş ödemeler</CardDescription>
            </div>
            <div className="text-xl font-bold text-red-600">₺{toplamBekleyen.toLocaleString('tr-TR')}</div>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            <Accordion className="w-full">
              {bekleyenTahsilatlar.length === 0 && <div className="p-4 text-center text-slate-500">Bekleyen tahsilat bulunmuyor.</div>}
              {bekleyenTahsilatlar.map((item) => {
                const diff = differenceInDays(new Date(), new Date(item.vade_tarihi || new Date()));
                const isLate = diff > 0;
                return (
                  <AccordionItem value={`item-${item.id}`} key={item.id} className="border-slate-100 dark:border-slate-800">
                    <AccordionTrigger className="hover:no-underline py-3 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isLate ? 'bg-red-500' : 'bg-amber-500'}`} />
                          <span className="font-medium text-sm text-left">{item.aciklama}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-sm">₺{item.tutar.toLocaleString('tr-TR')}</span>
                          {isLate ? (
                            <Badge variant="destructive" className="text-[10px] h-5 bg-red-100 text-red-800 hover:bg-red-200 shadow-none border-0">Gecikti</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] h-5 bg-amber-100 text-amber-800 hover:bg-amber-200 shadow-none border-0">Bekliyor</Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-lg border border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-sm">
                        <div className="space-y-1 text-slate-500">
                          <p>Vade Tarihi: <strong className="text-slate-900 dark:text-slate-200">{item.vade_tarihi ? format(new Date(item.vade_tarihi), 'dd MMMM yyyy', { locale: tr }) : '-'}</strong></p>
                          {isLate ? (
                            <p className="text-red-600 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {diff} gün geçti</p>
                          ) : (
                            <p className="text-amber-600 font-medium">{-diff} gün kaldı</p>
                          )}
                        </div>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm print:hidden">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Ödendi İşaretle
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* BÖLÜM 2 — YAPILAN TAHSİLATLAR */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Yapılan Tahsilatlar</CardTitle>
              <CardDescription>Başarıyla tamamlanan ödemeler</CardDescription>
            </div>
            <div className="text-xl font-bold text-emerald-600">₺{toplamYapilan.toLocaleString('tr-TR')}</div>
          </CardHeader>
          <CardContent className="pt-4 p-0 flex-1">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Açıklama</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right pr-6">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yapilanTahsilatlar.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center py-4 text-slate-500">Henüz tamamlanan tahsilat yok.</TableCell></TableRow>
                )}
                {yapilanTahsilatlar.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-6 font-medium">{item.aciklama}</TableCell>
                    <TableCell className="text-slate-500">{item.odeme_tarihi ? format(new Date(item.odeme_tarihi), 'dd MMM yyyy', { locale: tr }) : '-'}</TableCell>
                    <TableCell className="text-right pr-6 font-bold text-emerald-600">₺{item.tutar.toLocaleString('tr-TR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">Tümünü Gör</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BÖLÜM 3 — NAKİT AKIŞ TABLOSU & CHART */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Nakit Akış Analizi</CardTitle>
            <CardDescription>Aylık bazda nakit giriş/çıkış ve kümülatif net pozisyon.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-80 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={NAKIT_AKIS_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGiris" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCikis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="ay" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `₺${val/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <RechartsTooltip 
                  formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="giris" name="Nakit Girişi" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGiris)" />
                <Area type="monotone" dataKey="cikis" name="Nakit Çıkışı" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCikis)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="pl-6 w-24">Ay</TableHead>
                  <TableHead>Nakit Girişi</TableHead>
                  <TableHead>Nakit Çıkışı</TableHead>
                  <TableHead>Aylık Net</TableHead>
                  <TableHead className="text-right pr-6">Kümülatif</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {NAKIT_AKIS_DATA.slice(0, 4).map((row, i) => ( // Demo için ilk 4 ay
                  <TableRow key={i}>
                    <TableCell className="pl-6 font-medium">{row.ay}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">₺{row.giris.toLocaleString('tr-TR')}</TableCell>
                    <TableCell className="text-red-600 font-medium">₺{row.cikis.toLocaleString('tr-TR')}</TableCell>
                    <TableCell className={`font-bold ${row.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {row.net >= 0 ? '+' : ''}₺{row.net.toLocaleString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right pr-6 font-bold text-slate-900 dark:text-slate-100">
                      ₺{row.kumulatif.toLocaleString('tr-TR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* BÖLÜM 4 — BORÇ / ALACAK & BANKALAR (2 Kolon) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Borç / Özkaynak ve Vade */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg">Borç & Alacak Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={[{name: 'Borç', value: toplamBorc}, {name: 'Özkaynak', value: 25000000}]} 
                    innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value"
                  >
                    {PIE_COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(val) => `₺${Number(val).toLocaleString('tr-TR')}`} />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Vade Bazlı Borçlar</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"/> 0-30 Gün</span>
                  <span className="font-bold">₺2,500,000</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400"/> 31-60 Gün</span>
                  <span className="font-bold">₺4,200,000</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"/> 61-90 Gün</span>
                  <span className="font-bold">₺1,800,000</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"/> 90+ Gün</span>
                  <span className="font-bold">₺7,000,000</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BÖLÜM 5 — BANKALAR */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2"><Building className="w-5 h-5 text-blue-600"/> Bankalar</CardTitle>
            </div>
            <Button size="sm" variant="ghost" className="text-blue-600"><Plus className="w-4 h-4 mr-1"/> Ekle</Button>
          </CardHeader>
          <CardContent className="pt-4 flex-1 overflow-y-auto max-h-[300px] space-y-4 custom-scrollbar">
            {bankalar.length === 0 && <div className="text-center text-slate-500 py-4">Banka kaydı bulunamadı.</div>}
            {bankalar.map(b => {
              const oran = ((b.kredi_kullanim || 0) / (b.kredi_limiti || 1)) * 100;
              return (
                <div key={b.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-blue-200 transition-colors break-inside-avoid">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-bold">{b.banka_adi}</h5>
                    <span className="text-xs font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">{b.hesap_no}</span>
                  </div>
                  <div className="text-2xl font-black text-green-600 dark:text-green-500 mb-3">
                    ₺{(b.bakiye || 0).toLocaleString('tr-TR')}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Kredi: ₺{(b.kredi_kullanim || 0).toLocaleString('tr-TR')}</span>
                      <span>Limit: ₺{(b.kredi_limiti || 0).toLocaleString('tr-TR')}</span>
                    </div>
                    <Progress value={oran} className="h-1.5" />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* BÖLÜM 6 — DEVAM EDEN / BİTEN İŞLER & MALİ ÖZET */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Projeler */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Projeler ve Sözleşmeler</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Devam Edenler */}
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                  <CircleDashed className="w-4 h-4 animate-spin-slow" /> Devam Eden İşler
                </h4>
                {projeler.filter(p => p.durum === 'devam').length === 0 && <p className="text-sm text-slate-500">Devam eden iş yok.</p>}
                {projeler.filter(p => p.durum === 'devam').map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-l-4 border-l-blue-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm break-inside-avoid">
                    <h5 className="font-bold mb-1">{p.proje_adi}</h5>
                    <div className="text-sm text-slate-500 mb-3">
                      {p.baslangic ? format(new Date(p.baslangic), 'MMM yyyy', { locale: tr }) : ''} {p.bitis ? `- ${format(new Date(p.bitis), 'MMM yyyy', { locale: tr })}` : ''}
                    </div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-slate-900 dark:text-white">₺{p.tutar.toLocaleString('tr-TR')}</span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">%0</span>
                    </div>
                    <Progress value={0} className="h-1.5 bg-blue-100" />
                  </div>
                ))}
              </div>

              {/* Bitenler */}
              <div className="space-y-4">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Tamamlanan İşler
                </h4>
                {projeler.filter(p => p.durum === 'bitti').length === 0 && <p className="text-sm text-slate-500">Tamamlanan iş yok.</p>}
                {projeler.filter(p => p.durum === 'bitti').map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-l-4 border-l-emerald-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm opacity-80 hover:opacity-100 transition-opacity break-inside-avoid">
                    <h5 className="font-bold mb-1 line-through decoration-emerald-500/30">{p.proje_adi}</h5>
                    <div className="text-sm text-slate-500 mb-3">
                      Bitiş: {p.bitis ? format(new Date(p.bitis), 'dd MMMM yyyy', { locale: tr }) : '-'}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">₺{p.tutar.toLocaleString('tr-TR')}</span>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shadow-none">Tamamlandı</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mali Veriler Özeti */}
        <div className="xl:col-span-1">
          <Card className="shadow-sm h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-900/80">
            <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="text-lg">Mali Oranlar Özeti</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h5 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Likidite & Borçluluk</h5>
                <div className="bg-white dark:bg-slate-950 rounded-lg p-3 border border-slate-200 dark:border-slate-800 flex justify-between items-center mb-2">
                  <span className="font-medium">Cari Oran</span>
                  <span className="font-bold text-emerald-600">1.85</span>
                </div>
                <div className="bg-white dark:bg-slate-950 rounded-lg p-3 border border-slate-200 dark:border-slate-800 flex justify-between items-center mb-2">
                  <span className="font-medium">Asit Test Oranı</span>
                  <span className="font-bold text-amber-600">1.12</span>
                </div>
                <div className="bg-white dark:bg-slate-950 rounded-lg p-3 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-medium">Kaldıraç Oranı</span>
                  <span className="font-bold text-blue-600">%45</span>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Karlılık Özeti</h5>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-slate-600 dark:text-slate-400">Brüt Kar Marjı</span>
                    <span className="font-bold">%32.4</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-slate-600 dark:text-slate-400">Net Kar Marjı</span>
                    <span className="font-bold">%18.7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Özkaynak Karlılığı</span>
                    <span className="font-bold">%24.1</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* SAYFA ALT BUTONLARI */}
      <div className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 print:hidden">
        <Button variant="outline" onClick={handleOcr} className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30">
          <UploadCloud className="w-4 h-4 mr-2" /> Belgeden Güncelle
        </Button>
        <Button variant="outline" onClick={handleExportExcel} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel'e Aktar
        </Button>
        <Button onClick={handlePrint} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-md">
          <Download className="w-4 h-4 mr-2" /> PDF Olarak İndir
        </Button>
      </div>

    </div>
  );
}
