'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain, UploadCloud, Download, PlusCircle, Edit2, Trash2, 
  Sparkles, Loader2, Save, CheckCircle2, ChevronLeft, Building2, AlertTriangle, Building, CreditCard, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// API
import { getFirma } from '@/lib/api';

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const PIE_COLORS = ['#ef4444', '#10b981']; // Red (Borç), Green (Özkaynak)

const DEMO_NAKIT_AKIS = [
  { ay: AYLAR[0], giris: 920000, cikis: 710000 },
  { ay: AYLAR[1], giris: 1040000, cikis: 795000 },
  { ay: AYLAR[2], giris: 1185000, cikis: 865000 },
  { ay: AYLAR[3], giris: 1340000, cikis: 910000 },
  { ay: AYLAR[4], giris: 1260000, cikis: 980000 },
  { ay: AYLAR[5], giris: 1510000, cikis: 1095000 },
  { ay: AYLAR[6], giris: 1420000, cikis: 1015000 },
  { ay: AYLAR[7], giris: 1665000, cikis: 1170000 },
  { ay: AYLAR[8], giris: 1730000, cikis: 1240000 },
  { ay: AYLAR[9], giris: 1850000, cikis: 1325000 },
  { ay: AYLAR[10], giris: 1920000, cikis: 1390000 },
  { ay: AYLAR[11], giris: 2140000, cikis: 1515000 },
];

const finansalSchema = z.object({
  donem: z.string().min(1, 'Dönem seçilmelidir'),
  toplam_gelir: z.coerce.number().min(0, 'Geçerli bir değer girin'),
  toplam_gider: z.coerce.number().min(0, 'Geçerli bir değer girin'),
  toplam_varlik: z.coerce.number().min(0, 'Geçerli bir değer girin'),
  toplam_borc: z.coerce.number().min(0, 'Geçerli bir değer girin'),
  nakit_ve_benzerleri: z.coerce.number().min(0, 'Geçerli bir değer girin'),
  alis_satis_kosullari: z.string().optional(),
  nakit_akis: z.array(z.object({
    ay: z.string(),
    giris: z.coerce.number(),
    cikis: z.coerce.number()
  }))
});

type FinansalFormValues = z.infer<typeof finansalSchema>;

export default function FinansalRaporPage() {
  const params = useParams();
  const router = useRouter();
  const firmaId = params.firma_id as string;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  const { data: firmaResponse } = useQuery({
    queryKey: ['firma', firmaId],
    queryFn: async () => await getFirma(firmaId),
  });
  const firma = firmaResponse?.data;

  const form = useForm<FinansalFormValues>({
    resolver: zodResolver(finansalSchema) as never,
    defaultValues: {
      donem: '2024-Q1',
      toplam_gelir: 0,
      toplam_gider: 0,
      toplam_varlik: 0,
      toplam_borc: 0,
      nakit_ve_benzerleri: 0,
      alis_satis_kosullari: '',
      nakit_akis: AYLAR.map(ay => ({ ay, giris: 0, cikis: 0 }))
    }
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "nakit_akis",
  });

  const watchAll = form.watch();
  
  // Otomatik hesaplanan değerler
  const netKar = watchAll.toplam_gelir - watchAll.toplam_gider;
  const ozkaynak = watchAll.toplam_varlik - watchAll.toplam_borc;

  // Track changes
  useEffect(() => {
    const subscription = form.watch(() => setHasUnsavedChanges(true));
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleOcr = async () => {
    setIsOcrLoading(true);
    const id = toast.loading('Belge analiz ediliyor...');
    setTimeout(() => {
      // Mock OCR data
      form.setValue('toplam_gelir', 12500000);
      form.setValue('toplam_gider', 8400000);
      form.setValue('toplam_varlik', 25000000);
      form.setValue('toplam_borc', 9500000);
      form.setValue('nakit_ve_benzerleri', 3200000);
      replace(DEMO_NAKIT_AKIS);
      toast.success('Değerler otomatik dolduruldu!', { id });
      setIsOcrLoading(false);
      setHasUnsavedChanges(true);
    }, 2500);
  };

  const onSubmit = async (data: FinansalFormValues) => {
    const id = toast.loading('Kaydediliyor...');
    setTimeout(() => {
      toast.success('Finansal veriler başarıyla kaydedildi.', { id });
      setHasUnsavedChanges(false);
    }, 1000);
  };

  // Chart Data preparation
  const barChartData = [
    { name: 'Gelir', deger: watchAll.toplam_gelir },
    { name: 'Gider', deger: watchAll.toplam_gider },
  ];
  
  const pieChartData = [
    { name: 'Toplam Borç', value: watchAll.toplam_borc },
    { name: 'Özkaynaklar', value: Math.max(0, ozkaynak) },
  ];

  const nakitAkisChartData = watchAll.nakit_akis.map(item => ({
    name: item.ay.substring(0, 3),
    Giriş: item.giris,
    Çıkış: item.cikis,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 dark:bg-[#0d1425]/60 backdrop-blur-2xl p-5 rounded-[2.5rem] border border-white/10 dark:border-white/5 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] z-20">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0 h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{firma?.unvan || 'Yükleniyor...'}</h1>
              <Badge className="bg-blue-100 text-blue-800 border-none">Finansal Rapor</Badge>
            </div>
            {hasUnsavedChanges && (
              <p className="text-xs text-amber-600 dark:text-amber-500 font-medium flex items-center mt-1">
                <AlertTriangle className="w-3 h-3 mr-1" /> Kaydedilmemiş değişiklikler var
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select 
            defaultValue={form.getValues('donem')} 
            onValueChange={(val) => val && form.setValue('donem', val)}
          >
            <SelectTrigger className="w-[140px] h-10 font-medium">
              <SelectValue placeholder="Dönem Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023-Q4">2023 - Q4</SelectItem>
              <SelectItem value="2024-Q1">2024 - Q1</SelectItem>
              <SelectItem value="2024-Q2">2024 - Q2</SelectItem>
              <SelectItem value="2024-Yillik">2024 - Yıllık</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" /> Kaydet
          </Button>
        </div>
      </div>

      {/* MAIN SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* SOL PANEL - FORM & CHARTS (60%) */}
        <div className="lg:col-span-3 space-y-6">
          <Form {...form}>
            <form className="space-y-6">
              
              {/* Mali Veriler Kartı */}
              <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-500" /> Mali Veriler
                  </CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleOcr}
                    disabled={isOcrLoading}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                  >
                    {isOcrLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                    Belgeden Doldur
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  
                  {/* Gelir / Gider / Kar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="toplam_gelir" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Toplam Gelir (₺)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="toplam_gider" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Toplam Gider (₺)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormItem>
                      <FormLabel>Net Kar (₺)</FormLabel>
                      <Input 
                        value={netKar.toLocaleString('tr-TR')} 
                        readOnly 
                        className={netKar >= 0 ? 'bg-green-50 text-green-700 font-semibold' : 'bg-red-50 text-red-700 font-semibold'} 
                      />
                    </FormItem>
                  </div>

                  {/* Varlık / Borç / Özkaynak */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <FormField control={form.control} name="toplam_varlik" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Toplam Varlık (₺)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="toplam_borc" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Toplam Borç (₺)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormItem>
                      <FormLabel>Özkaynaklar (₺)</FormLabel>
                      <Input 
                        value={ozkaynak.toLocaleString('tr-TR')} 
                        readOnly 
                        className="bg-slate-50 font-semibold"
                      />
                    </FormItem>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <FormField control={form.control} name="nakit_ve_benzerleri" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nakit ve Benzerleri (₺)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="alis_satis_kosullari" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alış-Satış Koşulları / Vade Ortalama</FormLabel>
                        <FormControl><Textarea className="h-10 resize-none" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                </CardContent>
              </Card>

              {/* Nakit Akış Tablosu Kartı */}
              <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <CardTitle className="text-lg">Nakit Akış Tablosu</CardTitle>
                  <CardDescription>Aylık bazda şirkete giren ve çıkan nakit dengesi.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24 pl-6">Ay</TableHead>
                        <TableHead>Nakit Girişi (₺)</TableHead>
                        <TableHead>Nakit Çıkışı (₺)</TableHead>
                        <TableHead className="text-right pr-6">Net Akış</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const giris = form.watch(`nakit_akis.${index}.giris`);
                        const cikis = form.watch(`nakit_akis.${index}.cikis`);
                        const net = giris - cikis;
                        return (
                          <TableRow key={field.id}>
                            <TableCell className="font-medium pl-6">{AYLAR[index]}</TableCell>
                            <TableCell>
                              <Input type="number" className="h-8" {...form.register(`nakit_akis.${index}.giris`)} />
                            </TableCell>
                            <TableCell>
                              <Input type="number" className="h-8" {...form.register(`nakit_akis.${index}.cikis`)} />
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <span className={`font-semibold ${net > 0 ? 'text-green-600' : net < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                {net > 0 ? '+' : ''}{net.toLocaleString('tr-TR')}
                              </span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Gelir / Gider Özeti</CardTitle></CardHeader>
                  <CardContent className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip formatter={(val) => `₺${Number(val).toLocaleString('tr-TR')}`} />
                        <Bar dataKey="deger" radius={[4,4,0,0]}>
                          {barChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Borç / Özkaynak Dağılımı</CardTitle></CardHeader>
                  <CardContent className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieChartData} innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(val) => `₺${Number(val).toLocaleString('tr-TR')}`} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Aylık Nakit Akış Trendi</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={nakitAkisChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip formatter={(val) => `₺${Number(val).toLocaleString('tr-TR')}`} />
                      <Legend iconType="circle" />
                      <Line type="monotone" dataKey="Giriş" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Çıkış" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </form>
          </Form>
        </div>

        {/* SAĞ PANEL - AI ANALİZ (40%) */}
        <div className="lg:col-span-2">
          <AiAnalizPanel />
        </div>
      </div>

      {/* ALT BÖLÜM: BANKALAR, TAHSİLATLAR, PROJELER */}
      <div className="space-y-6 pt-6">
        <BankalarListesi />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TahsilatlarListesi />
          <ProjelerListesi />
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// YARDIMCI BİLEŞENLER
// -------------------------------------------------------------------------------------------------

function AiAnalizPanel() {
  const [analiz, setAnaliz] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analizTarihi, setAnalizTarihi] = useState<Date | null>(null);

  const generateAnaliz = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('Yapay zeka verileri analiz ediyor... Bu işlem 10-15 saniye sürebilir.');
    
    try {
      // Mocking AI Generation Delay
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      const mockResult = `### 📊 Finansal Durum Özeti
Firmanın güncel bilançosu incelendiğinde net kar marjının stabil olduğu görülmektedir. Toplam gelir ve gider dengesi olumlu bir nakit akışına işaret etmektedir.

#### 🎯 Öne Çıkan Tespitler
- **Nakit Likiditesi:** Firma yeterli nakit ve benzerleri rezervine sahip olup, kısa vadeli borç ödeme kapasitesi oldukça güçlüdür. Cari oran sektör standartlarının üzerindedir.
- **Borç/Özkaynak Oranı:** Oran sektör ortalamalarının altında seyretmekte olup, öz sermaye karlılığının yüksek olduğu gözlemlenmiştir. Risksiz bir büyüme stratejisi izlenmektedir.
- **Nakit Akış Trendi:** Yılın ilk çeyreğinde nakit girişlerinde gözlemlenen dalgalanmalar mevsimsel etkilere bağlanabilir. 

#### ⚠️ Risk Analizi ve Fırsatlar
Alış ve satış koşullarında belirtilen vadeler tahsilat risklerini minimal düzeyde tutmaktadır. 
*Stratejik Öneri:* Banka kredi limitlerinin boşta kalan kısımları, yeni teknoloji yatırımları için kullanılabilir. Devam eden projelerin hakediş ödemelerinin zamanında alınması nakit akışını daha da güçlendirecektir.`;

      setAnaliz(mockResult);
      setAnalizTarihi(new Date());
      toast.success('AI Analizi başarıyla oluşturuldu.', { id: toastId });
    } catch (error) {
      toast.error('Analiz oluşturulurken hata meydana geldi.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    window.print(); // Hackathon demo için basit PDF yazdırma yöntemi
  };

  return (
    <Card className="h-full border-blue-200 dark:border-blue-900 shadow-sm flex flex-col sticky top-16 bg-blue-50/30 dark:bg-blue-900/10">
      <CardHeader className="border-b border-blue-100 dark:border-blue-900/50 pb-4">
        <CardTitle className="text-xl flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <div className="p-2 bg-blue-600 text-white rounded-lg"><Brain className="w-5 h-5" /></div>
          AI Finansal Analiz
        </CardTitle>
        <CardDescription className="text-blue-600/80 dark:text-blue-400">
          Sisteme girilen güncel mali veriler üzerinden yapay zeka destekli durum değerlendirmesi.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 flex-1 flex flex-col">
        {!analiz && !isGenerating && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-blue-200 dark:border-blue-800">
            <Sparkles className="w-12 h-12 text-blue-300 mb-4" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Henüz analiz üretilmedi</h4>
            <p className="text-sm text-slate-500 mb-6">Mali verileri doldurduktan sonra analiz butonuna tıklayarak kapsamlı AI değerlendirmesi alabilirsiniz.</p>
          </div>
        )}

        {isGenerating && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Yapay Zeka Çalışıyor</h4>
            <p className="text-sm text-blue-600/70">Mali veriler, nakit akışı ve sektör ortalamaları karşılaştırılıyor...</p>
          </div>
        )}

        {analiz && !isGenerating && (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-medium text-slate-500">
                Son analiz: {analizTarihi ? format(analizTarihi, 'dd.MM.yyyy HH:mm') : ''}
              </span>
              <Button variant="ghost" size="sm" onClick={handleDownloadPdf} className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                <Download className="w-3 h-3 mr-1" /> PDF İndir
              </Button>
            </div>
            <div className="prose prose-sm dark:prose-invert prose-blue max-w-none flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
              <ReactMarkdown>{analiz}</ReactMarkdown>
            </div>
          </div>
        )}

        <Button 
          onClick={generateAnaliz} 
          disabled={isGenerating}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md border-0 h-12 text-base"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
          AI Analiz Üret
        </Button>
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------------------------------------------

function BankalarListesi() {
  const bankalar = [
    { id: 1, ad: 'Garanti BBVA', hesap: 'TR98 0006 2000 0001 2345 6789', bakiye: 1250000, limit: 5000000, kullanim: 250000 },
    { id: 2, ad: 'Yapı Kredi', hesap: 'TR12 0006 7000 0001 2345 6789', bakiye: 450000, limit: 2000000, kullanim: 1500000 },
    { id: 3, ad: 'İş Bankası', hesap: 'TR45 0006 4000 0001 2345 6789', bakiye: 80000, limit: 1000000, kullanim: 900000 },
  ];

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" /> Bankalar & Kredi Limitleri
        </CardTitle>
        <Button size="sm" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
          <PlusCircle className="w-4 h-4 mr-2" /> Banka Ekle
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bankalar.map((banka) => {
            const oran = (banka.kullanim / banka.limit) * 100;
            return (
              <div key={banka.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-white dark:bg-slate-900/50 relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600"><Edit2 className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></Button>
                </div>
                <h4 className="font-bold text-lg mb-1">{banka.ad}</h4>
                <p className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mb-4">{banka.hesap}</p>
                
                <div className="mb-5">
                  <div className="text-sm text-slate-500 mb-1">Mevcut Bakiye</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">₺{banka.bakiye.toLocaleString('tr-TR')}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Kredi Kullanımı</span>
                    <span>₺{banka.kullanim.toLocaleString('tr-TR')} / ₺{banka.limit.toLocaleString('tr-TR')}</span>
                  </div>
                  <Progress value={oran} className="h-2" />
                  <div className="text-right text-[10px] text-slate-400">%{oran.toFixed(1)} Doluluk</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------------------------------------------

function TahsilatlarListesi() {
  const bekleyen = [
    { id: 1, tutar: 250000, aciklama: 'A Firması Danışmanlık Bedeli', vade: '2024-06-15', durum: 'bekliyor' },
    { id: 2, tutar: 75000, aciklama: 'B Firması Raporlama', vade: '2024-05-10', durum: 'gecikti' },
  ];
  
  const yapilan = [
    { id: 3, tutar: 120000, aciklama: 'C Firması Sistem Kurulumu', vade: '2024-04-20', durum: 'odendi' },
  ];

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-500" /> Tahsilatlar
        </CardTitle>
        <Button size="sm" variant="outline"><PlusCircle className="w-4 h-4 mr-2" /> Ekle</Button>
      </CardHeader>
      <CardContent className="pt-0 p-0">
        <Tabs defaultValue="bekleyen" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 h-12 px-4">
            <TabsTrigger value="bekleyen">Bekleyen Tahsilatlar</TabsTrigger>
            <TabsTrigger value="yapilan">Yapılan Tahsilatlar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bekleyen" className="p-0 m-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Açıklama</TableHead>
                  <TableHead>Vade</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bekleyen.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium pl-6">{t.aciklama}</TableCell>
                    <TableCell>{format(new Date(t.vade), 'dd.MM.yyyy')}</TableCell>
                    <TableCell className="font-semibold">₺{t.tutar.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>
                      {t.durum === 'gecikti' 
                        ? <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400">Gecikti</Badge>
                        : <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-400">Bekliyor</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50"><CheckCircle2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="yapilan" className="p-0 m-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Açıklama</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yapilan.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium pl-6">{t.aciklama}</TableCell>
                    <TableCell>{format(new Date(t.vade), 'dd.MM.yyyy')}</TableCell>
                    <TableCell className="font-semibold">₺{t.tutar.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-400">Ödendi</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// -------------------------------------------------------------------------------------------------

function ProjelerListesi() {
  const projeler = [
    { id: 1, ad: 'ERP Geçiş Süreci', baslangic: '2024-01-01', bitis: '2024-08-30', tutar: 850000, durum: 'devam' },
    { id: 2, ad: 'Üretim Bandı Yenileme', baslangic: '2024-03-15', bitis: '2024-12-15', tutar: 2500000, durum: 'devam' },
    { id: 3, ad: 'Web Sitesi Altyapısı', baslangic: '2023-11-01', bitis: '2024-02-15', tutar: 150000, durum: 'tamamlandi' },
  ];

  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" /> Devam Eden / Tamamlanan Projeler
        </CardTitle>
        <Button size="sm" variant="outline"><PlusCircle className="w-4 h-4 mr-2" /> Ekle</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead className="pl-6">Proje Adı</TableHead>
              <TableHead>Süreç</TableHead>
              <TableHead>Bütçe</TableHead>
              <TableHead>Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projeler.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium pl-6">{p.ad}</TableCell>
                <TableCell className="text-xs text-slate-500">
                  {format(new Date(p.baslangic), 'MMM yy', { locale: tr })} - {format(new Date(p.bitis), 'MMM yy', { locale: tr })}
                </TableCell>
                <TableCell className="font-semibold">₺{p.tutar.toLocaleString('tr-TR')}</TableCell>
                <TableCell>
                  {p.durum === 'devam' 
                    ? <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200">Devam Ediyor</Badge>
                    : <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-300">Tamamlandı</Badge>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
