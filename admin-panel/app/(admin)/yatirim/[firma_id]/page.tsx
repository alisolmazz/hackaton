'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getFirma } from '@/lib/api';
import { 
  Briefcase, TrendingUp, TrendingDown, Target, AlertTriangle, ArrowRight,
  ChevronLeft, Plus, RefreshCw, Info, Calendar, PlusCircle, CheckCircle2, ChevronUp, ChevronDown, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  LineChart, Line, Legend, Area, AreaChart
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// MOCK DATA
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#64748b'];

const AKTIF_YATIRIMLAR = [
  { id: 1, ad: 'BIST 100 Hisse Fonu', tur: 'Fon', alis: 500000, guncel: 625000, getiri: 25, risk: 'Orta', tarih: '2023-05-10', spark: [5, 8, 7, 12, 10, 15, 25] },
  { id: 2, ad: 'Eurobond Portföyü', tur: 'Tahvil', alis: 1200000, guncel: 1350000, getiri: 12.5, risk: 'Düşük', tarih: '2022-11-20', spark: [2, 4, 6, 8, 10, 11, 12.5] },
  { id: 3, ad: 'Ar-Ge Teknoloji Girişimi', tur: 'Girişim', alis: 250000, guncel: 200000, getiri: -20, risk: 'Yüksek', tarih: '2024-01-15', spark: [0, -5, -2, -10, -15, -12, -20] },
  { id: 4, ad: 'Gayrimenkul Yatırım Fonu', tur: 'GYF', alis: 800000, guncel: 1100000, getiri: 37.5, risk: 'Düşük', tarih: '2021-08-05', spark: [10, 15, 22, 28, 30, 35, 37.5] },
];

const SEKTOR_DAGILIM = [
  { name: 'Finans', value: 45 },
  { name: 'Gayrimenkul', value: 30 },
  { name: 'Teknoloji', value: 15 },
  { name: 'Enerji', value: 10 },
];

const COGRAFI_DAGILIM = [
  { name: 'Marmara', value: 60 },
  { name: 'Ege', value: 20 },
  { name: 'İç Anadolu', value: 15 },
  { name: 'Yurtdışı', value: 5 },
];

const GETIRI_TREND = [
  { ay: 'Oca', portfoy: 2.5, piyasa: 3.0 },
  { ay: 'Şub', portfoy: 5.2, piyasa: 4.5 },
  { ay: 'Mar', portfoy: 4.8, piyasa: 5.2 },
  { ay: 'Nis', portfoy: 8.5, piyasa: 6.8 },
  { ay: 'May', portfoy: 12.0, piyasa: 8.5 },
  { ay: 'Haz', portfoy: 15.4, piyasa: 10.2 },
  { ay: 'Tem', portfoy: 14.8, piyasa: 12.0 },
  { ay: 'Ağu', portfoy: 18.5, piyasa: 14.5 },
  { ay: 'Eyl', portfoy: 22.0, piyasa: 16.8 },
];

const PLANLANAN_YATIRIMLAR = [
  { id: 1, ad: 'Yeni Üretim Tesisi', tahmini: 5000000, beklenen_getiri: 35, tarih: '2024-09-01', durum: 'Onaylı' },
  { id: 2, ad: 'Avrupa Şubesi Açılışı', tahmini: 2500000, beklenen_getiri: 28, tarih: '2025-02-15', durum: 'Değerlendirmede' },
  { id: 3, ad: 'Güneş Enerjisi GES', tahmini: 1200000, beklenen_getiri: 45, tarih: '2024-11-30', durum: 'Planlıyor' },
];

// MODAL FORM SCHEMA
const yatirimSchema = z.object({
  ad: z.string().min(2, 'Yatırım adı girilmelidir'),
  tur: z.string().min(1, 'Tür seçilmelidir'),
  tarih: z.string().min(1, 'Tarih seçilmelidir'),
  alis: z.coerce.number().min(1, 'Geçerli bir tutar girin'),
  guncel: z.coerce.number().min(0, 'Geçerli bir tutar girin'),
  risk: z.string().min(1, 'Risk seviyesi seçilmelidir'),
  notlar: z.string().optional()
});

type YatirimFormValues = z.infer<typeof yatirimSchema>;

export default function YatirimPortfoyuPage() {
  const params = useParams();
  const router = useRouter();
  const firmaId = params.firma_id as string;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: firmaResponse } = useQuery({
    queryKey: ['firma', firmaId],
    queryFn: async () => await getFirma(firmaId),
  });
  const firma = firmaResponse?.data;

  const form = useForm<YatirimFormValues>({
    resolver: zodResolver(yatirimSchema) as any,
    defaultValues: {
      ad: '', tur: '', tarih: '', alis: 0, guncel: 0, risk: '', notlar: ''
    }
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Piyasa verileri güncellendi.');
    }, 1500);
  };

  const onSubmit = (data: YatirimFormValues) => {
    toast.success(`${data.ad} portföye eklendi!`);
    setModalOpen(false);
    form.reset();
  };

  const toplamDeger = AKTIF_YATIRIMLAR.reduce((acc, curr) => acc + curr.guncel, 0);
  const toplamAlis = AKTIF_YATIRIMLAR.reduce((acc, curr) => acc + curr.alis, 0);
  const genelGetiriYuzde = ((toplamDeger - toplamAlis) / toplamAlis) * 100;
  const genelGetiriTutar = toplamDeger - toplamAlis;
  const riskSkoru = 62; // 0-100 gauge data

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      {/* ÜST BANT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-16 z-20">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0 h-10 w-10">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{firma?.unvan || 'Yükleniyor...'}</h1>
              <Badge className="bg-amber-100 text-amber-800 border-none uppercase tracking-wide">Yatırım Portföyü</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">Firma yatırımları, portföy dağılımı ve risk analizi.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="text-slate-500 hidden sm:flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> 
            Son güncelleme: {format(new Date(), 'dd.MM.yyyy HH:mm')}
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> Yenile
          </Button>
        </div>
      </div>

      {/* ÖZET METRİK KARTLARI (GRADIENT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Toplam Portföy */}
        <Card className="border-0 shadow-lg overflow-hidden relative group bg-gradient-to-br from-amber-400 to-orange-500 text-white">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform"><Briefcase className="w-24 h-24 -mt-6 -mr-6" /></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-amber-50 font-medium mb-1 drop-shadow-sm">Toplam Portföy Değeri</p>
            <p className="text-3xl font-black tracking-tight drop-shadow-md">₺{toplamDeger.toLocaleString('tr-TR')}</p>
            <p className="text-sm text-amber-100 mt-3 flex items-center"><Info className="w-4 h-4 mr-1"/> Anlık piyasa değerleri</p>
          </CardContent>
        </Card>

        {/* Aktif Yatırım */}
        <Card className="border-0 shadow-lg overflow-hidden relative group bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform"><Target className="w-24 h-24 -mt-6 -mr-6" /></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-blue-100 font-medium mb-1 drop-shadow-sm">Aktif Yatırım Sayısı</p>
            <p className="text-3xl font-black tracking-tight drop-shadow-md">{AKTIF_YATIRIMLAR.length}</p>
            <p className="text-sm text-blue-100 mt-3 flex items-center">Farklı varlık sınıfında</p>
          </CardContent>
        </Card>

        {/* Toplam Getiri */}
        <Card className={`border-0 shadow-lg overflow-hidden relative group bg-gradient-to-br ${genelGetiriYuzde >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-rose-600'} text-white`}>
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
            {genelGetiriYuzde >= 0 ? <TrendingUp className="w-24 h-24 -mt-6 -mr-6" /> : <TrendingDown className="w-24 h-24 -mt-6 -mr-6" />}
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-white/80 font-medium mb-1 drop-shadow-sm">Toplam Getiri (Net)</p>
            <div className="flex items-baseline gap-2 drop-shadow-md">
              <p className="text-3xl font-black tracking-tight">{genelGetiriYuzde >= 0 ? '+' : ''}%{genelGetiriYuzde.toFixed(2)}</p>
            </div>
            <p className="text-sm text-white/80 mt-3 flex items-center font-medium">
              {genelGetiriTutar >= 0 ? '+' : ''}₺{genelGetiriTutar.toLocaleString('tr-TR')}
            </p>
          </CardContent>
        </Card>

        {/* Risk Skoru */}
        <Card className="border-0 shadow-lg overflow-hidden relative group bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform"><AlertTriangle className="w-24 h-24 -mt-6 -mr-6" /></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-slate-300 font-medium mb-1 drop-shadow-sm">Risk Skoru</p>
            <div className="flex items-center gap-3">
              <p className={`text-3xl font-black tracking-tight drop-shadow-md ${riskSkoru > 70 ? 'text-red-400' : riskSkoru > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {riskSkoru}/100
              </p>
            </div>
            <Progress value={riskSkoru} className="h-1.5 mt-3 bg-slate-700 [&>div]:bg-amber-400" />
            <p className="text-xs text-slate-400 mt-2">Dengeli / Orta Risk Profili</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* AKTİF YATIRIMLAR (Sol - 2 kolon) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl">Aktif Yatırımlar</CardTitle>
                <CardDescription>Mevcut portföydeki açık pozisyonlar</CardDescription>
              </div>
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger render={<Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm text-white" />}>
                  <Plus className="w-4 h-4 mr-1" /> Yatırım Ekle
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Yeni Yatırım Ekle</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                      <FormField control={form.control} name="ad" render={({ field }) => (
                        <FormItem><FormLabel>Yatırım Adı</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="tur" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Varlık Türü</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="hisse">Hisse Senedi / Fon</SelectItem>
                                <SelectItem value="tahvil">Tahvil / Bono</SelectItem>
                                <SelectItem value="gayrimenkul">Gayrimenkul</SelectItem>
                                <SelectItem value="girisim">Girişim Sermayesi</SelectItem>
                                <SelectItem value="diger">Diğer</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="tarih" render={({ field }) => (
                          <FormItem><FormLabel>Alış Tarihi</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="alis" render={({ field }) => (
                          <FormItem><FormLabel>Alış Tutarı (₺)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="guncel" render={({ field }) => (
                          <FormItem><FormLabel>Güncel Değer (₺)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="risk" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Risk Seviyesi</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="dusuk">Düşük</SelectItem>
                              <SelectItem value="orta">Orta</SelectItem>
                              <SelectItem value="yuksek">Yüksek</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="notlar" render={({ field }) => (
                        <FormItem><FormLabel>Notlar</FormLabel><FormControl><Textarea className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <DialogFooter className="pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>İptal</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Kaydet</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead className="pl-6">Yatırım & Tür</TableHead>
                    <TableHead>Alış (₺)</TableHead>
                    <TableHead>Güncel (₺)</TableHead>
                    <TableHead>Getiri</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead className="text-right pr-6">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AKTIF_YATIRIMLAR.map(item => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <TableCell className="pl-6">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{item.ad}</p>
                        <p className="text-xs text-slate-500">{item.tur} • {format(new Date(item.tarih), 'MMM yyyy', {locale: tr})}</p>
                      </TableCell>
                      <TableCell className="font-medium">₺{item.alis.toLocaleString('tr-TR')}</TableCell>
                      <TableCell className="font-bold text-slate-900 dark:text-slate-100">₺{item.guncel.toLocaleString('tr-TR')}</TableCell>
                      <TableCell>
                        <div className={`flex items-center font-bold ${item.getiri >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.getiri >= 0 ? <ChevronUp className="w-4 h-4 mr-0.5"/> : <ChevronDown className="w-4 h-4 mr-0.5"/>}
                          {Math.abs(item.getiri)}%
                        </div>
                      </TableCell>
                      <TableCell className="w-24">
                        <div className="h-8 w-20">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={item.spark.map((val, i) => ({ val, i }))}>
                              <Line type="monotone" dataKey="val" stroke={item.getiri >= 0 ? '#10b981' : '#ef4444'} strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge variant="outline" className={`
                          ${item.risk === 'Düşük' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : ''}
                          ${item.risk === 'Orta' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' : ''}
                          ${item.risk === 'Yüksek' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:border-red-800' : ''}
                        `}>
                          {item.risk}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* GETIRI TAKİBİ (Line Chart) */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <CardTitle className="text-lg">Portföy Performansı (Son 9 Ay)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={GETIRI_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPortfoy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="ay" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `%${val}`} />
                  <RechartsTooltip formatter={(val) => `%${val}`} contentStyle={{ borderRadius: '8px' }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" name="Portföy Getirisi" dataKey="portfoy" stroke="#3b82f6" strokeWidth={3} fill="url(#colorPortfoy)" />
                  <Line type="monotone" name="Piyasa Ortalaması" dataKey="piyasa" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* SAĞ PANEL (Dağılım & Risk & Planlananlar) */}
        <div className="space-y-6">
          
          {/* DAĞILIM (PieChart) */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <CardTitle className="text-lg">Sektörel Dağılım</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-64 relative flex flex-col justify-center items-center">
              <div className="absolute inset-0 top-6 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-500 font-medium">Toplam</span>
                <span className="text-xl font-bold">100%</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SEKTOR_DAGILIM} innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                    {SEKTOR_DAGILIM.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val) => `%${val}`} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* RİSK DEĞERLENDİRMESİ */}
          <Card className="shadow-sm bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <CardTitle className="text-lg">Risk Haritası</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Piyasa Riski</span>
                    <span className="text-red-600 font-bold">%75</span>
                  </div>
                  <Progress value={75} className="h-1.5 [&>div]:bg-red-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Likidite Riski</span>
                    <span className="text-emerald-600 font-bold">%20</span>
                  </div>
                  <Progress value={20} className="h-1.5 [&>div]:bg-emerald-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Kredi Riski</span>
                    <span className="text-amber-500 font-bold">%45</span>
                  </div>
                  <Progress value={45} className="h-1.5 [&>div]:bg-amber-500" />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-300 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4" /> AI Risk Yorumu
                </div>
                <p className="text-xs text-blue-900/80 dark:text-blue-200 leading-relaxed">
                  Portföyün genel yapısı defansif olup, likidite riski minimumdadır. Yüksek orandaki finans sektörü yatırımı sebebiyle piyasa riski "Orta-Üst" seviyede hesaplanmıştır. Çeşitlendirme önerilir.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* PLANLANAN YATIRIMLAR */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-row justify-between items-center">
              <CardTitle className="text-lg">Planlanan Yatırımlar</CardTitle>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600"><PlusCircle className="w-5 h-5"/></Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {PLANLANAN_YATIRIMLAR.map(p => (
                <div key={p.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:border-blue-200 transition-colors bg-white dark:bg-slate-900 group">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{p.ad}</h5>
                    <Badge variant="secondary" className="text-[10px] shadow-none h-5">{p.durum}</Badge>
                  </div>
                  <div className="flex justify-between items-end text-xs">
                    <div>
                      <p className="text-slate-500 mb-0.5">Tahmini Bütçe</p>
                      <p className="font-bold">₺{(p.tahmini/1000).toLocaleString('tr-TR')}k</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 mb-0.5">Beklenen Getiri</p>
                      <p className="font-bold text-emerald-600">%{p.beklenen_getiri}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
